const express = require("express");
const controller = require("../controllers/fraudController");

const router = express.Router();

router.get("/alerts", controller.getAlerts);
router.get("/graph", controller.getGraph);

module.exports = router;

