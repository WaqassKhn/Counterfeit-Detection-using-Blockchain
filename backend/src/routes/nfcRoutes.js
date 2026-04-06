const express = require("express");
const controller = require("../controllers/nfcController");

const router = express.Router();

router.get("/tags", controller.getTags);
router.get("/read/:tagId", controller.readTag);

module.exports = router;
