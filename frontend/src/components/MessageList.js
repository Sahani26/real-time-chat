import React from 'react';

const MessageList = ({ messages, username }) => {
  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`message ${message.user === username ? 'own-message' : ''}`}
        >
          <strong>{message.user}: </strong>
          {message.text}
        </div>
      ))}
    </div>
  );
};

export default MessageList;