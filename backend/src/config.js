require("dotenv").config();

module.exports = {
  port: process.env.PORT || 4000,
  rpcUrl: process.env.RPC_URL || "http://127.0.0.1:8545",
  privateKey: process.env.PRIVATE_KEY || "",
  contractAddress: process.env.CONTRACT_ADDRESS || "",
  fraudServiceUrl: process.env.FRAUD_SERVICE_URL || "http://127.0.0.1:5000",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "atlas-demo-secret"
};
