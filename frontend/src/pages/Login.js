import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../style/Auth.css"; // ✅ Import Responsive CSS

const Login = () => {
    const [uniqueCode, setUniqueCode] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!uniqueCode) {
            alert("Enter Unique Code!");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", { uniqueCode });
            localStorage.setItem("user", JSON.stringify(res.data));
            navigate("/chat");
        } catch (error) {
            alert("User not found!");
        }
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>
            <input type="text" placeholder="Unique Code" value={uniqueCode} onChange={(e) => setUniqueCode(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
            <p>New here? <Link to="/">Register</Link></p>
        </div>
    );
};

export default Login;
