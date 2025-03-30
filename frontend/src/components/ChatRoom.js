import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import RoomSelector from './RoomSelector';
import axios from 'axios';

const socket = io('http://localhost:5000'); // Change to your backend URL

const ChatRoom = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [rooms] = useState(['general', 'tech', 'gaming']);

  useEffect(() => {
    // Join room when component mounts or room changes
    socket.emit('join_room', currentRoom);

    // Fetch previous messages
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/messages/${currentRoom}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Set up socket listeners
    socket.on('receive_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('previous_messages', (messages) => {
      setMessages(messages);
    });

    // Clean up on unmount
    return () => {
      socket.off('receive_message');
      socket.off('previous_messages');
    };
  }, [currentRoom]);

  const sendMessage = (text) => {
    if (text.trim()) {
      socket.emit('send_message', {
        user: username,
        text,
        room: currentRoom,
      });
    }
  };

  const changeRoom = (room) => {
    setCurrentRoom(room);
    setMessages([]);
  };

  return (
    <div className="chat-room">
      <h2>Chat Room: {currentRoom}</h2>
      <RoomSelector rooms={rooms} currentRoom={currentRoom} onChangeRoom={changeRoom} />
      <MessageList messages={messages} username={username} />
      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
};

export default ChatRoom;