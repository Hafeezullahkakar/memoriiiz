// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");

router.post("/:userId/words", userController.addWord);

module.exports = router;
