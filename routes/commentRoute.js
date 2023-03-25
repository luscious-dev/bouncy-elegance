const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentsController");

router
  .route("/")
  .get(commentController.getAllComments)
  .post(commentController.createComment);

router.post("/:id/reply", commentController.addReply);

router
  .route("/:id")
  .get(commentController.getComment)
  .delete(commentController.deleteComment);

module.exports = router;
