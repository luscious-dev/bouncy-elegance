const APIFeatures = require("../utils/apiFeatures");
const BlogPosts = require("../models/BlogPosts");
const BlogPostLikes = require("../models/BlogPostLikes");
const BlogPostVisits = require("../models/BlogPostVisits");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/User");
const multer = require("multer");

const Email = require("../utils/email");

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/blog-post");
  },
  filename: function (req, file, cb) {
    let ext = file.mimetype.split("/")[1];
    cb(null, `post-${req.user._id}-${Date.now()}.${ext}`);
  },
});

const multerLimit = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("You should only upload images", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  limits: multerLimit,
});

exports.getAllPosts = catchAsync(async (req, res) => {
  const features = new APIFeatures(BlogPosts.find(), req.query);
  features.filter().sort().paginate().limitFields();

  // features.query;
  const posts = await features.query;

  res.status(200).json({
    status: "Success",
    length: posts.length,
    data: {
      posts,
    },
  });
});

exports.getPost = catchAsync(async (req, res) => {
  const post = await BlogPosts.findById(req.params.id).populate("comments");
  if (!post) {
    throw new AppError("No post available with that ID", 404);
  }

  await BlogPostVisits.create({
    blogPost: req.params.id,
  });
  res.status(200).json({
    status: "success",
    data: {
      post,
    },
  });
});

exports.uploadBlogPostPhoto = upload.single("photo");

exports.createBlogPost = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError("Must have a Blog post image", 400));
  req.body.photo = req.file.filename;

  const newPost = await BlogPosts.create({
    title: req.body.title,
    author: req.user._id,
    description: req.body.description,
    body: req.body.body,
    photo: req.body.photo,
    category: req.body.category,
    published: req.body.published,
    featured: req.body.featured,
    tags: JSON.parse(req.body.tags),
  });

  if (newPost.published) {
    const users = await User.find({ role: { $in: ["writer", "user"] } });

    let promiseArr = users.map(async (user) => {
      const url = `${req.protocol}://${req.get("host")}/blog/${newPost.slug}`;
      await new Email(user, url, newPost).sendNewPostUpdate();
    });

    await Promise.all(promiseArr);
  }

  res.status(201).json({
    status: "success",
    data: {
      blogPost: newPost,
    },
  });
});

exports.updateBlogPost = catchAsync(async (req, res, next) => {
  delete req.body.photo;
  if (req.file) req.body.photo = req.file.filename;

  req.body.tags = JSON.parse(req.body.tags);
  const blogPost = await BlogPosts.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  if (!blogPost) {
    throw new AppError("No post available with that ID", 404);
  }
  res.status(200).json({
    status: "success",
    data: {
      blogPost: blogPost,
    },
  });
});

exports.deleteBlogPost = catchAsync(async (req, res) => {
  const post = await BlogPosts.findByIdAndDelete(req.params.id);
  if (!post) {
    throw new AppError("No post available with that ID", 404);
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.ownsBlogPost = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(
      new AppError(
        "The User for which this token was genereated does not exist!",
        401
      )
    );
  }
  if (["admin", "blog-owner"].includes(user.role)) {
    return next();
  }
  if (!(await user.isPostOwner(req.params.id))) {
    return next(new AppError("You are not authorized to edit the post!", 403));
  }
  next();
});

// Business Intelligence Routes

// Get blog post views
exports.getBlogPostsByViews = catchAsync(async (req, res) => {
  const blogPosts = await BlogPosts.aggregate([
    { $match: { published: true } },
    { $sort: { visits: -1 } },
    { $limit: req.params.number * 1 },
  ]);

  res.status(200).json({
    status: "success",
    length: blogPosts.length,
    data: {
      blogPosts,
    },
  });
});

// Get blog post by likes
exports.getBlogPostByLikes = catchAsync(async (req, res) => {
  const blogPosts = await BlogPostLikes.aggregate([
    { $match: {} },
    {
      $group: { _id: "$blogPost", numOfLikes: { $sum: 1 } },
    },

    {
      $lookup: {
        from: "blogposts",
        localField: "_id",
        foreignField: "_id",
        as: "BlogInfo",
      },
    },

    { $unwind: "$BlogInfo" },
    {
      $addFields: {
        title: "$BlogInfo.title",
        author: "$BlogInfo.author",
        category: "$BlogInfo.category",
        description: "$BlogInfo.description",
        createdDate: "$BlogInfo.createdDate",
        BlogInfo: "$$REMOVE",
      },
    },

    { $sort: { numOfLikes: -1 } },

    { $limit: req.params.number * 1 },
  ]);

  res.status(200).json({
    status: "success",
    length: blogPosts.length,
    data: {
      blogPosts,
    },
  });
});

// Get post categories by likes
exports.getPostCategoriesByLikes = catchAsync(async (req, res) => {
  const categories = await BlogPostLikes.aggregate([
    { $match: {} },

    {
      $lookup: {
        from: "blogposts",
        localField: "blogPost",
        foreignField: "_id",
        as: "BlogInfo",
      },
    },
    { $unwind: "$BlogInfo" },
    {
      $addFields: {
        category: "$BlogInfo.category",
        BlogInfo: "$$REMOVE",
      },
    },

    {
      $group: { _id: "$category", numOfLikes: { $sum: 1 } },
    },

    { $sort: { numOfLikes: -1 } },

    { $limit: req.params.number * 1 },
  ]);

  res.status(200).json({
    status: "success",
    length: categories.length,
    data: {
      categories,
    },
  });
});

// Get post categories by views
exports.getPostCategoriesByViews = catchAsync(async (req, res) => {
  const categories = await BlogPostVisits.aggregate([
    { $match: {} },

    {
      $lookup: {
        from: "blogposts",
        localField: "blogPost",
        foreignField: "_id",
        as: "BlogInfo",
      },
    },
    { $unwind: "$BlogInfo" },
    {
      $addFields: {
        category: "$BlogInfo.category",
        visits: "$BlogInfo.visits",
        BlogInfo: "$$REMOVE",
      },
    },

    {
      $group: { _id: "$category", views: { $sum: 1 } },
    },

    { $sort: { views: -1 } },

    { $limit: req.params.number * 1 },
  ]);

  res.status(200).json({
    status: "success",
    length: categories.length,
    data: {
      categories,
    },
  });
});

// General stats
module.exports.getGeneralStats = catchAsync(async (req, res) => {
  const stats = await BlogPosts.aggregate([
    {
      $group: {
        _id: 0,
        numOfBlogPost: { $sum: 1 },
        totalNumOfVisits: { $sum: "$visits" },
        averageNumOfVisits: { $avg: "$visits" },
        maxNumberOfVisits: { $max: "$visits" },
        minNumberOfVisits: { $min: "$visits" },
      },
    },
    {
      $project: {
        _id: 0,
        numOfBlogPost: 1,
        totalNumOfVisits: 1,
        averageNumOfVisits: { $ceil: "$averageNumOfVisits" },
        maxNumberOfVisits: 1,
        minNumberOfVisits: 1,
      },
    },
  ]);

  res.status(200).json({
    message: "success",
    data: {
      stats,
    },
  });
});

exports.cleanUpBlog = async function (blogPostId) {
  await BlogPostVisits.deleteMany({ blogPost: blogPostId });
  await BlogPostLikes.deleteMany({ blogPost: blogPostId });
};
