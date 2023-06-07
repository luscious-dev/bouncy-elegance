const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/users");
  },
  filename: function (req, file, cb) {
    let ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
  },
});

const multerLimit = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("You should only upload images", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  limits: multerLimit,
});

const filterBody = function (body, ...fields) {
  const tmp_obj = {};
  fields.forEach((field) => {
    tmp_obj[field] = body[field];
  });
  return tmp_obj;
};

exports.uploadUserPhoto = upload.single("profilePhoto");

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

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "Cannot change password on this route. Head to /updateMyPassword",
        400
      )
    );

  if (req.file) {
    req.body.profilePhoto = req.file.filename;
  }

  // Filter out the fields that are not allowed
  const filteredBody = filterBody(
    req.body,
    "profilePhoto",
    "lastName",
    "firstName"
  );
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
  if (!user) {
    return next(new AppError("User with the ID not found", 404));
  }

  res.status(204).json({
    status: "success",
    message: "User deleted successfully",
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  // Update user
  if (!user) {
    return next(new AppError("User with the ID not found", 404));
  }

  Object.keys(req.body).forEach((key) => {
    user[key] = req.body[key];
  });

  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.removeWriter = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return next(new AppError("No user found", 404));
  }
  user.role = "user";

  await user.save({ validateBeforeSave: false });

  const url = `${req.protocol}://${req.get("host")}/become-a-writer`;
  await new Email(user, url).sendWriterRevoked();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
