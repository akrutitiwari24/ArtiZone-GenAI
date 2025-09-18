const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('profile.firstName').optional().notEmpty().trim(),
  body('profile.lastName').optional().notEmpty().trim(),
  body('profile.bio').optional().isLength({ max: 500 }),
  body('profile.location.city').optional().trim(),
  body('profile.location.state').optional().trim(),
  body('profile.location.country').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/artisan-profile
// @desc    Update artisan-specific profile
// @access  Private (Artisan only)
router.put('/artisan-profile', auth, authorize('artisan'), async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { artisanProfile: updates } },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update artisan profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/vendor-profile
// @desc    Update vendor-specific profile
// @access  Private (Vendor only)
router.put('/vendor-profile', auth, authorize('vendor'), async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { vendorProfile: updates } },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/customer-profile
// @desc    Update customer-specific profile
// @access  Private (Customer only)
router.put('/customer-profile', auth, authorize('customer'), async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { customerProfile: updates } },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update customer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/artisans
// @desc    Get all artisans with filters
// @access  Public
router.get('/artisans', async (req, res) => {
  try {
    const { 
      specialty, 
      location, 
      minRating, 
      experience, 
      page = 1, 
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { role: 'artisan', isActive: true };
    
    if (specialty) {
      query['artisanProfile.specialties'] = { $in: specialty.split(',') };
    }
    
    if (location) {
      query['profile.location.city'] = new RegExp(location, 'i');
    }
    
    if (minRating) {
      query['artisanProfile.ratings.average'] = { $gte: parseFloat(minRating) };
    }
    
    if (experience) {
      query['artisanProfile.experience'] = { $gte: parseInt(experience) };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const artisans = await User.find(query)
      .select('-password -email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('artisanProfile.portfolio');

    const total = await User.countDocuments(query);

    res.json({
      artisans,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get artisans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/vendors
// @desc    Get all vendors with filters
// @access  Public
router.get('/vendors', async (req, res) => {
  try {
    const { 
      businessType, 
      location, 
      minRating, 
      page = 1, 
      limit = 12 
    } = req.query;

    const query = { role: 'vendor', isActive: true };
    
    if (businessType) {
      query['vendorProfile.businessType'] = businessType;
    }
    
    if (location) {
      query['profile.location.city'] = new RegExp(location, 'i');
    }
    
    if (minRating) {
      query['vendorProfile.vendorRating.average'] = { $gte: parseFloat(minRating) };
    }

    const vendors = await User.find(query)
      .select('-password -email')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      vendors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', auth, async (req, res) => {
  try {
    // This would integrate with Cloudinary or similar service
    // For now, we'll just return a placeholder
    const avatarUrl = `https://via.placeholder.com/200x200/8B7355/FFFFFF?text=${req.user.profile.firstName.charAt(0)}`;
    
    await User.findByIdAndUpdate(req.user._id, {
      'profile.avatar': avatarUrl
    });

    res.json({ avatarUrl });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
