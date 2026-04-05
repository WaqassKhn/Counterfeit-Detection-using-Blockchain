const express = require("express");
const cors = require("cors");
const config = require("./config");
const productRoutes = require("./routes/productRoutes");
const fraudRoutes = require("./routes/fraudRoutes");

const app = express();

app.use(
  cors({
    origin: config.corsOrigin
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/product", productRoutes);
app.use("/fraud", fraudRoutes);

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    error: error.message || "Internal server error"
  });
});

module.exports = app;

