import "@babel/polyfill";
import { login, logout, signUp } from "./login";
import { updateUser } from "./updateSettings";
import { createPost, editPost, deletePost } from "./create-post";
import {
  sendWriterRequest,
  acceptWriter,
  rejectWriter,
} from "./writerRequest,";
import {
  getReplies,
  removeReplies,
  postComment,
  deleteComment,
} from "./comments";
import { getQuillInstance, getHTMLContent, renderHTMLContent } from "./editor";
import { removeWriter } from "./removeWriter";

// DOM ELEMENTS
const loginForm = document.querySelector(".form--login");
const logOutBtn = document.querySelector("#navbar__logout");

const signupForm = document.querySelector(".form--signup");

const writerGrid = document.querySelector(".writer-grid");
const requestGrid = document.querySelector(".request-grid");

const writerRequestForm = document.querySelector(".form--writer-request");

const updateUserNameForm = document.querySelector("#user-name");
const updateUserPasswordForm = document.querySelector("#user-password");

const createPostForm = document.querySelector(".form--create-post");
const createPostBtn = document.querySelector("#create-post");

const editPostForm = document.querySelector(".form--edit-post");
const editPostBtn = document.querySelector("#edit-post");
const deletePostBtn = document.querySelector("#delete-post");

const postCommentSection = document.querySelector(".post__comments");
const postCommentForm = document.querySelector("#send-comment");
const postCommentBtn = document.querySelector("#send-comment button");
const postCommentTextArea = document.querySelector("#send-comment #comment");

const navToggler = document.querySelector(".navbar__toggler");
const navMenu = document.querySelector(".navbar__menu");

const settingsMenu = document.querySelector(".user-view__menu-toggle");
const settingsSideNav = document.querySelector(".user-view__menu");
const navMenuLogout = document.querySelector("#navbar-menu__logout");

const animateable = document.querySelectorAll(".animateable");

const intersectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Add a class or apply any styles to start the animation
      entry.target.classList.add("animate");
    } else {
      // Remove the class or reset styles if needed
      entry.target.classList.remove("animate");
    }
  });
});

animateable.forEach((element) => {
  intersectionObserver.observe(element);
});

if (settingsMenu) {
  settingsMenu.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Clicked");
    settingsSideNav.classList.toggle("open");
  });
}

navToggler.addEventListener("click", (e) => {
  navToggler.classList.toggle("active");
  navMenu.classList.toggle("open");
});

if (postCommentSection) {
  // let postCommentBtn = postCommentForm.querySelector("button");

  postCommentSection.addEventListener("click", (e) => {
    if (e.target.classList.contains("show-replies")) {
      let parentContainer = e.target.closest(".comment__container");
      let id = parentContainer.dataset.commentId;

      if (!parentContainer.classList.contains("open")) {
        getReplies(id, parentContainer);
        postCommentBtn.setAttribute("data-comment-id", id);
        // e.target.classList.add("active");
        postCommentTextArea.setAttribute("placeholder", "Reply to comment...");
        parentContainer.classList.add("open");
      } else {
        removeReplies(id, parentContainer);
        postCommentBtn.removeAttribute("data-comment-id");
        postCommentTextArea.setAttribute("placeholder", "Comment on post...");
        parentContainer.classList.remove("open");
      }
    }
    if (e.target.classList.contains("delete")) {
      let parentContainer = e.target.closest(".comment__container");
      let id = parentContainer.dataset.commentId;

      deleteComment(id, parentContainer);
      postCommentBtn.removeAttribute("data-comment-id");
      postCommentTextArea.setAttribute("placeholder", "Comment on post...");
    }
  });

  if (postCommentForm) {
    postCommentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let message = postCommentTextArea.value;
      if (postCommentBtn.dataset.commentId) {
        let parentElement = postCommentSection.querySelector(
          `[data-comment-id='${postCommentBtn.dataset.commentId}']`
        );
        postComment(
          message,
          postCommentBtn.dataset.postId,
          postCommentBtn.dataset.commentId,
          parentElement
        );
      } else {
        postComment(
          message,
          postCommentBtn.dataset.postId,
          null,
          postCommentSection
        );
      }
      postCommentTextArea.value = "";
    });
  }
}

if (updateUserNameForm) {
  const fileInput = document.querySelector("#photo");
  const imagePreview = document.querySelector(".form__user-photo");
  const loginProfile = document.querySelector(".profile__image img");
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    const reader = new FileReader();

    console.log(file);
    reader.addEventListener("load", () => {
      imagePreview.src = reader.result;
      loginProfile.src = reader.result;
    });
    // reader.onload = function (e) {
    //   imagePreview.src = e.target.result;
    //   loginProfile.src = e.target.result;
    // };
    reader.readAsDataURL(file);
  });
  updateUserNameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("firstName", document.querySelector("#firstname").value);
    form.append("lastName", document.querySelector("#lastname").value);
    form.append("profilePhoto", document.querySelector("#photo").files[0]);

    updateUser(form, "name");
  });
}

if (updateUserPasswordForm) {
  updateUserPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const form = new FormData();

    form.append(
      "currentPassword",
      document.querySelector("#password-current").value
    );
    form.append("password", document.querySelector("#password").value);
    form.append(
      "passwordConfirm",
      document.querySelector("#password-confirm").value
    );

    updateUser(form, "password");

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

    form.append("tags", JSON.stringify(newTags));
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

    form.append("tags", JSON.stringify(newTags));

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

if (writerRequestForm) {
  // Add event literne
  writerRequestForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = document.querySelector("#message");
    sendWriterRequest({ message: message.value });

    message.value = "";
  });
}

if (writerGrid) {
  const buttons = document.querySelectorAll(".card-btn");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", (e) => {
      e.preventDefault();

      e.target.textContent = "working...";
      removeWriter(
        e.target.dataset.writerId,
        e.target.parentElement.parentElement
      );
    });
  }
}

if (requestGrid) {
  const acceptButtons = document.querySelectorAll(".accept");
  const rejectButtons = document.querySelectorAll(".reject");

  for (let i = 0; i < acceptButtons.length; i++) {
    acceptButtons[i].addEventListener("click", (e) => {
      e.preventDefault();

      e.target.textContent = "working...";
      acceptWriter(
        e.target.dataset.requestId,
        e.target.closest(".card--request")
      );
    });
  }

  for (let i = 0; i < rejectButtons.length; i++) {
    rejectButtons[i].addEventListener("click", (e) => {
      e.preventDefault();

      e.target.textContent = "working...";
      rejectWriter(
        e.target.dataset.requestId,
        e.target.closest(".card--request")
      );
    });
  }
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
if (navMenuLogout) {
  navMenuLogout.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      email: document.getElementById("email").value,
      firstName: document.getElementById("fname").value,
      lastName: document.getElementById("lname").value,
      password: document.getElementById("password").value,
      passwordConfirm: document.getElementById("confirm-password").value,
    };
    signUp(data);
  });
}
