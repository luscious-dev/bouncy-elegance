import axios from "axios";
import { showAlert } from "./alerts";

export const updateUser = function (data, type) {
  const api =
    type === "password"
      ? "/api/v1/users/updateMyPassword"
      : "/api/v1/users/updateMe";
  axios
    .patch(api, data)
    .then((res) => {
      showAlert("success", "Profile updated successfully");
    })
    .catch((err) => {
      showAlert("error", err.response.data.message);
    });
};
