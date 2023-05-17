const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const app = express();

const AppError = require("./utils/appError");
const blogRoute = require("./routes/blogRoute");
const userRoute = require("./routes/userRoute");
const commentRoute = require("./routes/commentRoute");
const viewRoute = require("./routes/viewRoute");
const globalErrorHandler = require("./controllers/errorController");

app.set("view engine", "pug");
// app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: "Too many requests from your PC. Try again in an hour!",
});

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

app.use("/api", limiter);

app.use("/api/v1/blog/posts", blogRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/comments", commentRoute);

app.use("/", viewRoute);

app.all("*", (req, res, next) => {
  next(new AppError(`Could not find "${req.originalUrl}" on the server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
