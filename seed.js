const mongoose = require("mongoose");
const BlogPost = require("./models/BlogPosts");

mongoose.set("strictQuery", true);
mongoose
  .connect("mongodb://127.0.0.1:27017/BouncyElegance")
  .then((res) => {
    console.log("MONGO CONNECTION SUCCESSFUL");
  })
  .catch((err) => {
    console.log("MONGO CONNECTION UNSUCCESSFUL", err);
  });

const categories = ["Sex", "Cancer", "Education", "Life", "Love", "Church"];
const authors = ["Mrs Akin-Odanye", "Oluwakemi", "Oluwabukola", "Segun"];
const img = [
  "1.png",
  "2.png",
  "3.png",
  "4.jpg",
  "5.png",
  "6.png",
  "7.jpg",
  "8.jpg",
  "9.jpg",
  "10.jpg",
  "11.png",
  "12.png",
  "13.jpg",
  "14.jpg",
];

const tags = [
  "Black",
  "Peace",
  "War",
  "Love",
  "Prosperity",
  "Magical",
  "Humor",
  "Dark",
  "Dance",
  "Dangerous",
  "Hateless",
];

for (let i = 0; i < 11; i++) {
  let post = new BlogPost({
    title: `Lorem Ipsum dolor sit amet ${(i + Math.random()).toFixed(3)}`,
    author: "64649c5e246f02686c62f18f",
    body: `I love supporting the **[EFF](https://eff.org)**.
        This is the *[Markdown Guide](https://www.markdownguide.org)*.
        See the section on [\`code\`](#code).`,
    photo: img[Math.floor(Math.random() * img.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    tags: (function () {
      let arr = [];
      while (arr.length <= 3) {
        let tag = tags[Math.floor(Math.random() * tags.length)];
        if (!arr.includes(tag)) {
          arr.push(tag);
        }
      }
      return arr;
    })(),
    description: "Lorem ipsum dolor sit amet, consect",
  });

  post
    .save()
    .then((res) => {
      console.log("Seed successfully saved");
    })
    .catch((err) => {
      console.log("Error saving", err);
    });
}

// process.exit(0);
