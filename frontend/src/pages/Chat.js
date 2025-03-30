import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const Chat = () => {
    const [users, setUsers] = useState(["User1", "User2", "User3", "User4", "User5"]);
    const [selectedUser, setSelectedUser] = useState("all");
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const currentUser = "User1"; // Change dynamically in real case

    useEffect(() => {
        socket.on("receiveMessage", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, []);

    const sendMessage = () => {
        if (text.trim()) {
            socket.emit("sendMessage", { sender: currentUser, receiver: selectedUser, text });
            setMessages((prev) => [...prev, { sender: currentUser, receiver: selectedUser, text }]);
            setText("");
        }
    };

    return (
        <div>
            <h2>Chat Room</h2>

            <select onChange={(e) => setSelectedUser(e.target.value)}>
                <option value="all">Public</option>
                {users.map(user => user !== currentUser && <option key={user} value={user}>{user}</option>)}
            </select>

            <div style={{ height: "300px", overflowY: "scroll", border: "1px solid black" }}>
                {messages.map((msg, index) => (
                    <p key={index}>
                        <strong>{msg.sender}:</strong> {msg.text} {msg.receiver !== "all" && <i>(Private)</i>}
                    </p>
                ))}
            </div>

            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default Chat;
