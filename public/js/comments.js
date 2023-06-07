import axios from "axios";
import { showAlert } from "./alerts";

export const getReplies = function (commentId, parentContainer) {
  axios
    .get(`/api/v1/comments/${commentId}`)
    .then((res) => {
      //   console.log(res);
      const replies = res.data.data.comment.replies;
      replies.forEach((reply) => {
        const replyCardContainer = `
        <div class="comment__container" parentId="${commentId}" data-comment-id="${
          reply._id
        }">
          <div class="comment__card">
            <div class="author">
              <div class="author__image">
                <div class="img-wrapper">
                  <img src="/img/users/${
                    reply.user.profilePhoto
                      ? reply.user.profilePhoto
                      : "default.jpg"
                  }">
                </div>
              </div>
              <div class="author__name">
                <strong>${reply.user.firstName} ${reply.user.lastName}</strong>
              </div>
            </div>

            <div class="content">
              <p>${reply.comment}</p>
              <div class="comment__card-footer">
                ${reply.canDelete ? "<div class='delete'>Delete</div>" : ""}
                <div class="show-replies">Replies 0</div>
              </div>
            </div>
        </div>`;

        parentContainer.insertAdjacentHTML("beforeend", replyCardContainer);
      });
    })
    .catch((err) => {
      console.log(err.response.data.message);
    });
};

export const removeReplies = function (commentId, parentContainer) {
  const replies = document.querySelectorAll(`[parentId='${commentId}']`);
  replies.forEach((reply) => {
    parentContainer.removeChild(reply);
  });
};

export const postComment = function (
  comment,
  postId,
  commentId = null,
  parentContainer
) {
  if (!commentId) {
    axios
      .post(`/api/v1/comments`, { blogPostId: postId, comment })
      .then((res) => {
        const comment = res.data.data.comment;
        console.log(comment);
        const newCommentContainer = document.createElement("div");
        newCommentContainer.classList.add("comment__container");
        newCommentContainer.setAttribute("data-comment-id", comment._id);
        newCommentContainer.innerHTML = `
        <div class="comment__card">
          <div class="author">
              <div class="author__image">
                <div class="img-wrapper">
                  <img src="/img/users/${
                    comment.user.profilePhoto
                      ? comment.user.profilePhoto
                      : "default.jpg"
                  }">
                </div>
              </div>
              <div class="author__name">
                <strong>${comment.user.firstName} ${
          comment.user.lastName
        }</strong>
              </div>
            </div>

          <div class="content">
            <p>${comment.comment}</p>
            <div class="comment__card-footer">
            ${comment.canDelete ? "<div class='delete'>Delete</div>" : ""}
              <div class="show-replies">Replies 0</div>
          </div>
        </div>`;

        parentContainer.insertBefore(
          newCommentContainer,
          document.querySelector("#create-comment-container")
        );
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    axios
      .post(`/api/v1/comments/${postId}/reply`, { comment, commentId })
      .then((res) => {
        //   console.log(res);
        const comment = res.data.data.newComment;

        const newCommentContainer = `<div class="comment__container" parentId="${commentId}" data-comment-id="${
          comment._id
        }">
        <div class="comment__card">
          <div class="author">
            <div class="author__image">
              <div class="img-wrapper">
                <img src="/img/users/${
                  comment.user.profilePhoto
                    ? comment.user.profilePhoto
                    : "default.jpg"
                }">
              </div>
            </div>
            <div class="author__name">
              <strong>${comment.user.firstName} ${
          comment.user.lastName
        }</strong>
            </div>
          </div>
          <div class='content'>
            <p>${comment.comment}</p>
            <div class="comment__card-footer">
            ${comment.canDelete ? "<div class='delete'>Delete</div>" : ""}
              <div class="show-replies">Replies 0</div>
            </div>
          </div>
        </div>`;

        parentContainer.insertAdjacentHTML("beforeend", newCommentContainer);
      })
      .catch((err) => {
        showAlert("error", err.response.data.message);
        // console.log(err);
      });
  }
};

export const deleteComment = function (commentId, parentContainer) {
  axios
    .delete(`/api/v1/comments/${commentId}`)
    .then((res) => {
      showAlert("success", "Comment removed!");
      parentContainer.remove();
    })
    .catch((err) => {
      console.log(err.response.data.message);
    });
};
