const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
    maxLength: 300,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    maxLength: 300,
    trim: true,
  },
});

module.exports = mongoose.model("User", UserSchema);
