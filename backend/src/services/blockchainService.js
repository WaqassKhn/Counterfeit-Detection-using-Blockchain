const { ethers } = require("ethers");
const config = require("../config");

const contractAbi = [
  "function registerProduct(string serialId, string manufacturer) external",
  "function transferProduct(string serialId, string role, string location) external",
  "function getProduct(string serialId) external view returns (string,string,bool,uint256)",
  "function getProductHistory(string serialId) external view returns ((string role,string location,uint256 timestamp,address actor)[])"
];

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.signer = config.privateKey ? new ethers.Wallet(config.privateKey, this.provider) : null;
    this.contract = this.signer && config.contractAddress
      ? new ethers.Contract(config.contractAddress, contractAbi, this.signer)
      : null;
  }

  ensureReady() {
    if (!this.contract) {
      const error = new Error("Blockchain service is not configured. Set PRIVATE_KEY and CONTRACT_ADDRESS.");
      error.statusCode = 500;
      throw error;
    }
  }

  async registerProduct(serialId, manufacturer) {
    this.ensureReady();
    const tx = await this.contract.registerProduct(serialId, manufacturer);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  async transferProduct(serialId, role, location) {
    this.ensureReady();
    const tx = await this.contract.transferProduct(serialId, role, location);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  async getProduct(serialId) {
    this.ensureReady();
    const [productSerialId, manufacturer, exists] = await this.contract.getProduct(serialId);

    if (!exists) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    const events = await this.contract.getProductHistory(serialId);
    return {
      serialId: productSerialId,
      manufacturer,
      events: events.map((event) => ({
        role: event.role,
        location: event.location,
        timestamp: Number(event.timestamp),
        actorAddress: event.actor
      }))
    };
  }
}

module.exports = new BlockchainService();

