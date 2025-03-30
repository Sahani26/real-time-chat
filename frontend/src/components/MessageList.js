import React from 'react';

const MessageList = ({ messages, username }) => {
  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div
          key={`${message._id || index}`}
          className={`message ${message.user === username ? 'own-message' : ''}`}
        >
          <div className="message-user">{message.user}</div>
          <div className="message-text">{message.text}</div>
          {message.createdAt && (
            <div className="message-time">
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageList;