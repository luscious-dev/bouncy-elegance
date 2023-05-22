const AppError = require("../utils/appError");

const handleDevError = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
    });
  } else {
    // RENDERED
    res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      msg: err.message,
      colored: true,
    });
  }
};

const handleProdError = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      res.status(err.statusCode).json({
        status: err.status,
        message: "Something went very wrong!",
      });
    }
  } else {
    // RENDERED
    if (err.isOperational) {
      res.status(err.statusCode).render("error", {
        title: "Something went wrong",
        msg: err.message,
        colored: true,
      });
    } else {
      res.status(err.statusCode).render("error", {
        title: "Something went wrong",
        msg: "Please try again later",
        colored: true,
      });
    }
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors)
    .map((obj) => obj.message)
    .join(". ");
  const message = `Invalid input data: ${errors}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const error = Object.keys(err.keyValue).join(",");
  const message = `Duplicate values for: ${error}`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV == "development") {
    handleDevError(err, req, res);
  } else if (process.env.NODE_ENV == "production") {
    if (err.name == "CastError") err = handleCastErrorDB(err);
    if (err.name == "ValidationError") err = handleValidationErrorDB(err);
    if (err.code == 11000) err = handleDuplicateErrorDB(err);

    handleProdError(err, req, res);
  }
};
