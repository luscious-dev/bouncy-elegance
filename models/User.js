const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, "Email address is required"],
    unique: true,
    lowercase: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: "Please provide a valid email",
    },
  },
  firstName: {
    type: String,
    required: [true, "First name is required"],
    maxLength: 300,
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    maxLength: 300,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "You have to set a password"],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, "You have to confirm your password"],
    validate: {
      validator: function (value) {
        return this.password == value;
      },
      message: "Your password don't match",
    },
  },
});

module.exports = mongoose.model("User", UserSchema);
