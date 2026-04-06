const express = require("express");
const controller = require("../controllers/productController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/:serialId", controller.getProduct);
router.post("/register", requireAuth, requireRole(["Manufacturer"]), controller.registerProduct);
router.post("/logistics/stop", requireAuth, requireRole(["Logistics"]), controller.createLogisticsStop);
router.post("/logistics/complete", requireAuth, requireRole(["Logistics"]), controller.closeLogisticsCycle);
router.post("/distributor/retail", requireAuth, requireRole(["Distributor"]), controller.recordRetail);

module.exports = router;
