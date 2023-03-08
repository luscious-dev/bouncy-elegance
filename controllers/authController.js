const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  res.status(200).json({
    status: "success",
    token: signToken(newUser._id),
    newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Must provide email and password", 400));
  }
  const currentUser = await User.findOne({ email: email }).select("+password");
  if (
    !currentUser ||
    !currentUser.correctPassword(password, currentUser.password)
  ) {
    return next(new AppError("Incorrect email or password", 401));
  }

  res.status(200).json({
    status: "success",
    token: signToken(currentUser._id),
  });
});
