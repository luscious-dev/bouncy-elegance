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
  const comment = await BlogPostComment.findById(req.params.id).populate(
    "replies"
  );

  if (!comment) {
    return next(new AppError("No Comment Found With That ID!", 404));
  }

  const tmp = { ...comment._doc };

  if (!req.user) {
    tmp["canDelete"] = false;
  } else if (
    req.user._id.equals(comment.user._id) ||
    ["admin", "blog-owner"].includes(req.user.role)
  ) {
    tmp["canDelete"] = true;
  } else {
    tmp["canDelete"] = false;
  }

  // Adding a canDelete boolean to the replies
  tmp.replies = tmp.replies.map((comment) => {
    const tmp = { ...comment._doc };

    if (!req.user) {
      tmp["canDelete"] = false;
    } else if (
      req.user._id.equals(comment.user._id) ||
      ["admin", "blog-owner"].includes(req.user.role)
    ) {
      tmp["canDelete"] = true;
    } else {
      tmp["canDelete"] = false;
    }
    return tmp;
  });

  res.status(200).json({
    status: "success",
    data: {
      comment: tmp,
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
    req.params.postid = req.body.blogPostId;
  }

  const comment = await BlogPostComment.create({
    comment: req.body.comment,
    user: req.user._id,
    blogPost: req.params.postid,
  });

  await comment.populate("user");

  const tmp = { ...comment._doc };

  if (!req.user) {
    tmp["canDelete"] = false;
  } else if (
    req.user._id.equals(comment.user._id) ||
    ["admin", "blog-owner"].includes(req.user.role)
  ) {
    tmp["canDelete"] = true;
  } else {
    tmp["canDelete"] = false;
  }

  res.status(200).json({
    status: "success",
    data: {
      comment: tmp,
    },
  });
});

exports.addReply = catchAsync(async (req, res, next) => {
  const newComment = await BlogPostComment.create({
    comment: req.body.comment,
    user: req.user._id,
    blogPost: req.params.postid,
    parent: req.body.commentId,
  });

  const comment = await BlogPostComment.findByIdAndUpdate(
    req.body.commentId,
    { $push: { replies: newComment._id } },
    { new: true }
  );

  if (!comment) {
    return next(new AppError("No Comments With That ID!", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      newComment,
    },
  });
});
