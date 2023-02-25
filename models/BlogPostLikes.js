const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogLikesSchema = new Schema({
  blogPost: {
    type: Schema.Types.ObjectId,
    ref: "BlogPost",
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("BlogLikes", BlogLikesSchema);
