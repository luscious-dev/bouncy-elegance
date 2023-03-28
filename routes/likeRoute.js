const express = require("express");
const router = express.Router({ mergeParams: true });
const likesController = require("../controllers/likesController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(
    authController.protect,
    authController.restrict("admin"),
    likesController.getAllLikes
  )
  .post(authController.protect, likesController.createLike);

router
  .route("/:id")
  .delete(authController.protect, likesController.deleteLike)
  .get(authController.protect, likesController.getLike);
