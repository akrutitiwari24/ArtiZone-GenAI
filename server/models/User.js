const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['artisan', 'vendor', 'customer'],
    required: true
  },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatar: { type: String },
    bio: { type: String },
    location: {
      city: String,
      state: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    phone: String,
    website: String,
    socialMedia: {
      instagram: String,
      facebook: String,
      twitter: String
    }
  },
  // Artisan-specific fields
  artisanProfile: {
    story: String, // AI-transcribed audio story
    audioStoryUrl: String,
    specialties: [String], // e.g., ['pottery', 'jewelry', 'textiles']
    experience: Number, // years of experience
    certifications: [String],
    portfolio: [{
      title: String,
      description: String,
      imageUrl: String,
      category: String,
      price: Number,
      isAvailable: { type: Boolean, default: true }
    }],
    pricingPreferences: {
      hourlyRate: Number,
      customPricing: Boolean,
      bulkDiscounts: Boolean
    },
    availability: {
      isAvailable: { type: Boolean, default: true },
      workingHours: String,
      timezone: String
    },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    }
  },
  // Vendor-specific fields
  vendorProfile: {
    businessName: String,
    businessType: String, // 'retailer', 'wholesaler', 'distributor'
    taxId: String,
    businessLicense: String,
    preferredArtisanTypes: [String],
    bulkOrderPreferences: {
      minOrderValue: Number,
      preferredCategories: [String],
      contractTerms: String
    },
    vendorRating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    }
  },
  // Customer-specific fields
  customerProfile: {
    preferences: {
      favoriteCategories: [String],
      priceRange: {
        min: Number,
        max: Number
      },
      preferredArtisans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
