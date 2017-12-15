const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: String,
  password: String,
  userName: String
});

module.exports = mongoose.model('Users', userSchema);
