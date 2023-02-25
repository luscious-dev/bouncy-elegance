const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
mongoose
  .connect("mongodb://localhost:27017/BouncyElegance")
  .then((res) => {
    console.log("MONGO CONNECTION SUCCESSFUL");
  })
  .catch((err) => {
    console.log("MONGO CONNECTION UNSUCCESSFUL", err);
  });

const User = require("./models/User");
const BlogPosts = require("./models/BlogPosts");
const BlogPostLikes = require("./models/BlogPostLikes");

(async () => {
  const blogPosts = await BlogPosts.find({});
  const users = await User.find({});

  for (let i = 0; i < 8; i++) {
    let randUserIndex = Math.floor(Math.random() * blogPosts.length);
    let randBlogIndex = Math.floor(Math.random() * users.length);

    await BlogPostLikes.create({
      blogPost: blogPosts[randBlogIndex],
      user: users[randUserIndex],
    });
    console.log("Like....");
  }
})();
