const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      type, 
      category, 
      location, 
      startDate, 
      endDate,
      page = 1, 
      limit = 12,
      sortBy = 'schedule.startDate',
      sortOrder = 'asc'
    } = req.query;

    let query = { status: 'published' };
    
    if (type) {
      query.type = type;
    }
    
    if (category) {
      query.categories = { $in: category.split(',') };
    }
    
    if (location) {
      query['location.address.city'] = new RegExp(location, 'i');
    }
    
    if (startDate || endDate) {
      query['schedule.startDate'] = {};
      if (startDate) query['schedule.startDate'].$gte = new Date(startDate);
      if (endDate) query['schedule.startDate'].$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const events = await Event.find(query)
      .populate('organizer', 'profile')
      .populate('featuredArtisans', 'profile artisanProfile')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'profile')
      .populate('featuredArtisans', 'profile artisanProfile')
      .populate('attendees.user', 'profile');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private
router.post('/', auth, [
  body('title').notEmpty().trim(),
  body('description').notEmpty(),
  body('type').isIn(['exhibition', 'workshop', 'market', 'competition', 'networking', 'online']),
  body('schedule.startDate').isISO8601(),
  body('schedule.endDate').isISO8601(),
  body('location.type').isIn(['physical', 'online', 'hybrid'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      organizer: req.user._id
    };

    const event = new Event(eventData);
    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'profile');

    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Organizer only)
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'profile');

    res.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/register
// @desc    Register for event
// @access  Private
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ message: 'Event is not available for registration' });
    }

    // Check if user is already registered
    const existingRegistration = event.attendees.find(
      attendee => attendee.user.toString() === req.user._id.toString()
    );

    if (existingRegistration) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Check capacity
    if (event.capacity.maxAttendees && 
        event.attendees.length >= event.capacity.maxAttendees) {
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    event.attendees.push({
      user: req.user._id,
      status: 'registered',
      notes: req.body.notes || ''
    });

    event.capacity.currentAttendees = event.attendees.length;
    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate('attendees.user', 'profile');

    res.json({ 
      message: 'Successfully registered for event',
      event: updatedEvent 
    });
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id/register
// @desc    Cancel event registration
// @access  Private
router.delete('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const attendeeIndex = event.attendees.findIndex(
      attendee => attendee.user.toString() === req.user._id.toString()
    );

    if (attendeeIndex === -1) {
      return res.status(400).json({ message: 'You are not registered for this event' });
    }

    event.attendees.splice(attendeeIndex, 1);
    event.capacity.currentAttendees = event.attendees.length;
    await event.save();

    res.json({ message: 'Successfully cancelled event registration' });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/featured
// @desc    Get featured events
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const events = await Event.find({ 
      isFeatured: true, 
      status: 'published',
      'schedule.startDate': { $gte: new Date() }
    })
      .populate('organizer', 'profile')
      .populate('featuredArtisans', 'profile artisanProfile')
      .sort({ 'schedule.startDate': 1 })
      .limit(6);

    res.json(events);
  } catch (error) {
    console.error('Get featured events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
