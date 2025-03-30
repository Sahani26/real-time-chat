import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../style/Auth.css"; // ✅ Import Responsive CSS

const Register = () => {
    const [name, setName] = useState("");
    const [uniqueCode, setUniqueCode] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (!name || !uniqueCode) {
            alert("Please fill in all fields!");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5000/api/auth/register", { name, uniqueCode });
            localStorage.setItem("user", JSON.stringify(res.data));
            navigate("/chat");
        } catch (error) {
            alert("Registration failed!");
        }
    };

    return (
        <div className="auth-container">
            <h2>Register</h2>
            <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="text" placeholder="Unique Code" value={uniqueCode} onChange={(e) => setUniqueCode(e.target.value)} />
            <button onClick={handleRegister}>Register</button>
            <p>Already registered? <Link to="/login">Login</Link></p>
        </div>
    );
};

export default Register;
