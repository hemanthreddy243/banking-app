const express = require('express'); 
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const cors = require('cors');  // If needed for cross-origin requests
const accountRoutes = require('./routes/accountRoutes');
const authRoutes = require('./routes/authRoutes');  // Assuming you have auth routes

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",  // Allow all origins; replace with specific domain in production
    methods: ["GET", "POST"],
  }
});

// Middleware
app.use(express.json());
app.use(cors());  // Enable CORS if requests come from a different origin

// Routes
app.use('/api/accounts', accountRoutes);
app.use('/api/auth', authRoutes);  // Include auth routes

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.IO connection for real-time features
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Real-time transaction notification example
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Real-time transaction notification function
const notifyTransaction = (data) => {
  io.emit('transactionUpdate', data);  // Broadcasts transaction updates to all clients
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
