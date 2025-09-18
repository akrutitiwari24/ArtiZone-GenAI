const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['exhibition', 'workshop', 'market', 'competition', 'networking', 'online'],
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['physical', 'online', 'hybrid'],
      default: 'physical'
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    onlineLink: String,
    platform: String // 'zoom', 'google_meet', 'custom', etc.
  },
  schedule: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timezone: { type: String, default: 'UTC' },
    duration: Number, // in minutes
    recurring: {
      isRecurring: { type: Boolean, default: false },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
      interval: Number,
      endDate: Date
    }
  },
  capacity: {
    maxAttendees: Number,
    currentAttendees: { type: Number, default: 0 },
    isWaitlist: { type: Boolean, default: false }
  },
  pricing: {
    isFree: { type: Boolean, default: false },
    price: Number,
    currency: { type: String, default: 'USD' },
    earlyBirdPrice: Number,
    earlyBirdEndDate: Date,
    groupDiscounts: [{
      minGroupSize: Number,
      discountPercentage: Number
    }]
  },
  categories: [String], // ['pottery', 'jewelry', 'textiles', etc.]
  tags: [String],
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  requirements: {
    skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'all'] },
    materials: [String],
    tools: [String],
    prerequisites: [String]
  },
  attendees: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registeredAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['registered', 'attended', 'cancelled'], default: 'registered' },
    notes: String
  }],
  featuredArtisans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sponsors: [{
    name: String,
    logo: String,
    website: String,
    contribution: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ 'schedule.startDate': 1 });
eventSchema.index({ type: 1, categories: 1 });

module.exports = mongoose.model('Event', eventSchema);
