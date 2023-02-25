const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogPostCommentSchema = new Schema({
  comment: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  blogPost: {
    type: Schema.Types.ObjectId,
    ref: "BlogPost",
  },

  dateCreated: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("BlogPostComment", BlogPostCommentSchema);
