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
const authors = [
  "641194335faa278c87d9f7e1",
  "641dd50b06dc77512820b3d4",
  "64649c5e246f02686c62f18f",
];
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
    author: authors[Math.floor(Math.random() * authors.length)],
    body: `<h1>Lorem Ispsum dolor ma qui</h1><p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>`,
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
