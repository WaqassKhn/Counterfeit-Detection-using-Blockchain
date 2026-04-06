const { ethers } = require("ethers");
const config = require("../config");

const contractAbi = [
  "function registerProduct(string serialId,string manufacturerName,string batchNumber,string manufactureDate) external",
  "function addLifecycleEvent(string serialId,string department,string eventType,string location,string source,string destination,string actorId,string notes) external",
  "function getProduct(string serialId) external view returns (string,string,string,string,bool,uint256)",
  "function getProductHistory(string serialId) external view returns ((string department,string eventType,string location,string source,string destination,string actorId,string notes,uint256 timestamp,address actor)[])"
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

  async registerProduct(serialId, manufacturerName, batchNumber, manufactureDate) {
    this.ensureReady();
    const tx = await this.contract.registerProduct(serialId, manufacturerName, batchNumber, manufactureDate);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  async addLifecycleEvent(serialId, lifecycleEvent) {
    this.ensureReady();
    const tx = await this.contract.addLifecycleEvent(
      serialId,
      lifecycleEvent.department,
      lifecycleEvent.eventType,
      lifecycleEvent.location,
      lifecycleEvent.source || "",
      lifecycleEvent.destination || "",
      lifecycleEvent.actorId || "",
      lifecycleEvent.notes || ""
    );
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  async getProduct(serialId) {
    this.ensureReady();
    const [productSerialId, manufacturerName, batchNumber, manufactureDate, exists] = await this.contract.getProduct(serialId);

    if (!exists) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    const events = await this.contract.getProductHistory(serialId);
    return {
      serialId: productSerialId,
      manufacturerName,
      batchNumber,
      manufactureDate,
      events: events.map((event) => ({
        department: event.department,
        eventType: event.eventType,
        location: event.location,
        source: event.source,
        destination: event.destination,
        actorId: event.actorId,
        notes: event.notes,
        timestamp: Number(event.timestamp),
        actorAddress: event.actor
      }))
    };
  }
}

module.exports = new BlockchainService();
