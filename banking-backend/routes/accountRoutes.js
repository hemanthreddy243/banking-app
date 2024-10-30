const Account = require('../models/Account');  // Assuming Account model is defined
const Transaction = require('../models/Transaction');  // For logging transactions
const express = require('express');
const router = express.Router();

// Define routes here
module.exports = router;

// Controller to handle balance inquiry
exports.getBalance = async (req, res) => {
  try {
    const account = await Account.findOne({ userId: req.user.userId });  // Assuming userId is stored in JWT
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json({ balance: account.balance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Controller to handle fund transfers
exports.transfer = async (req, res) => {
  const { fromAccount, toAccount, amount } = req.body;

  try {
    // Find both accounts involved in the transfer
    const senderAccount = await Account.findOne({ accountNumber: fromAccount });
    const receiverAccount = await Account.findOne({ accountNumber: toAccount });

    // Check if both accounts exist
    if (!senderAccount || !receiverAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Check if sender has enough balance
    if (senderAccount.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Perform the transfer
    senderAccount.balance -= amount;
    receiverAccount.balance += amount;

    await senderAccount.save();
    await receiverAccount.save();

    // Log the transaction
    const transaction = new Transaction({
      fromAccount: senderAccount.accountNumber,
      toAccount: receiverAccount.accountNumber,
      amount,
      date: new Date(),
    });
    await transaction.save();

    // Send a real-time update to the frontend (if using Socket.IO)
    // io.emit('transactionUpdate', { fromAccount, toAccount, amount });

    res.json({ message: 'Transfer successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
