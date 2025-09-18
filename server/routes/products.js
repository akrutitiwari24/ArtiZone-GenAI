const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filters and search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      artisan, 
      minPrice, 
      maxPrice, 
      materials, 
      colors,
      search,
      page = 1, 
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (artisan) {
      query.artisan = artisan;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (materials) {
      query.materials = { $in: materials.split(',') };
    }
    
    if (colors) {
      query.colors = { $in: colors.split(',') };
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('artisan', 'profile artisanProfile')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('artisan', 'profile artisanProfile')
      .populate('reviews.user', 'profile');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Artisan only)
router.post('/', auth, authorize('artisan'), [
  body('title').notEmpty().trim(),
  body('description').notEmpty(),
  body('category').isIn(['pottery', 'jewelry', 'textiles', 'woodwork', 'metalwork', 'glass', 'leather', 'ceramics', 'sculpture', 'other']),
  body('price').isNumeric().isFloat({ min: 0 }),
  body('materials').isArray(),
  body('images').isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productData = {
      ...req.body,
      artisan: req.user._id
    };

    const product = new Product(productData);
    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('artisan', 'profile artisanProfile');

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Artisan only - own products)
router.put('/:id', auth, authorize('artisan'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.artisan.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('artisan', 'profile artisanProfile');

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Artisan only - own products)
router.delete('/:id', auth, authorize('artisan'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.artisan.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Add product review
// @access  Private
router.post('/:id/reviews', auth, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = {
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
      images: req.body.images || []
    };

    product.reviews.push(review);

    // Update rating statistics
    const totalReviews = product.reviews.length;
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.ratings.average = totalRating / totalReviews;
    product.ratings.count = totalReviews;

    // Update rating breakdown
    product.ratings.breakdown = {
      five: product.reviews.filter(r => r.rating === 5).length,
      four: product.reviews.filter(r => r.rating === 4).length,
      three: product.reviews.filter(r => r.rating === 3).length,
      two: product.reviews.filter(r => r.rating === 2).length,
      one: product.reviews.filter(r => r.rating === 1).length
    };

    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('reviews.user', 'profile');

    res.json(populatedProduct);
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products/:id/favorite
// @desc    Toggle product favorite
// @access  Private
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const isFavorited = product.favorites.includes(req.user._id);
    
    if (isFavorited) {
      product.favorites.pull(req.user._id);
    } else {
      product.favorites.push(req.user._id);
    }

    await product.save();

    res.json({ 
      isFavorited: !isFavorited,
      favoritesCount: product.favorites.length 
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('artisan', 'profile artisanProfile')
      .sort({ createdAt: -1 })
      .limit(8);

    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
