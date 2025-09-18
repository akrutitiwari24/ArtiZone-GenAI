const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', auth, [
  body('items').isArray({ min: 1 }),
  body('items.*.product').isMongoId(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('shipping.address').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, shipping } = req.body;
    
    // Calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      if (!product.availability.inStock) {
        return res.status(400).json({ message: `Product ${product.title} is out of stock` });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        customizations: item.customizations || []
      });
    }

    // Get artisan from first product
    const firstProduct = await Product.findById(items[0].product);
    const artisan = firstProduct.artisan;

    // Calculate shipping (simplified)
    const shippingCost = subtotal > 100 ? 0 : 15; // Free shipping over $100
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shippingCost + tax;

    const order = new Order({
      customer: req.user._id,
      artisan,
      items: orderItems,
      pricing: {
        subtotal,
        shipping: shippingCost,
        tax,
        total
      },
      shipping,
      status: 'pending',
      timeline: [{
        status: 'pending',
        note: 'Order created'
      }]
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'profile')
      .populate('artisan', 'profile')
      .populate('items.product');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'artisan') {
      query.artisan = req.user._id;
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('customer', 'profile')
      .populate('artisan', 'profile')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'profile')
      .populate('artisan', 'profile')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    const hasAccess = order.customer._id.toString() === req.user._id.toString() ||
                     order.artisan._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Artisan only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is the artisan for this order
    if (order.artisan.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.status = status;
    order.timeline.push({
      status,
      note: note || `Status updated to ${status}`
    });

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'profile')
      .populate('artisan', 'profile')
      .populate('items.product');

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/payment
// @desc    Update payment status
// @access  Private
router.put('/:id/payment', auth, async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    const hasAccess = order.customer._id.toString() === req.user._id.toString() ||
                     order.artisan._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.payment.status = paymentStatus;
    if (transactionId) {
      order.payment.transactionId = transactionId;
    }
    if (paymentStatus === 'paid') {
      order.payment.paidAt = new Date();
    }

    await order.save();

    res.json({ message: 'Payment status updated successfully' });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
