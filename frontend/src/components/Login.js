import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [uniqueCode, setUniqueCode] = useState("");
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${apiUrl}/api/auth/login`, { uniqueCode }); // Corrected the string interpolation

      if (res.data) {
        localStorage.setItem("user", JSON.stringify(res.data));
        navigate("/chat");
      }
    } catch (error) {
      alert("Invalid credentials or user not registered.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Enter Unique Code"
          value={uniqueCode}
          onChange={(e) => setUniqueCode(e.target.value)}
          className="login-input"
        />
        <button onClick={handleLogin} className="login-btn">
          Login
        </button>
        <p className="register-link">
          New user? <button onClick={() => navigate("/register")} className="register-btn">Register</button>
        </p>
      </div>
    </div>
  );
};

export default Login;
