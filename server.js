const app = require("./app");
const dotenv = require("dotenv");

dotenv.config({ path: `${__dirname}/config.env` });

// /api/v1/users

// /api/v1/users/:id

// /api/v1/blog/posts

// /api/v1/blog/posts/new

// /api/v1/blog/posts/:id

// /api/v1/blog/posts/:id/comments

// /api/v1/blog/posts/:postid/comments/:commentid

const port = process.env.APP_PORT || 8000;
app.listen(process.env.APP_PORT, () => {
  console.log(`LISTENING ON PORT ${port}...`);
});
