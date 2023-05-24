import "@babel/polyfill";
import { login, logout } from "./login";
import { getQuillInstance, getHTMLContent, renderHTMLContent } from "./editor";

// DOM ELEMENTS
const loginForm = document.querySelector(".form--login");
const logOutBtn = document.querySelector("#navbar__logout");
const createPostForm = document.querySelector(".form--create-post");
const createPostBtn = document.querySelector("#create-post");
const editPostForm = document.querySelector(".form--edit-post");
const editPostBtn = document.querySelector("#edit-post");
const editor = document.getElementById("editor");

// if (editor) {

// }

if (createPostForm) {
  let editor = getQuillInstance("editor");
  createPostBtn.addEventListener("click", function (e) {
    e.preventDefault();
    let content = getHTMLContent(editor);
    console.log(content);
    // renderHTMLContent("output", content);
  });
}
if (editPostForm) {
  let editor = getQuillInstance("editor");
  editPostBtn.addEventListener("click", function (e) {
    e.preventDefault();
    let content = getHTMLContent(editor);
    console.log(content);
    // renderHTMLContent("output", content);
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    login(email.value, password.value);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}
