function assertString(value, fieldName) {
  if (!value || typeof value !== "string" || !value.trim()) {
    const error = new Error(`${fieldName} is required`);
    error.statusCode = 400;
    throw error;
  }
}

function validateRegisterPayload(body) {
  assertString(body.serialId, "serialId");
  assertString(body.batchNumber, "batchNumber");
  assertString(body.manufactureDate, "manufactureDate");
}

function validateLogisticsPayload(body) {
  assertString(body.serialId, "serialId");
  assertString(body.origin, "origin");
  assertString(body.destination, "destination");
}

function validateDistributorPayload(body) {
  assertString(body.serialId, "serialId");
  assertString(body.customerName, "customerName");
  assertString(body.dateOfRetail, "dateOfRetail");
}

module.exports = {
  validateRegisterPayload,
  validateLogisticsPayload,
  validateDistributorPayload
};
