const BlogPostLikes = require("../models/BlogPostLikes");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const filterBody = function (body, ...fields) {
  const tmp_obj = {};
  fields.forEach((field) => {
    tmp_obj[field] = body[field];
  });
  return tmp_obj;
};

exports.getAllLikes = catchAsync(async (req, res, next) => {
  const query = BlogPostLikes.find();
  if (req.params.postid) {
    query.find({ blogPost: req.params.postid });
  }

  const likes = await query;

  res.status(200).json({
    status: "success",
    data: {
      likes,
    },
  });
});

exports.getLike = catchAsync(async (req, res, next) => {
  const like = await BlogPostLikes.findById(req.params.id);

  if (!like) {
    return next(new AppError("No Like Found With That ID!", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      like,
    },
  });
});

exports.deleteLike = catchAsync(async (req, res, next) => {
  let like;
  if (req.user.role !== "admin") {
    like = await BlogPostLikes.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
  } else {
    like = await BlogPostLikes.findByIdAndDelete(req.params.id);
  }
  if (!like) {
    return next(new AppError("No Like Found With That ID!", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createLike = catchAsync(async (req, res, next) => {
  if (!req.params.postid) {
    req.params.postid = req.body.blogPost;
  }
  const like = await BlogPostLikes.create({
    user: req.user._id,
    blogPost: req.params.postid,
  });

  res.status(200).json({
    status: "success",
    data: {
      like,
    },
  });
});
