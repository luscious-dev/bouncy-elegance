const express = require("express");
const path = require("path");
const app = express();

const AppError = require("./utils/appError");
const blogRoute = require("./routes/blogRoute");
const globalErrorHandler = require("./controllers/errorController");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json())
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/blog/", blogRoute);

app.get("/blog", (req, res) => {
  res.render("blog-home");
});

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new AppError(`Could not find "${req.originalUrl}" on the server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
