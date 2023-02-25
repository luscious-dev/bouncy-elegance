const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogVisitsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  blogPost: {
    type: Schema.Types.ObjectId,
    ref: "BlogPosts",
    required: true,
  },
  dateVisited: {
    type: Schema.Types.Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("BlogPostVisit", blogVisitsSchema);
