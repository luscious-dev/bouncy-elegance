const BlogPostComment = require("../models/BlogPostComments");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const filterBody = function (body, ...fields) {
  const tmp_obj = {};
  fields.forEach((field) => {
    tmp_obj[field] = body[field];
  });
  return tmp_obj;
};

exports.getAllComments = catchAsync(async (req, res, next) => {
  const query = BlogPostComment.find();
  if (req.params.blogid) {
    query.find({ blogPost: req.params.blogid });
  }

  const comments = await query;

  res.status(200).json({
    status: "success",
    data: {
      comments,
    },
  });
});

exports.getComment = catchAsync(async (req, res, next) => {
  const comment = await BlogPostComment.findById(req.params.id);

  if (!comment) {
    return next(new AppError("No Comment Found With That ID!", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      comment,
    },
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const comment = await BlogPostComment.findById(req.params.id);
  if (!comment) {
    return next(new AppError("No Comment Found With That ID!", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createComment = catchAsync(async (req, res, next) => {
  const comment = await BlogPostComment.create(
    filterBody(req.body, "comment", "user", "blogPost")
  );

  res.status(200).json({
    status: "success",
    data: {
      comment,
    },
  });
});

exports.addReply = catchAsync(async (req, res, next) => {
  const comment = await BlogPostComment.findByIdAndUpdate(
    req.params.id,
    { reply: { $push: req.body } },
    { new: true, runValidators: true }
  );

  if (!comment) {
    return next(new AppError("No Comments With That ID!", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      comment,
    },
  });
});
