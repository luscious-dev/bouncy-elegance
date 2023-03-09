const express = require("express");
const router = new express.Router();
const blogControllers = require("../controllers/blogController");
const authController = require("../controllers/authController");

router.get(
  "/posts",

  blogControllers.getAllPosts
);

// Know which posts have the highest number of views
router.get(
  "/posts/getTopViews/:number",
  authController.protect,
  authController.restrict("admin"),

  blogControllers.getBlogPostsByViews
);

// Know which posts have the most likes
router.get(
  "/posts/getTopLikesPosts/:number",
  authController.protect,
  authController.restrict("admin"),
  blogControllers.getBlogPostByLikes
);

// Which post categories have the most likes
router.get(
  "/posts/getTopLikesCategory/:number",
  authController.protect,
  authController.restrict("admin"),
  blogControllers.getPostCategoriesByLikes
);

// Which categories have the most views
router.get(
  "/posts/getTopViewsCategory/:number",
  authController.protect,
  authController.restrict("admin"),
  blogControllers.getPostCategoriesByViews
);

router.get(
  "/posts/getGeneralStats",
  authController.protect,
  authController.restrict("admin"),
  blogControllers.getGeneralStats
);

router.get("/posts/:id", blogControllers.getPost);

router.post(
  "/posts",
  authController.protect,
  authController.restrict("admin"),
  blogControllers.createBlogPost
);

router.patch(
  "/posts/:id",
  authController.protect,
  authController.restrict("admin"),
  blogControllers.updateBlogPost
);

router.delete(
  "/posts/:id",
  authController.protect,
  authController.restrict("admin"),
  blogControllers.deleteBlogPost
);

module.exports = router;
