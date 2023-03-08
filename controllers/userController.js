const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

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
