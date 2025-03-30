require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// Configure CORS to allow your frontend origin
const io = socketIo(server, {
  cors: {
    origin: "*", // Change this to your frontend URL in production
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a room
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
    
    // Send previous messages in the room
    Message.find({ room })
      .sort({ createdAt: 1 })
      .then(messages => {
        socket.emit('previous_messages', messages);
      });
  });

  // Handle new messages
  socket.on('send_message', async (data) => {
    const { user, text, room } = data;
    
    // Save message to database
    const message = new Message({ user, text, room });
    await message.save();
    
    // Broadcast the message to everyone in the room
    io.to(room).emit('receive_message', message);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// API route to get all messages (optional)
app.get('/api/messages/:room', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});