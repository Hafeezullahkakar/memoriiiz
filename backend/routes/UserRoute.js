const express = require("express");
const router = express.Router();
const auth = require("../middlerwares/authMiddleware");
const userController = require("../controllers/UserController");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.delete("/delete", auth, userController.deleteUser);
router.post("/tokenIsValid", userController.checkTokenValidity);
router.get("/", auth, userController.getUserProfile);

module.exports = router;
