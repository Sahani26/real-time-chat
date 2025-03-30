import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import RoomSelector from './RoomSelector';

const socket = io(process.env.REACT_APP_SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000
});

const ChatRoom = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [isConnected, setIsConnected] = useState(false);
  const [rooms] = useState(['general', 'tech', 'gaming']);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Socket event listeners
    const onConnect = () => {
      setIsConnected(true);
      console.log('Socket connected:', socket.id);
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    };

    const onConnectError = (err) => {
      console.error('Connection error:', err);
    };

    const onError = (err) => {
      console.error('Socket error:', err);
    };

    const onReceiveMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('error', onError);
    socket.on('receive_message', onReceiveMessage);

    // Join initial room
    joinRoom(currentRoom);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('error', onError);
      socket.off('receive_message', onReceiveMessage);
    };
  }, []);

  const joinRoom = (room) => {
    socket.emit('join_room', room, (response) => {
      if (response.status === 'success') {
        setMessages(response.messages || []);
        setCurrentRoom(room);
      } else {
        console.error('Error joining room:', response.message);
      }
    });
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;

    socket.emit('send_message', {
      user: username,
      text,
      room: currentRoom
    }, (response) => {
      if (response.status !== 'success') {
        console.error('Failed to send message:', response.message);
      }
    });
  };

  const changeRoom = (room) => {
    if (room !== currentRoom) {
      joinRoom(room);
    }
  };

  return (
    <div className="chat-room">
      <div className="connection-status">
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      <h2>Chat Room: {currentRoom}</h2>
      <RoomSelector rooms={rooms} currentRoom={currentRoom} onChangeRoom={changeRoom} />
      <MessageList messages={messages} username={username} />
      <div ref={messagesEndRef} />
      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
};

export default ChatRoom;