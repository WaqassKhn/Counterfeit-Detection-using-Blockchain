const { Buffer } = require("buffer");
const { findActorById, sanitizeActor } = require("../data/actors");

function decodeToken(token) {
  try {
    const raw = Buffer.from(token, "base64").toString("utf8");
    const [id] = raw.split(":");
    return findActorById(id) || null;
  } catch (error) {
    return null;
  }
}

function issueToken(actor) {
  return Buffer.from(`${actor.id}:${actor.role}`, "utf8").toString("base64");
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const actor = decodeToken(token);

  if (!actor) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.actor = sanitizeActor(actor);
  return next();
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.actor || !roles.includes(req.actor.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return next();
  };
}

module.exports = {
  issueToken,
  requireAuth,
  requireRole
};
