import axios from "axios";
import { showAlert } from "./alerts";

export const createPost = async function (data) {
  try {
    await axios.post("/api/v1/blog/posts", data);

    showAlert("success", "Post Created Successfully");
    setTimeout(() => {
      location.assign("/posts");
    }, 1500);
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};

export const editPost = async function (data, postId) {
  try {
    await axios.patch(`/api/v1/blog/posts/${postId}`, data);

    showAlert("success", "Post Updated Successfully");
    setTimeout(() => {
      location.assign("/posts");
    }, 1500);
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};
export const deletePost = async function (postId) {
  try {
    await axios.delete(`/api/v1/blog/posts/${postId}`);

    showAlert("success", "Post Deleted Successfully");
    setTimeout(() => {
      location.assign("/posts");
    }, 1500);
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};
