const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BlogPosts = require("../models/BlogPosts");

const blogVisitsSchema = new Schema({
  blogPost: {
    type: Schema.Types.ObjectId,
    ref: "BlogPosts",
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: [Number],
  },
  dateVisited: {
    type: Schema.Types.Date,
    default: Date.now(),
  },
});

blogVisitsSchema.statics.calculateVisits = async function (postId) {
  const stats = await this.aggregate([
    {
      $match: { blogPost: postId },
    },
    {
      $group: {
        _id: null,
        nVisits: { $sum: 1 },
      },
    },
  ]);

  await BlogPosts.findByIdAndUpdate(postId, {
    visits: stats[0].nVisits,
  });
};

blogVisitsSchema.post("save", async function (doc, next) {
  await doc.constructor.calculateVisits(doc.blogPost);
  next();
});

module.exports = mongoose.model("BlogPostVisit", blogVisitsSchema);
