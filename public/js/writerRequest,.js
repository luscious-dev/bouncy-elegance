import axios from "axios";
import { showAlert } from "./alerts";

export const sendWriterRequest = (data) => {
  axios
    .post("/api/v1/writer-request", data)
    .then((res) => {
      showAlert("success", "Request Sent Successfully!");
    })
    .catch((err) => {
      showAlert("error", err.response.data.message);
    });
};

export const acceptWriter = (requestId, card) => {
  axios
    .patch(`/api/v1/writer-request/${requestId}`, { isAccepted: true })
    .then((res) => {
      showAlert("success", "Request Accepted. You have a new writer!");
      card.remove();
    })
    .catch((err) => {
      showAlert("error", err.response.data.message);
    });
};

export const rejectWriter = (requestId, card) => {
  axios
    .delete(`/api/v1/writer-request/${requestId}`)
    .then((res) => {
      showAlert("success", "Request rejected!");
      card.remove();
    })
    .catch((err) => {
      showAlert("error", err.response.data.message);
    });
};
