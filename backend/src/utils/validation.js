const allowedRoles = ["Manufacturer", "Logistics", "Distributor", "Retailer"];

function assertString(value, fieldName) {
  if (!value || typeof value !== "string" || !value.trim()) {
    const error = new Error(`${fieldName} is required`);
    error.statusCode = 400;
    throw error;
  }
}

function validateRegisterPayload(body) {
  assertString(body.serialId, "serialId");
  assertString(body.manufacturer, "manufacturer");
}

function validateTransferPayload(body) {
  assertString(body.serialId, "serialId");
  assertString(body.role, "role");
  assertString(body.location, "location");

  if (!allowedRoles.includes(body.role)) {
    const error = new Error(`role must be one of: ${allowedRoles.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
}

module.exports = {
  allowedRoles,
  validateRegisterPayload,
  validateTransferPayload
};

