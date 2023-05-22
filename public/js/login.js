import axios from "axios";
import { showAlert } from "./alerts";

export const login = (email, password) => {
  axios
    .post("/api/v1/users/login", {
      email,
      password,
    })
    .then((res) => {
      console.log(res);
      // SHow alert
      console.log("Logged in successfully");
      showAlert("success", "Logged in successfully");

      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    })
    .catch((err) => {
      // How alert
      showAlert("error", err.response.data.message);
    });
};

export const logout = () => {
  axios
    .get("/api/v1/users/logout")
    .then((res) => {
      console.log(res);
      // SHow alert
      showAlert("success", "Logged out successfully");

      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    })
    .catch((err) => {
      // How alert
      showAlert("error", "Error logging out! Try again");
    });
};
