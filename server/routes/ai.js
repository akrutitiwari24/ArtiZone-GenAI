const express = require('express');
const OpenAI = require('openai');
const Product = require('../models/Product');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @route   POST /api/ai/transcribe-audio
// @desc    Transcribe audio story to text
// @access  Private
router.post('/transcribe-audio', auth, async (req, res) => {
  try {
    const { audioUrl } = req.body;
    
    if (!audioUrl) {
      return res.status(400).json({ message: 'Audio URL is required' });
    }

    // For demo purposes, we'll simulate transcription
    // In production, you would use OpenAI Whisper API or similar
    const mockTranscription = `I've been crafting pottery for over 15 years, learning the art from my grandmother who taught me the traditional techniques passed down through generations. Each piece I create tells a story of our heritage and the beauty of handmade craftsmanship.`;

    res.json({ 
      transcription: mockTranscription,
      confidence: 0.95 
    });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ message: 'Server error during transcription' });
  }
});

// @route   POST /api/ai/suggest-price
// @desc    Get AI-powered pricing suggestions
// @access  Private (Artisan only)
router.post('/suggest-price', auth, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      materials, 
      dimensions, 
      techniques,
      artisanExperience 
    } = req.body;

    // Find similar products for market analysis
    const similarProducts = await Product.find({
      category,
      materials: { $in: materials },
      isActive: true
    }).limit(10);

    const marketPrices = similarProducts.map(p => p.price);
    const avgPrice = marketPrices.reduce((sum, price) => sum + price, 0) / marketPrices.length;
    const minPrice = Math.min(...marketPrices);
    const maxPrice = Math.max(...marketPrices);

    // Generate AI pricing suggestion
    const prompt = `
    Analyze this handmade product and suggest a fair price:
    
    Title: ${title}
    Description: ${description}
    Category: ${category}
    Materials: ${materials.join(', ')}
    Dimensions: ${dimensions}
    Techniques: ${techniques.join(', ')}
    Artisan Experience: ${artisanExperience} years
    
    Market Analysis:
    - Average similar product price: $${avgPrice.toFixed(2)}
    - Price range: $${minPrice} - $${maxPrice}
    
    Consider factors like:
    - Material costs
    - Time investment
    - Skill level
    - Market demand
    - Uniqueness
    
    Provide a suggested price with reasoning.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert pricing consultant for handmade artisan products. Provide fair, market-appropriate pricing suggestions with clear reasoning."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Extract suggested price from response (simple regex)
    const priceMatch = aiResponse.match(/\$(\d+(?:\.\d{2})?)/);
    const suggestedPrice = priceMatch ? parseFloat(priceMatch[1]) : avgPrice;

    res.json({
      suggestedPrice,
      confidence: 0.85,
      reasoning: aiResponse,
      marketAnalysis: {
        averagePrice: avgPrice,
        priceRange: { min: minPrice, max: maxPrice },
        similarProducts: similarProducts.length
      }
    });
  } catch (error) {
    console.error('Price suggestion error:', error);
    res.status(500).json({ message: 'Server error during price analysis' });
  }
});

// @route   POST /api/ai/generate-content
// @desc    Generate marketing content for products
// @access  Private
router.post('/generate-content', auth, async (req, res) => {
  try {
    const { 
      productTitle, 
      productDescription, 
      category, 
      materials,
      contentType = 'social_media' // social_media, product_description, marketing_copy
    } = req.body;

    let prompt = '';
    
    switch (contentType) {
      case 'social_media':
        prompt = `Create engaging social media posts for this handmade product:
        Title: ${productTitle}
        Description: ${productDescription}
        Category: ${category}
        Materials: ${materials.join(', ')}
        
        Create 3 different social media posts (Instagram, Facebook, Twitter) that highlight the craftsmanship and story behind this product.`;
        break;
      case 'product_description':
        prompt = `Write compelling product descriptions for this handmade item:
        Title: ${productTitle}
        Current Description: ${productDescription}
        Category: ${category}
        Materials: ${materials.join(', ')}
        
        Create 3 different product descriptions that appeal to different customer segments.`;
        break;
      case 'marketing_copy':
        prompt = `Create marketing copy for this artisan product:
        Title: ${productTitle}
        Description: ${productDescription}
        Category: ${category}
        Materials: ${materials.join(', ')}
        
        Generate email marketing copy, website banner text, and promotional content.`;
        break;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a creative marketing copywriter specializing in handmade artisan products. Create engaging, authentic content that tells the story of craftsmanship."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500
    });

    res.json({
      content: completion.choices[0].message.content,
      contentType,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ message: 'Server error during content generation' });
  }
});

// @route   GET /api/ai/recommendations/:userId
// @desc    Get AI-powered recommendations for user
// @access  Private
router.get('/recommendations/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let recommendations = [];

    if (user.role === 'customer') {
      // Product recommendations for customers
      const favoriteCategories = user.customerProfile?.preferences?.favoriteCategories || [];
      const priceRange = user.customerProfile?.preferences?.priceRange || { min: 0, max: 1000 };
      
      recommendations = await Product.find({
        category: { $in: favoriteCategories },
        price: { $gte: priceRange.min, $lte: priceRange.max },
        isActive: true
      })
      .populate('artisan', 'profile artisanProfile')
      .sort({ 'ratings.average': -1, views: -1 })
      .limit(8);

    } else if (user.role === 'vendor') {
      // Artisan recommendations for vendors
      const preferredTypes = user.vendorProfile?.preferredArtisanTypes || [];
      
      recommendations = await User.find({
        role: 'artisan',
        'artisanProfile.specialties': { $in: preferredTypes },
        'artisanProfile.ratings.average': { $gte: 4.0 },
        isActive: true
      })
      .select('-password -email')
      .limit(8);

    } else if (user.role === 'artisan') {
      // Collaboration recommendations for artisans
      const specialties = user.artisanProfile?.specialties || [];
      
      recommendations = await User.find({
        role: 'vendor',
        'vendorProfile.preferredArtisanTypes': { $in: specialties },
        'vendorProfile.vendorRating.average': { $gte: 4.0 },
        isActive: true
      })
      .select('-password -email')
      .limit(8);
    }

    res.json({
      recommendations,
      type: user.role === 'customer' ? 'products' : 'users',
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Server error during recommendations' });
  }
});

// @route   POST /api/ai/mentorship-match
// @desc    Find mentorship matches (apprentices ↔ master artisans)
// @access  Private
router.post('/mentorship-match', auth, async (req, res) => {
  try {
    const { 
      seekerType, // 'apprentice' or 'mentor'
      specialty,
      location,
      experienceLevel 
    } = req.body;

    let matches = [];

    if (seekerType === 'apprentice') {
      // Find master artisans who can mentor
      matches = await User.find({
        role: 'artisan',
        'artisanProfile.specialties': { $in: specialty },
        'artisanProfile.experience': { $gte: 5 },
        'artisanProfile.ratings.average': { $gte: 4.5 },
        isActive: true
      })
      .select('-password -email')
      .limit(5);

    } else if (seekerType === 'mentor') {
      // Find apprentices who need mentoring
      matches = await User.find({
        role: 'artisan',
        'artisanProfile.specialties': { $in: specialty },
        'artisanProfile.experience': { $lte: 2 },
        isActive: true
      })
      .select('-password -email')
      .limit(5);
    }

    res.json({
      matches,
      seekerType,
      specialty,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Mentorship match error:', error);
    res.status(500).json({ message: 'Server error during mentorship matching' });
  }
});

module.exports = router;
