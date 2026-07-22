const express = require("express");
const router = express.Router();
const aiController = require("../controllers/AiController");

router.post("/ask", aiController.ask);
router.post("/generate-paragraph", aiController.generateParagraph);

module.exports = router;
