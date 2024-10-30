const Account = require('../models/Account');  // Assuming Account model is defined
const Transaction = require('../models/Transaction');  // For logging transactions
const mongoose = require('mongoose');  // For handling MongoDB transactions

// Controller to handle balance inquiry
exports.getBalance = async (req, res) => {
  try {
    // Find the account based on userId attached to the request from the authentication middleware
    const account = await Account.findOne({ userId: req.user.userId });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    // Return the balance
    res.json({ balance: account.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Controller to handle fund transfers
exports.transfer = async (req, res) => {
  const { fromAccount, toAccount, amount } = req.body;

  // Ensure the amount is valid
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid transfer amount' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();  // Start a MongoDB transaction
  try {
    // Find both the sender and receiver accounts in the same transaction session
    const senderAccount = await Account.findOne({ accountNumber: fromAccount }).session(session);
    const receiverAccount = await Account.findOne({ accountNumber: toAccount }).session(session);

    // Check if both accounts exist
    if (!senderAccount || !receiverAccount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'One or both accounts not found' });
    }

    // Check if sender has enough balance
    if (senderAccount.balance < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Perform the transfer by updating balances
    senderAccount.balance -= amount;
    receiverAccount.balance += amount;

    // Save the updated accounts in the same transaction session
    await senderAccount.save({ session });
    await receiverAccount.save({ session });

    // Log the transaction in the same session
    const transaction = new Transaction({
      fromAccount: senderAccount.accountNumber,
      toAccount: receiverAccount.accountNumber,
      amount,
      date: new Date(),
    });
    await transaction.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Optionally send a real-time update to the frontend (e.g., using Socket.IO)
    // io.emit('transactionUpdate', { fromAccount, toAccount, amount });

    // Send a success response
    res.json({
      message: 'Transfer successful',
      senderBalance: senderAccount.balance,
      receiverBalance: receiverAccount.balance,
    });
  } catch (error) {
    await session.abortTransaction();  // Rollback the transaction on error
    session.endSession();
    console.error(error);
    res.status(500).json({ message: 'Server error during transfer', error });
  }
};
