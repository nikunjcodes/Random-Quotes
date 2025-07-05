const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  text: String,
  author: String,
  favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Quote', quoteSchema);