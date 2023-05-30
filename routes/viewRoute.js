const express = require("express");

const router = express.Router();
const authController = require("../controllers/authController");
const viewController = require("../controllers/viewController");

router.use(authController.isLoggedIn);
router.get("/blog", viewController.getBlogHome);

router.get("/blog/:post", viewController.getBlogPost);

router.get("/me", authController.protect, viewController.getMe);

router.get(
  "/posts",
  authController.protect,
  authController.restrict("writer", "admin", "blog-owner"),
  viewController.getAdminPosts
);

router.get(
  "/posts/:slug/manage",
  authController.protect,
  authController.restrict("writer", "admin", "blog-owner"),
  viewController.getManageAdminPosts
);

router.get(
  "/create-post",
  authController.protect,
  authController.restrict("writer", "admin", "blog-owner"),
  viewController.getCreatePost
);

router.get(
  "/stats",
  authController.protect,
  authController.restrict("admin", "blog-owner"),
  viewController.getStats
);

router.get("/login", viewController.getLogin);
router.get("/sign-up", viewController.getSignUp);

router.get("/", viewController.getHome);

module.exports = router;
