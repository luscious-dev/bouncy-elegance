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
  if (req.params.postid) {
    query.find({ blogPost: req.params.postid });
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
  const comment = await BlogPostComment.findByIdAndDelete(req.params.id);
  if (!comment) {
    return next(new AppError("No Comment Found With That ID!", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createComment = catchAsync(async (req, res, next) => {
  if (!req.params.postid) {
    req.params.postid = req.body.blogPost;
  }
  const comment = await BlogPostComment.create({
    comment: req.body.comment,
    user: req.user._id,
    blogPost: req.params.postid,
  });

  res.status(200).json({
    status: "success",
    data: {
      comment,
    },
  });
});

exports.addReply = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const comment = await BlogPostComment.findByIdAndUpdate(
    req.params.id,
    { $push: { reply: { comment: req.body.comment, user: req.user._id } } },
    { new: true }
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
