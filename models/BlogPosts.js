const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify");
const BlogPostLikes = require("./BlogPostLikes");
const BlogPostVisits = require("./BlogPostVisits");

const BlogPostSchema = Schema({
  title: {
    type: String,
    required: [true, "A blog post must have a title"],
  },
  author: {
    type: String,
    required: {
      values: true,
      message: "A blog post must have an author",
    },
  },
  description: {
    type: String,
    required: [true, "A blog post must have a description"],
  },
  body: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  length: {
    type: Number,
  },
  published: {
    type: Boolean,
    default: false,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now(),
  },
  tags: {
    type: Array,
  },
  visits: {
    type: Number,
    default: 0,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
});

BlogPostSchema.pre("validate", function (next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  next();
});

BlogPostSchema.pre("save", function (next) {
  if (this.body) {
    this.length = this.body.length;
  } else {
    this.length = 0;
  }
  next();
});

BlogPostSchema.pre("remove", function (next) {
  console.log(this);
  next();
});

BlogPostSchema.post(/delete/i, async function (result, next) {
  await BlogPostVisits.deleteMany({ blogPost: result._id });
  await BlogPostLikes.deleteMany({ blogPost: result._id });
  next();
});

module.exports = mongoose.model("BlogPosts", BlogPostSchema);
