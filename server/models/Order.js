const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    customizations: [{
      option: String,
      value: String,
      priceModifier: Number
    }]
  }],
  pricing: {
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  shipping: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    method: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  payment: {
    method: String,
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  notes: {
    customer: String,
    artisan: String,
    internal: String
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ART-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Update timestamp
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
