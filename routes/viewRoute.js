const express = require("express");
const BlogPost = require("../models/BlogPosts");
const AppError = require("../utils/appError");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");

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
    console.log(post);
    res
      .status(200)
      .render("blog-post", { post, title: post.title, colored: true });
  })
);

router.get("/", (req, res) => {
  res.status(200).render("home", { title: "Home" });
});

module.exports = router;
