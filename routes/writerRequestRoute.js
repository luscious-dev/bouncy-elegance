const express = require("express");
const router = express.Router({ mergeParams: true });
const WriterRequest = require("../models/WriterRequest");
const User = require("../models/User");
const authController = require("../controllers/authController");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");

router.use(authController.protect);

router.post(
  "/",
  authController.restrict("user"),
  catchAsync(async (req, res, next) => {
    const request = await WriterRequest.create({
      user: req.user._id,
      message: req.body.message,
    });

    res.status(200).json({
      status: "success",
      data: {
        request,
      },
    });
  })
);

router.use(authController.restrict("admin", "blog-owner"));

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const requests = await WriterRequest.find({});

    res.status(200).json({
      status: "success",
      data: {
        requests,
      },
    });
  })
);

router.delete(
  "/:id",
  catchAsync(async (req, res, next) => {
    const request = await WriterRequest.findByIdAndDelete(req.params.id);

    if (!request) {
      return next(new AppError("No such request exists!", 404));
    }
    res.status(204).json({
      message: "success",
      data: null,
    });
  })
);

router.patch("/:id", async (req, res, next) => {
  const request = await WriterRequest.findById(req.params.id);
  if (!request) return new AppError("No such request exists!", 404);
  if (req.body.isAccepted) {
    await User.findByIdAndUpdate(request.user, { role: "writer" });

    // Send congratulatory email
    const url = `${req.protocol}://${req.get("host")}/create-post`;
    const user = await User.findById(request.user);
    await new Email(user, url).sendWriterAccepted();
  }
  const out = await WriterRequest.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    data: {
      request: out,
    },
  });
});

module.exports = router;
