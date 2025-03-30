require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// Configure allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO configuration
// Add this right after creating the server
// Add these WebSocket specific settings
const io = socketIo(server, {
  cors: {
    origin: "https://real-time-chat-front-five.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Add connection keep-alive
setInterval(() => {
  io.emit('ping', Date.now());
}, 15000);

// Add these event listeners
io.engine.on("connection_error", (err) => {
  console.error('WebSocket connection error:', err);
});

// Modify your vercel.json

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Debug all incoming events
  socket.onAny((event, ...args) => {
    console.log(`Received ${event} with args:`, args);
  });

  // Join room handler
  socket.on('join_room', (room, callback) => {
    try {
      if (typeof room !== 'string' || !room.trim()) {
        throw new Error('Invalid room format');
      }
      
      const roomName = room.substring(0, 50);
      socket.join(roomName);
      console.log(`User ${socket.id} joined room: ${roomName}`);
      
      Message.find({ room: roomName })
        .sort({ createdAt: 1 })
        .limit(100)
        .then(messages => {
          callback({ status: 'success', messages });
        })
        .catch(err => {
          console.error('Error fetching messages:', err);
          callback({ status: 'error', message: 'Failed to load messages' });
        });
    } catch (err) {
      console.error('Error joining room:', err);
      callback({ status: 'error', message: err.message });
    }
  });

  // Message handler
  socket.on('send_message', async (data, callback) => {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid message format');
      }
      
      const { user, text, room } = data;
      
      if (!user || !text || !room) {
        throw new Error('Missing required fields');
      }
      
      const message = new Message({ 
        user: user.toString().substring(0, 50),
        text: text.toString().substring(0, 500),
        room: room.toString().substring(0, 50)
      });
      
      await message.save();
      io.to(message.room).emit('receive_message', message);
      callback({ status: 'success' });
    } catch (err) {
      console.error('Error handling message:', err);
      callback({ status: 'error', message: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// API Routes
app.get('/api/messages/:room', async (req, res) => {
  try {
    const room = req.params.room?.toString().substring(0, 50);
    if (!room) return res.status(400).json({ error: 'Invalid room parameter' });
    
    const messages = await Message.find({ room }).sort({ createdAt: 1 }).limit(100);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});

// Process handlers
process.on('unhandledRejection', (err) => console.error('Unhandled Rejection:', err));
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});