const util = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");
const AppError = require("../utils/appError");
const sendMail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
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
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "Your password has been changed in you last logged in. Log in again!",
        401
      )
    );
  }

  req.user = currentUser;

  next();
});

exports.restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action!", 403)
      );
    }

    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  const currentUser = await User.findOne({ email: email });
  if (!currentUser) {
    return next(new AppError("There is no user with this email", 404));
  }

  // Create reset token
  const resetToken = currentUser.createResetToken();
  await currentUser.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.hostname}/api/v1/users/resetPassword/${resetToken}`;
  const message = `A password reset was issued. Follow this link to reset your password ${resetUrl} \n If you issued no such requests, ignore this email`;

  try {
    await sendMail({
      email: currentUser.email,
      text: message,
      subject: "Password reset request (Expires in 10mins)",
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch {
    currentUser.passwordResetToken = undefined;
    currentUser.paswordResetTokenExpires = undefined;

    await currentUser.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending the mail. Try again later!", 500)
    );
  }
};

exports.resetPassword = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    paswordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError("Your reset token is invalid or has expired!", 400)
    );
  }

  const { password, passwordConfirm } = req.body;
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.paswordResetTokenExpires = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    token: signToken(user._id),
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return next(
      new AppError(
        "The user for which this token was genereated no longer exists",
        404
      )
    );
  }

  const { currentPassword, password, passwordConfirm } = req.body;
  if (!(await user.correctPassword(user.password, currentPassword))) {
    return next(new AppError("Incorrect password", 401));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;

  await user.save();

  res.status(200).json({
    status: "success",
    token: signToken(user._id),
  });
});
