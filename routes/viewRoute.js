const express = require("express");
const BlogPost = require("../models/BlogPosts");
const AppError = require("../utils/appError");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const authController = require("../controllers/authController");
const APIFeatures = require("../utils/apiFeatures");
const marked = require("marked");
const DOMPurify = require("dompurify");

router.use(authController.isLoggedIn);
router.get(
  "/blog",
  catchAsync(async (req, res) => {
    // res.render("blog-home");
    const posts = await BlogPost.find().sort({ createdDate: -1 });
    // console.log(posts[0]);
    res.status(200).render("blog-home", {
      posts,
      title: "Posts",
    });
  })
);

router.get(
  "/blog/:post",
  catchAsync(async (req, res, next) => {
    const post = await BlogPost.findOne({ slug: req.params.post });
    if (!post) {
      return next(new AppError("Post not found", 404));
    }

    post.body = marked.parse(post.body);
    res
      .status(200)
      .render("blog-post", { post, title: post.title, colored: true });
  })
);

router.get("/me", authController.protect, (req, res, next) => {
  res.status(200).render("account", {
    title: "Your account",
    colored: true,
    active: "settings",
  });
});

router.get(
  "/posts",
  catchAsync(async (req, res, next) => {
    req.query.limit = 9;
    const features = new APIFeatures(BlogPost.find(), req.query);
    features.filter().sort().paginate().limitFields();

    let totalPages = Math.ceil(
      (await BlogPost.countDocuments()) / req.query.limit
    );
    const posts = await features.query;
    console.log(posts[0]);

    res.status(200).render("admin-posts", {
      posts,
      title: "Manage Posts",
      active: "posts",
      colored: true,
      totalPages,
      currentPage: req.query.page || 1,
    });
  })
);

router.get(
  "/posts/:slug/manage",
  catchAsync(async (req, res, next) => {
    const post = await BlogPost.findOne({ slug: req.params.slug });
    if (!post) {
      return next(new AppError("Post not found", 404));
    }

    res
      .status(200)
      .render("edit-post", { post, title: "Edit Post", colored: true });
  })
);

router.get(
  "/create-post",
  catchAsync(async (req, res, next) => {
    res.status(200).render("create-post", {
      title: "Create Post",
      active: "create post",
      colored: true,
    });
  })
);

router.get("/login", (req, res, next) => {
  res.status(200).render("login", { title: "Login", colored: true });
});

router.get("/", (req, res) => {
  res.status(200).render("home", { title: "Home" });
});

module.exports = router;
