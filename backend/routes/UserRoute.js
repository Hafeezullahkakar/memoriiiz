const express = require("express");
const router = express.Router();
const auth = require("../middlerwares/authMiddleware");
const userController = require("../controllers/UserController");

// Public
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/refresh", userController.refresh);
router.post("/logout", userController.logout);

// Protected
router.get("/me", auth, userController.getUserProfile);
router.get("/", auth, userController.getUserProfile); // backwards compat
router.delete("/delete", auth, userController.deleteUser);

module.exports = router;
