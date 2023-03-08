const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");

const User = require("../models/User");

router.get(
  "/",
  catchAsync(async (req, res) => {
    const users = await User.find();

    res.status(200).json({
      status: "success",
      length: users.length,
      data: {
        users,
      },
    });
  })
);

router.post(
  "/",
  catchAsync(async (req, res) => {
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    res.status(200).json({
      status: "success",
      newUser,
    });
  })
);

module.exports = router;
