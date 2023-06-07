const BlogPost = require("../models/BlogPosts");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");
const WriterRequest = require("../models/WriterRequest");
const BlogPostComments = require("../models/BlogPostComments");

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

  const out = await BlogPostComments.find({ blogPost: post._id });

  // This was done to add in a 'canDelete' boolean
  const comments = out.map((comment) => {
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

  res.status(200).render("blog-post", {
    post,
    title: post.title,
    comments,
    colored: true,
  });
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

exports.getBecomeWriter = (req, res, next) => {
  res.status(200).render("request-to-be-writer", {
    title: "Become a writer",
    active: "request",
    colored: true,
  });
};

exports.getWriters = catchAsync(async (req, res, next) => {
  const data = await User.find({
    role: { $in: ["writer", "admin", "blog-owner"] },
  });
  res.status(200).render("writers", {
    colored: true,
    active: "writers",
    title: "Writers",
    writers: data,
  });
});

exports.getWriterRequest = catchAsync(async (req, res, next) => {
  const requests = await WriterRequest.find({}).populate("user");

  res.status(200).render("writer-requests", {
    colored: true,
    active: "writer requests",
    title: "Writer Requests",
    requests,
  });
});

exports.getLogin = (req, res, next) => {
  res.status(200).render("login", { title: "Login", colored: true });
};

exports.getSignUp = (req, res, next) => {
  res.status(200).render("sign-up", { title: "Sign Up", colored: true });
};

exports.getHome = async (req, res) => {
  const posts = await BlogPost.find({ published: true }).sort({
    createdDate: -1,
  });
  res.status(200).render("home", { title: "Home", posts });
};

exports.getAbout = (req, res, next) => {
  res.status(200).render("about", { colored: true, title: "About" });
};

exports.getStats = async (req, res, next) => {
  // Number of users
  const noOfUsers = (await User.find({})).length;
  // Number of writers
  const noOfWriters = (await User.find({ role: "writer" })).length;
  // Number of posts
  const noOfPosts = (await BlogPost.find({})).length;
  // Last upload date
  const noOfPublishedPosts = (await BlogPost.find({ published: true })).length;

  const stats = [
    { name: "Number of Users", value: noOfUsers, icon: "bubble" },
    { name: "Number of Writers", value: noOfWriters, icon: "feather" },
    { name: "Number of Posts", value: noOfPosts, icon: "edit" },
    {
      name: "Number of Published Posts",
      value: noOfPublishedPosts,
      icon: "mail",
    },
  ];
  res.status(200).render("blog-stats", {
    title: "Stats",
    active: "statistics",
    colored: true,
    stats,
  });
};
