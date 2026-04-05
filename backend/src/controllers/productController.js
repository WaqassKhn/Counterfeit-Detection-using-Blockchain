const blockchainService = require("../services/blockchainService");
const alertStore = require("../services/alertStore");
const { callFraudService } = require("../services/fraudService");
const { validateRegisterPayload, validateTransferPayload } = require("../utils/validation");

async function analyzeAndStore(serialId) {
  const history = await blockchainService.getProduct(serialId);
  const analysis = await callFraudService({
    serialId,
    manufacturer: history.manufacturer,
    history: history.events
  });

  alertStore.update(serialId, analysis, history);

  return {
    ...history,
    fraud: analysis,
    path: history.events.map((event) => event.role)
  };
}

async function registerProduct(req, res, next) {
  try {
    validateRegisterPayload(req.body);
    const { serialId, manufacturer } = req.body;
    const result = await blockchainService.registerProduct(serialId.trim(), manufacturer.trim());
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

async function transferProduct(req, res, next) {
  try {
    validateTransferPayload(req.body);
    const { serialId, role, location, actorId } = req.body;
    const result = await blockchainService.transferProduct(serialId.trim(), role.trim(), location.trim());
    const snapshot = await analyzeAndStore(serialId.trim());

    res.status(201).json({
      message: "Transfer recorded successfully",
      serialId,
      actorId: actorId || null,
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
      manufacturer: snapshot.manufacturer,
      path: snapshot.path,
      events: snapshot.events,
      fraudWarnings: snapshot.fraud.findings,
      authenticityStatus: snapshot.fraud.authenticityStatus
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerProduct,
  transferProduct,
  getProduct
};

