const express = require("express");
const controller = require("../controllers/productController");

const router = express.Router();

router.post("/register", controller.registerProduct);
router.post("/transfer", controller.transferProduct);
router.get("/:serialId", controller.getProduct);

module.exports = router;

