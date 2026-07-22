const express = require("express");
const router = express.Router();
const controller = require("../controllers/ParagraphController");

router.get("/", controller.list);
router.get("/:id", controller.getOne);
router.delete("/:id", controller.remove);
router.post("/delete-many", controller.removeMany);

module.exports = router;
