const express = require("express");
const router = new express.Router();
const blogControllers = require("../controllers/blogController");
const authController = require("../controllers/authController");
const commentsRoute = require("../routes/commentRoute");

router.use("/:postid/comments", commentsRoute);

router
  .route("/")
  .get(blogControllers.getAllPosts)
  .post(
    authController.protect,
    authController.restrict("admin", "blog-owner", "writer"),
    blogControllers.uploadBlogPostPhoto,
    blogControllers.createBlogPost
  );

router
  .route("/:id")
  .get(blogControllers.getPost)
  .patch(
    authController.protect,
    authController.restrict("admin", "blog-owner", "writer"),
    blogControllers.ownsBlogPost,
    blogControllers.uploadBlogPostPhoto,
    blogControllers.updateBlogPost
  )
  .delete(
    authController.protect,
    authController.restrict("admin", "blog-owner", "writer"),
    blogControllers.ownsBlogPost,
    blogControllers.deleteBlogPost
  );

// Know which posts have the highest number of views
router.get(
  "/getTopViews/:number",
  authController.protect,
  authController.restrict("admin"),
  blogControllers.getBlogPostsByViews
);

// Know which posts have the most likes
router.get(
  "/getTopLikesPosts/:number",
  authController.protect,
  authController.restrict("admin"),
  blogControllers.getBlogPostByLikes
);

// Which post categories have the most likes
router.get(
  "/getTopLikesCategory/:number",
  authController.protect,
  authController.restrict("admin"),
  blogControllers.getPostCategoriesByLikes
);

// Which categories have the most views
router.get(
  "/getTopViewsCategory/:number",
  authController.protect,
  authController.restrict("admin"),
  blogControllers.getPostCategoriesByViews
);

router.get(
  "/getGeneralStats",
  authController.protect,
  authController.restrict("admin"),
  blogControllers.getGeneralStats
);

module.exports = router;
