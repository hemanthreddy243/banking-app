const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accountNumber: {
    type: String,
    unique: true,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,   // Default balance for a new account
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Account', accountSchema);
