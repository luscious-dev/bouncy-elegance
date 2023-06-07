const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.get("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// Protect all the routes
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);

router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.updateMe
);
router.delete("/deleteMe", userController.deleteMe);
router.delete(
  "/:userId/removeWriter",
  authController.restrict("admin", "blog-owner"),
  userController.removeWriter
);

router.get("/me", userController.getMe, userController.getUser);

// Restricetd to admin only
router.use(authController.restrict("admin"));
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

module.exports = router;
