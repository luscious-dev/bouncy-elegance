const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");
const AppError = require("../utils/appError");

const filterBody = function (body, ...fields) {
  const tmp_obj = {};
  fields.forEach((field) => {
    tmp_obj[field] = body[field];
  });
  return tmp_obj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find({ active: { $ne: false } });

  res.status(200).json({
    status: "success",
    length: users.length,
    data: {
      users,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getMe = catchAsync((req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(
      new AppError(
        "The token for which the user was generated does not exist",
        401
      )
    );
  }

  req.params.id = user._id;

  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "Cannot change password on this route. Head to /updateMyPassword",
        400
      )
    );

  // Filter out the fields that are not allowed
  const filteredBody = filterBody(req.body, "email", "lastName", "firstName");
  const newUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

exports.createUser = catchAsync(async (req, res) => {
  const user = await User.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) {
    return next(new AppError("No User With That ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findOneAndDelete(req.params.id);
  console.log(user);
  if (!user) {
    return next(new AppError("User with the ID not found", 404));
  }

  res.status(204).json({
    status: "success",
    message: "User deleted successfully",
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, {
    new: true,
    runValidators: true,
  });
  // Update user
  if (!user) {
    return next(new AppError("User with the ID not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
