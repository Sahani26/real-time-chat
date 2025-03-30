const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  uniqueCode: { type: String, unique: true },
});

module.exports = mongoose.model("User", UserSchema);
