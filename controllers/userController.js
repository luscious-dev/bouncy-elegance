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

exports.createUser = catchAsync(async (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined",
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "Cannot change password on this route. Head to /updateMyPassword",
        400
      )
    );
  }

  // Filter out the fields that are not allowed
  const filteredBody = filterBody(req.body, "email", "lastName", "firstName");
  console.log(filteredBody);
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

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
