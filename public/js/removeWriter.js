import axios from "axios";
import { showAlert } from "./alerts";

export const removeWriter = function (userId, card) {
  axios
    .delete(`/api/v1/users/${userId}/removeWriter`)
    .then((res) => {
      showAlert("success", "Writer removed successfully");
      card.remove();
    })
    .catch((err) => {
      showAlert("error", err.response.data.message);
      return;
    });
};
