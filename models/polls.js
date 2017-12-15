const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  userId: String,
  pollTitle: String,
  options: Object,
  votes: Number
});

module.exports = mongoose.model('Polls', pollSchema);
