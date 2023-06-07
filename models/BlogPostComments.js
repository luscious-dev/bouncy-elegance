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
    required: true,
  },
  blogPost: {
    type: Schema.Types.ObjectId,
    ref: "BlogPosts",
    required: true,
  },

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogPostComment",
    default: null,
  },

  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogPostComment",
    },
  ],

  dateCreated: {
    type: Date,
    default: Date.now(),
  },
});

BlogPostCommentSchema.post("findOneAndDelete", async function (doc, next) {
  const BlogPostComment = mongoose.model("BlogPostComment");
  await BlogPostComment.deleteMany({ parent: doc._id });
  next();
});

BlogPostCommentSchema.pre("find", function (next) {
  this.populate({
    path: "user",
    select: "firstName lastName email profilePhoto",
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
