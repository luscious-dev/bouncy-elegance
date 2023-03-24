const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/signup", authController.signup);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

router.patch("/updateMe", authController.protect, userController.updateMe);
router.delete("/deleteMe", authController.protect, userController.deleteMe);
router.get(
  "/me",
  authController.protect,
  userController.getMe,
  userController.getUser
);

router
  .route("/:id")
  .get(
    authController.protect,
    authController.restrict("admin"),
    userController.getUser
  )
  .patch(userController.updateUser)
  .delete(
    authController.protect,
    authController.restrict("admin"),
    userController.deleteUser
  );

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

module.exports = router;
