const util = require("util");
const jwt = require("jsonwebtoken");

const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");
const AppError = require("../utils/appError");

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

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. See if a token is available
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return next(
      new AppError("You are not logged in. Log in and try again!", 401)
    );
  }

  token = req.headers.authorization.split(" ")[1];

  // 2. Verify token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists", 401)
    );
  }

  // 4. Chech if password has not been changed since the last log in
  console.log(currentUser.changedPasswordAfter(decoded.iat));
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "Your password has been changed in you last logged in. Log in again!",
        401
      )
    );
  }

  console.log(decoded);

  next();
});
