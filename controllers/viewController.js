const BlogPost = require("../models/BlogPosts");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");

exports.getBlogHome = catchAsync(async (req, res) => {
  // res.render("blog-home");
  req.query.limit = 10;
  const features = new APIFeatures(
    BlogPost.find({ published: true }),
    req.query
  );
  features.filter().sort().paginate().limitFields();

  let totalPages = Math.ceil(
    (await BlogPost.countDocuments({ published: true })) / req.query.limit
  );
  const posts = await features.query;

  res.status(200).render("blog-home", {
    posts,
    title: "Posts",
    totalPages,
    currentPage: req.query.page || 1,
  });
});

exports.getBlogPost = catchAsync(async (req, res, next) => {
  const post = await BlogPost.findOne({ slug: req.params.post });
  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  res
    .status(200)
    .render("blog-post", { post, title: post.title, colored: true });
});

exports.getMe = (req, res, next) => {
  res.status(200).render("account", {
    title: "Your account",
    colored: true,
    active: "settings",
  });
};

exports.getAdminPosts = catchAsync(async (req, res, next) => {
  req.query.limit = 9;
  let features;
  let totalPages;
  if (req.user.role === "writer") {
    features = new APIFeatures(
      BlogPost.find({ author: req.user._id }),
      req.query
    );
    features.filter().sort().paginate().limitFields();
    totalPages = Math.ceil(
      (await BlogPost.countDocuments({ author: req.user._id })) /
        req.query.limit
    );
  } else {
    features = new APIFeatures(BlogPost.find(), req.query);
    features.filter().sort().paginate().limitFields();
    totalPages = Math.ceil((await BlogPost.countDocuments()) / req.query.limit);
  }

  const posts = await features.query;

  res.status(200).render("admin-posts", {
    posts,
    title: "Manage Posts",
    active: "posts",
    colored: true,
    totalPages,
    currentPage: req.query.page || 1,
  });
});

exports.getManageAdminPosts = catchAsync(async (req, res, next) => {
  const post = await BlogPost.findOne({ slug: req.params.slug });
  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  if (req.user.role === "writer") {
    if (!req.user._id.equals(post.author._id)) {
      return next(new AppError("Not authorized to edit post", 403));
    }
  }

  res
    .status(200)
    .render("edit-post", { post, title: "Edit Post", colored: true });
});

exports.getCreatePost = catchAsync(async (req, res, next) => {
  res.status(200).render("create-post", {
    title: "Create Post",
    active: "create post",
    colored: true,
  });
});

exports.getLogin = (req, res, next) => {
  res.status(200).render("login", { title: "Login", colored: true });
};

exports.getSignUp = (req, res, next) => {
  res.status(200).render("sign-up", { title: "Sign Up", colored: true });
};

exports.getHome = (req, res) => {
  res.status(200).render("home", { title: "Home" });
};

exports.getStats = (req, res, next) => {
  res.status(200).render("blog-stats", {
    title: "Stats",
    active: "statistics",
    colored: true,
  });
};
