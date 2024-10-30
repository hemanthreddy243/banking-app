const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { register, login } = require('../controllers/authController');
const { transfer, getBalance } = require('../controllers/accountController'); // Ensure this line is present

const router = express.Router();

// User registration route
router.post('/register', register);

// User login route
router.post('/login', login);

// Route to get account balance (requires authentication)
router.get('/balance', authenticateToken, getBalance);

// Route to transfer funds (requires authentication)
router.post('/transfer', authenticateToken, transfer);

module.exports = router;
