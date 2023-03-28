const express = require("express");
const router = express.Router({ mergeParams: true });
const commentController = require("../controllers/commentsController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(commentController.getAllComments)
  .post(authController.protect, commentController.createComment);

router.post("/:id/reply", authController.protect, commentController.addReply);

router
  .route("/:id")
  .get(commentController.getComment)
  .delete(commentController.deleteComment);

module.exports = router;
