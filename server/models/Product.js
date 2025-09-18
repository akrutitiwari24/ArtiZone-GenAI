const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['pottery', 'jewelry', 'textiles', 'woodwork', 'metalwork', 'glass', 'leather', 'ceramics', 'sculpture', 'other']
  },
  subcategory: String,
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: Number, // For showing discounts
  currency: {
    type: String,
    default: 'USD'
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, default: 'cm' }
  },
  weight: {
    value: Number,
    unit: { type: String, default: 'g' }
  },
  materials: [String],
  techniques: [String],
  colors: [String],
  tags: [String],
  availability: {
    inStock: { type: Boolean, default: true },
    quantity: { type: Number, default: 1 },
    isCustomizable: { type: Boolean, default: false },
    customOptions: [{
      name: String,
      type: { type: String, enum: ['text', 'color', 'size', 'material'] },
      options: [String],
      priceModifier: { type: Number, default: 0 }
    }]
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    shippingCost: Number,
    freeShippingThreshold: Number,
    estimatedDelivery: String,
    shippingRestrictions: [String]
  },
  aiSuggestions: {
    suggestedPrice: Number,
    confidence: Number,
    reasoning: String,
    marketAnalysis: {
      similarProducts: [{
        title: String,
        price: Number,
        source: String
      }],
      priceRange: {
        min: Number,
        max: Number,
        average: Number
      }
    }
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    breakdown: {
      five: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      three: { type: Number, default: 0 },
      two: { type: Number, default: 0 },
      one: { type: Number, default: 0 }
    }
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    images: [String],
    createdAt: { type: Date, default: Date.now }
  }],
  views: { type: Number, default: 0 },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ artisan: 1 });

module.exports = mongoose.model('Product', productSchema);
