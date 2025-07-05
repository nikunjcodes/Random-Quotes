const express = require('express');
const axios = require('axios');
const Quote = require('../models/Quote');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Fetch quotes from external API
router.get('/fetch', auth, async (req, res) => {
  try {
    const response = await axios.get('https://api.api-ninjas.com/v1/quotes', {
      headers: {
        'X-Api-Key': process.env.API_NINJAS_KEY || 'your-api-key-here'
      }
    });
    
    const externalQuote = response.data[0];
    
    // Check if quote already exists in our database
    let quote = await Quote.findOne({ 
      text: externalQuote.quote,
      author: externalQuote.author 
    });
    
    if (!quote) {
      // Save new quote to database
      quote = new Quote({
        text: externalQuote.quote,
        author: externalQuote.author,
        category: externalQuote.category,
        favoritedBy: []
      });
      await quote.save();
    }
    
    // Check if current user has favorited this quote
    const isFavorited = quote.favoritedBy.includes(req.user.id);
    
    res.json({
      ...quote.toObject(),
      isFavorited
    });
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ message: 'Failed to fetch quote' });
  }
});

// Get all quotes with favorite status
router.get('/', auth, async (req, res) => {
  try {
    const quotes = await Quote.find().lean();
    const userId = req.user.id;
    
    const modified = quotes.map(q => ({
      ...q,
      isFavorited: q.favoritedBy?.some(u => u.toString() === userId)
    }));
    
    res.json(modified);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ message: 'Failed to fetch quotes' });
  }
});

// Get user's favorite quotes
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json(user.favorites || []);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
});

// Toggle favorite status
router.post('/favorite/:id', auth, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }
    
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    const quoteIndex = quote.favoritedBy.findIndex(u => u.toString() === userId);
    const userFavoriteIndex = user.favorites.findIndex(q => q.toString() === req.params.id);
    
    if (quoteIndex > -1) {
      // Remove from favorites
      quote.favoritedBy.splice(quoteIndex, 1);
      if (userFavoriteIndex > -1) {
        user.favorites.splice(userFavoriteIndex, 1);
      }
    } else {
      // Add to favorites
      quote.favoritedBy.push(userId);
      if (userFavoriteIndex === -1) {
        user.favorites.push(req.params.id);
      }
    }
    
    await Promise.all([quote.save(), user.save()]);
    
    res.json({ 
      success: true, 
      isFavorited: quoteIndex === -1 
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Failed to toggle favorite' });
  }
});

module.exports = router;
