const express = require("express");

const router = express.Router();
const authController = require("../controllers/authController");
const viewController = require("../controllers/viewController");
const User = require("../models/User");
const WriterRequest = require("../models/WriterRequest");
const catchAsync = require("../utils/catchAsync");

router.use(authController.isLoggedIn);
router.get("/blog", viewController.getBlogHome);

router.get(
  "/blog/:post",
  authController.isLoggedIn,
  viewController.getBlogPost
);

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

router.get(
  "/become-a-writer",
  authController.protect,
  authController.restrict("user"),
  viewController.getBecomeWriter
);

router.get(
  "/writer-requests",
  authController.protect,
  authController.restrict("admin", "blog-owner"),
  catchAsync(async (req, res, next) => {
    const requests = await WriterRequest.find({}).populate("user");

    res.status(200).render("writer-requests", {
      colored: true,
      active: "writer requests",
      title: "Writer Requests",
      requests,
    });
  })
);
router.get(
  "/writers",
  authController.protect,
  authController.restrict("admin", "blog-owner"),
  catchAsync(async (req, res, next) => {
    const data = await User.find({
      role: { $in: ["writer", "admin", "blog-owner"] },
    });
    res.status(200).render("writers", {
      colored: true,
      active: "writers",
      title: "Writers",
      writers: data,
    });
  })
);

router.get("/login", viewController.getLogin);
router.get("/sign-up", viewController.getSignUp);
router.get("/about", (req, res, next) => {
  res.status(200).render("about", { colored: true, title: "About" });
});

router.get("/", viewController.getHome);

module.exports = router;
