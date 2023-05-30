const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify");
const blogController = require("../controllers/blogController");

const BlogPostSchema = Schema(
  {
    title: {
      type: String,
      required: [true, "A blog post must have a title"],
      unique: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
      required: [true, "A blog post must have a body"],
    },
    photo: {
      type: String,
      required: [true, "A blog post must have a photo"],
    },
    category: {
      type: String,
      required: [true, "A blog post must belong to a category"],
    },
    length: {
      type: Number,
    },
    published: {
      type: Boolean,
      default: false,
      required: true,
    },
    featured: {
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
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

BlogPostSchema.index({ tags: 1 });
// You can use "virtual populate" to know about all the comments it's got
// This is a way of keeping an array of comments without storing it in the database
BlogPostSchema.virtual("comments", {
  ref: "BlogPostComment",
  foreignField: "blogPost",
  localField: "_id",
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

BlogPostSchema.pre(/^find/, function (next) {
  this.populate({
    path: "author",
    select: "firstName lastName role profilePhoto",
  });
  next();
});

BlogPostSchema.post(/delete/i, async function (result, next) {
  blogController.cleanUpBlog(result._id);
  next();
});

module.exports = mongoose.model("BlogPosts", BlogPostSchema);
