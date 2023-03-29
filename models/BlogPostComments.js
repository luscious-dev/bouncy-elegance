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
    ref: "BlogPosts",
  },

  reply: [
    {
      comment: {
        type: String,
        required: true,
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      dateCreated: {
        type: Date,
        default: Date.now(),
      },
    },
  ],

  dateCreated: {
    type: Date,
    default: Date.now(),
  },
});

BlogPostCommentSchema.pre("find", function (next) {
  this.populate({
    path: "user",
    select: "firstName lastName email",
  });
  next();
});

BlogPostCommentSchema.pre("findOne", function (next) {
  this.populate({
    path: "user",
    select: "firstName lastName",
  }).populate({
    path: "blogPost",
    select: "title category author",
  });
  next();
});

module.exports = mongoose.model("BlogPostComment", BlogPostCommentSchema);
