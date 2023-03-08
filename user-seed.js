const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
mongoose
  .connect("mongodb://127.0.0.1:27017/BouncyElegance")
  .then((res) => {
    console.log("MONGO CONNECTION SUCCESSFUL");
  })
  .catch((err) => {
    console.log("MONGO CONNECTION UNSUCCESSFUL", err);
  });

const User = require("./models/User");

const lastName = [
  "Johnson",
  "Stevenson",
  "William",
  "Brawn",
  "Cooper",
  "Andrew",
];

const firstName = ["Mark", "James", "Phil", "Moses", "Tate", "Jones"];

(async () => {
  for (let i = 0; i < 10; i++) {
    let randFirstIndex = Math.floor(Math.random() * firstName.length);
    let randLastIndex = Math.floor(Math.random() * lastName.length);
    console.log("doings...");

    try {
      await User.create({
        email: `${firstName[randFirstIndex].toLowerCase()}.${lastName[
          randLastIndex
        ].toLowerCase()}@gmail.com`,
        firstName: firstName[randFirstIndex],
        lastName: lastName[randLastIndex],
      });
    } catch (err) {
      console.log("Duplicate email...skipping...");
    }
  }
})();
