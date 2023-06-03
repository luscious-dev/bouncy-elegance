const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const BlogPost = require("./BlogPosts");

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
      values: ["user", "admin", "blog-owner", "writer"],
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

  profilePhoto: {
    type: String,
  },

  passwordResetToken: String,
  paswordResetTokenExpires: Date,

  changedPasswordAt: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
});

UserSchema.methods.correctPassword = async (sentPassword, currentPassword) => {
  return await bcrypt.compare(sentPassword, currentPassword);
};

UserSchema.methods.isPostOwner = async function (postid) {
  const blogPost = await BlogPost.findById(postid);
  if (blogPost) {
    return blogPost.author._id.equals(this._id);
  }
  return false;
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

UserSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetToken = hashedResetToken;
  this.paswordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.changedPasswordAt = Date.now() - 1000;
});

module.exports = mongoose.model("User", UserSchema);
