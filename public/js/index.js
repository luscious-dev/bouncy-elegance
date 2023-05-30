import "@babel/polyfill";
import { login, logout } from "./login";
import { updateUser } from "./updateSettings";
import { createPost, editPost, deletePost } from "./create-post";
import { getQuillInstance, getHTMLContent, renderHTMLContent } from "./editor";

// DOM ELEMENTS
const loginForm = document.querySelector(".form--login");
const logOutBtn = document.querySelector("#navbar__logout");

const updateUserNameForm = document.querySelector("#user-name");
const updateUserPasswordForm = document.querySelector("#user-password");

const createPostForm = document.querySelector(".form--create-post");
const createPostBtn = document.querySelector("#create-post");

const editPostForm = document.querySelector(".form--edit-post");
const editPostBtn = document.querySelector("#edit-post");
const deletePostBtn = document.querySelector("#delete-post");

if (updateUserNameForm) {
  updateUserNameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const firstName = document.querySelector("#firstname").value;
    const lastName = document.querySelector("#lastname").value;
    updateUser({ firstName, lastName }, "name");
  });
}

if (updateUserPasswordForm) {
  updateUserPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const currentPassword = document.querySelector("#password-current").value;
    const password = document.querySelector("#password").value;
    const passwordConfirm = document.querySelector("#password-confirm").value;

    updateUser({ currentPassword, password, passwordConfirm }, "password");

    document.querySelector("#password-current").value = "";
    document.querySelector("#password").value = "";
    document.querySelector("#password-confirm").value = "";
  });
}

if (createPostForm) {
  let editor = getQuillInstance("editor");
  createPostBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    let content = getHTMLContent(editor);
    let form = new FormData();

    form.append("title", document.getElementById("title").value);
    form.append("body", content);
    form.append("description", document.getElementById("description").value);
    form.append("photo", document.getElementById("thumbnail").files[0]);
    form.append("published", document.getElementById("published").checked);
    form.append("featured", document.getElementById("featured").checked);
    form.append("category", document.getElementById("category").value);

    let tags = document.getElementById("tags").value;
    let newTags = tags.split(",").map((tag) => {
      let tmp = tag.trim();
      return tmp.charAt(0).toUpperCase() + tmp.slice(1);
    });

    form.append("tags", newTags);
    await createPost(form);
  });
}
if (editPostForm) {
  let editor = getQuillInstance("editor");
  editPostBtn.addEventListener("click", async function (e) {
    e.preventDefault();

    let content = getHTMLContent(editor);
    let form = new FormData();

    form.append("title", document.getElementById("title").value);
    form.append("body", content);
    form.append("description", document.getElementById("description").value);
    form.append("photo", document.getElementById("thumbnail").files[0]);
    form.append("published", document.getElementById("published").checked);
    form.append("featured", document.getElementById("featured").checked);
    form.append("category", document.getElementById("category").value);

    let tags = document.getElementById("tags").value;
    let newTags = tags.split(",").map((tag) => {
      let tmp = tag.trim();
      return tmp.charAt(0).toUpperCase() + tmp.slice(1);
    });

    form.append("tags", newTags);

    await editPost(form, editPostBtn.dataset.postId);
  });

  deletePostBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    const result = confirm("Are you sure?");
    if (result) {
      await deletePost(editPostBtn.dataset.postId);
    } else {
    }
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
