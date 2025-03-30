import React, { useState } from 'react';
import './App.css';
import ChatRoom from './components/ChatRoom';

function App() {
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setLoggedIn(true);
    }
  };

  if (!loggedIn) {
    return (
      <div className="login-container">
        <h1>Welcome to Chat App</h1>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button type="submit">Join Chat</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <ChatRoom username={username} />
    </div>
  );
}

export default App;