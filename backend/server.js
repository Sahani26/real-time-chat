require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// Configure allowed origins from environment variables
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000']; // Default to localhost for development

// Enhanced CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'], // Enable both transports
  allowEIO3: true // For Socket.IO v2 client compatibility
});

// MongoDB Connection with enhanced options
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit process if DB connection fails
});

// Socket.IO Connection with error handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a room
  socket.on('join_room', (room) => {
    if (typeof room !== 'string') {
      return socket.emit('error', 'Invalid room format');
    }
    
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
    
    // Send previous messages in the room
    Message.find({ room })
      .sort({ createdAt: 1 })
      .then(messages => {
        socket.emit('previous_messages', messages);
      })
      .catch(err => {
        console.error('Error fetching messages:', err);
        socket.emit('error', 'Failed to load messages');
      });
  });

  // Handle new messages with validation
  socket.on('send_message', async (data) => {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid message format');
      }
      
      const { user, text, room } = data;
      
      if (!user || !text || !room) {
        throw new Error('Missing required fields');
      }
      
      // Save message to database
      const message = new Message({ 
        user: user.toString().substring(0, 50), // Basic sanitization
        text: text.toString().substring(0, 500),
        room: room.toString().substring(0, 50)
      });
      
      await message.save();
      
      // Broadcast the message to everyone in the room
      io.to(room).emit('receive_message', message);
    } catch (err) {
      console.error('Error handling message:', err);
      socket.emit('error', 'Failed to send message');
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// API route to get all messages with error handling
app.get('/api/messages/:room', async (req, res) => {
  try {
    if (!req.params.room || typeof req.params.room !== 'string') {
      return res.status(400).json({ error: 'Invalid room parameter' });
    }
    
    const messages = await Message.find({ room: req.params.room })
      .sort({ createdAt: 1 })
      .limit(100); // Limit to 100 most recent messages
    
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});