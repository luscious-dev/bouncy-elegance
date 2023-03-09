const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const bcrypt = require("bcrypt");

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
  role: {
    type: String,
    enum: {
      values: ["user", "admin", "guest"],
      message: "This is not a valid role",
    },
    default: "user",
  },
  password: {
    type: String,
    required: [true, "You have to set a password"],
    minlength: 8,
    select: false,
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

  changedPasswordAt: {
    type: Date,
  },
});

UserSchema.methods.correctPassword = async (currentPassword, sentPassword) => {
  return await bcrypt.compare(sentPassword, currentPassword);
};

UserSchema.methods.changedPasswordAfter = function (tokenIssuedTime) {
  if (!this.changedPasswordAt) return false;

  const changedPasswordAtSecs = parseInt(
    this.changedPasswordAt.getTime() / 1000
  );

  if (changedPasswordAtSecs > tokenIssuedTime) {
    return true;
  }

  return false;
};

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

module.exports = mongoose.model("User", UserSchema);
