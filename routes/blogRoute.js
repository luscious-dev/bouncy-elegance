const express = require("express");
const router = new express.Router();
const blogControllers = require("../controllers/blogController");
const authController = require("../controllers/authController");

router.get("/posts", blogControllers.getAllPosts);

// Know which posts have the highest number of views
router.get("/posts/getTopViews/:number", blogControllers.getBlogPostsByViews);

// Know which posts have the most likes
router.get(
  "/posts/getTopLikesPosts/:number",
  blogControllers.getBlogPostByLikes
);

// Which post categories have the most likes
router.get(
  "/posts/getTopLikesCategory/:number",
  blogControllers.getPostCategoriesByLikes
);

// Which categories have the most views
router.get(
  "/posts/getTopViewsCategory/:number",
  blogControllers.getPostCategoriesByViews
);

router.get("/posts/getGeneralStats", blogControllers.getGeneralStats);

router.get("/posts/:id", blogControllers.getPost);

router.post("/posts", blogControllers.createBlogPost);

router.patch("/posts/:id", blogControllers.updateBlogPost);

router.delete("/posts/:id", blogControllers.deleteBlogPost);

module.exports = router;
