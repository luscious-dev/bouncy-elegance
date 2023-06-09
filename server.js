const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: `${__dirname}/config.env` });

process.on("uncaughtException", (err) => {
  console.log(err.name);
  console.log(err.message);
  console.log("UNHANDLED EXCEPTION! Shutting down...");
  process.exit(1);
});

mongoose.set("strictQuery", true);
const connectionString =
  process.env.NODE_ENV == "development"
    ? process.env.DB_LOCAL
    : process.env.DB_PROD.replace("<password>", process.env.DB_PASSWORD);
mongoose
  .connect(connectionString)
  .then((res) => {
    console.log("MONGO CONNECTION SUCCESSFUL");
  })
  .catch((err) => {
    console.log("MONGO CONNECTION UNSUCCESSFUL", err);
  });

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`LISTENING ON PORT ${port}...`);
});

// Handle any unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(err.message);
  console.log("UNHANDLED REJECTION. Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
