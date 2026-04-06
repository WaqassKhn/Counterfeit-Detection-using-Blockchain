const express = require("express");
const cors = require("cors");
const config = require("./config");
const productRoutes = require("./routes/productRoutes");
const fraudRoutes = require("./routes/fraudRoutes");
const authRoutes = require("./routes/authRoutes");
const nfcRoutes = require("./routes/nfcRoutes");

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

app.use("/auth", authRoutes);
app.use("/product", productRoutes);
app.use("/fraud", fraudRoutes);
app.use("/nfc", nfcRoutes);

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    error: error.message || "Internal server error"
  });
});

module.exports = app;
