const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/signup", authController.signup);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);

module.exports = router;
