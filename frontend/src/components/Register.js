import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  
import axios from "axios";
 

const Register = () => {
  const [name, setName] = useState("");
  const [uniqueCode, setUniqueCode] = useState("");
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleRegister = async () => {
    if (!name || !uniqueCode) {
      alert("Please fill in all fields!");
      return;
    }

    try {
      const res = await axios.post(`${apiUrl}/api/auth/register`, { name, uniqueCode });
      navigate("/"); // Redirect to login page
    } catch (error) {
      alert("Error during registration. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Register</h2>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="register-input"
        />
        <input
          type="text"
          placeholder="Enter Unique Code"
          value={uniqueCode}
          onChange={(e) => setUniqueCode(e.target.value)}
          className="register-input"
        />
        <button onClick={handleRegister} className="register-btn">
          Register
        </button>
        <p className="login-link">
          Already registered? <button onClick={() => navigate("/")} className="login-btn">Login</button>
        </p>
      </div>
    </div>
  );
};

export default Register;
