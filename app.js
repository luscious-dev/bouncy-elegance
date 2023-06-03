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
const writerRequestRoute = require("./routes/writerRequestRoute");
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

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.quilljs.com",
      ],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "wss?:\\/\\/localhost:\\d+"],
      // Add more directives as per your requirements
    },
  })
);

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Automatically login users incase they use a different brouser
app.use((req, res, next) => {
  if (req.query.token) {
    const cookieOptions = {
      httpOnly: true,
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
    };
    if (process.env.NODE_ENV == "production") {
      cookieOptions.secure = true;
    }
    res.cookie("jwt", req.query.token, cookieOptions);
  }
  next();
});

app.use("/api", limiter);

app.use("/api/v1/blog/posts", blogRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/comments", commentRoute);
app.use("/api/v1/writer-request", writerRequestRoute);

app.use("/", viewRoute);

app.all("*", (req, res, next) => {
  next(new AppError(`Could not find "${req.originalUrl}" on the server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
