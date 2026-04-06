const blockchainService = require("../services/blockchainService");
const alertStore = require("../services/alertStore");
const { callFraudService } = require("../services/fraudService");
const { validateRegisterPayload, validateLogisticsPayload, validateDistributorPayload } = require("../utils/validation");
const { getDistributors } = require("../data/actors");

function ensureDistributorDestination(destination) {
  const distributors = getDistributors();
  const match = distributors.find(
    (distributor) =>
      distributor.location.toLowerCase() === destination.toLowerCase() ||
      distributor.displayName.toLowerCase() === destination.toLowerCase()
  );

  if (!match) {
    const error = new Error("Final logistics destination must be an authorized distributor location or name.");
    error.statusCode = 400;
    throw error;
  }

  return match;
}

async function analyzeAndStore(serialId) {
  const history = await blockchainService.getProduct(serialId);
  const analysis = await callFraudService({
    serialId,
    product: {
      manufacturerName: history.manufacturerName,
      batchNumber: history.batchNumber,
      manufactureDate: history.manufactureDate
    },
    history: history.events
  });

  alertStore.update(serialId, analysis, history);

  return {
    ...history,
    fraud: analysis,
    path: history.events.map((event) => `${event.department}:${event.eventType}`)
  };
}

async function registerProduct(req, res, next) {
  try {
    validateRegisterPayload(req.body);
    const { serialId, batchNumber, manufactureDate } = req.body;
    const result = await blockchainService.registerProduct(
      serialId.trim(),
      req.actor.displayName,
      batchNumber.trim(),
      manufactureDate.trim()
    );
    const snapshot = await analyzeAndStore(serialId.trim());

    res.status(201).json({
      message: "Product registered successfully",
      serialId,
      txHash: result.txHash,
      snapshot
    });
  } catch (error) {
    next(error);
  }
}

async function createLogisticsStop(req, res, next) {
  try {
    validateLogisticsPayload(req.body);
    const { serialId, origin, destination, notes = "" } = req.body;
    const history = await blockchainService.getProduct(serialId.trim());
    const logisticsEvents = history.events.filter((event) => event.department === "Logistics");
    const source = logisticsEvents.length === 0 ? history.manufacturerName : origin.trim();

    const result = await blockchainService.addLifecycleEvent(serialId.trim(), {
      department: "Logistics",
      eventType: "TRANSIT_STOP",
      location: destination.trim(),
      source,
      destination: destination.trim(),
      actorId: req.actor.id,
      notes: notes.trim()
    });
    const snapshot = await analyzeAndStore(serialId.trim());

    res.status(201).json({
      message: "Logistics stop recorded successfully",
      serialId,
      txHash: result.txHash,
      snapshot
    });
  } catch (error) {
    next(error);
  }
}

async function closeLogisticsCycle(req, res, next) {
  try {
    validateLogisticsPayload(req.body);
    const { serialId, origin, destination, notes = "" } = req.body;
    const distributor = ensureDistributorDestination(destination.trim());
    const history = await blockchainService.getProduct(serialId.trim());
    const logisticsEvents = history.events.filter((event) => event.department === "Logistics");
    const source = logisticsEvents.length === 0 ? history.manufacturerName : origin.trim();

    const result = await blockchainService.addLifecycleEvent(serialId.trim(), {
      department: "Logistics",
      eventType: "DELIVERED_TO_DISTRIBUTOR",
      location: distributor.location,
      source,
      destination: distributor.location,
      actorId: req.actor.id,
      notes: notes.trim() || distributor.displayName
    });
    const snapshot = await analyzeAndStore(serialId.trim());

    res.status(201).json({
      message: "Logistics cycle closed at distributor",
      serialId,
      txHash: result.txHash,
      snapshot
    });
  } catch (error) {
    next(error);
  }
}

async function recordRetail(req, res, next) {
  try {
    validateDistributorPayload(req.body);
    const { serialId, customerName, dateOfRetail } = req.body;
    const result = await blockchainService.addLifecycleEvent(serialId.trim(), {
      department: "Distributor",
      eventType: "RETAILED",
      location: req.actor.location,
      source: req.actor.displayName,
      destination: customerName.trim(),
      actorId: req.actor.id,
      notes: dateOfRetail.trim()
    });
    const snapshot = await analyzeAndStore(serialId.trim());

    res.status(201).json({
      message: "Retail delivery recorded successfully",
      serialId,
      txHash: result.txHash,
      snapshot
    });
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const snapshot = await analyzeAndStore(req.params.serialId);
    res.json({
      serialId: snapshot.serialId,
      manufacturerName: snapshot.manufacturerName,
      batchNumber: snapshot.batchNumber,
      manufactureDate: snapshot.manufactureDate,
      path: snapshot.path,
      events: snapshot.events,
      fraudWarnings: snapshot.fraud.findings,
      authenticityStatus: snapshot.fraud.authenticityStatus,
      failurePoint: snapshot.fraud.failurePoint,
      graph: snapshot.fraud.graph
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerProduct,
  createLogisticsStop,
  closeLogisticsCycle,
  recordRetail,
  getProduct
};
