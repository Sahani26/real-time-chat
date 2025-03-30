// const express = require("express");
// const Message = require("../models/Message");

// const router = express.Router();

// // ✅ Send a message with uniqueCode

// // ✅ Send a message (No uniqueCode required)
// router.post("/send", async (req, res) => {
//   try {
//     const { text } = req.body;

//     if (!text) {
//       return res.status(400).json({ error: "Message text is required" });
//     }

//     const newMessage = new Message({ text });
//     await newMessage.save();

//     res.status(201).json({ success: true, newMessage });
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });


// // ✅ Fetch all messages from all users
// router.get("/", async (req, res) => {
//   try {
//     const messages = await Message.find().sort({ createdAt: 1 }); // Fetch all messages
//     res.status(200).json(messages);
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// module.exports = router;
const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

// ✅ Send a message with userId
router.post("/send", async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ error: "User ID and message text are required" });
    }

    const newMessage = new Message({ userId, text });
    await newMessage.save();

    res.status(201).json({ success: true, newMessage });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch all messages
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().populate("userId", "name").sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
