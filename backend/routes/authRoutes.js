const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Test API route
router.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});
// Register New User
router.post("/register", async (req, res) => {
  const { name, uniqueCode } = req.body;
  let user = await User.findOne({ uniqueCode });

  if (!user) {
    user = new User({ name, uniqueCode });
    await user.save();
  }

  res.json({ userId: user._id, name: user.name });
});

// Login Existing User
router.post("/login", async (req, res) => {
  const { uniqueCode } = req.body;
  let user = await User.findOne({ uniqueCode });

  if (!user) {
    return res.status(400).json({ error: "User not found. Please register." });
  }

  res.json({ userId: user._id, name: user.name });
});

module.exports = router;
