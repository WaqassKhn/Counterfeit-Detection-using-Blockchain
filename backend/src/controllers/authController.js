const { findActorByCredentials, getDistributors, sanitizeActor, actors } = require("../data/actors");
const { issueToken } = require("../middleware/auth");

function login(req, res) {
  const { username, password } = req.body || {};
  const actor = findActorByCredentials(username, password);

  if (!actor) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  return res.json({
    token: issueToken(actor),
    actor: sanitizeActor(actor),
    distributors: getDistributors()
  });
}

function getActors(req, res) {
  res.json({
    actors: actors.map(sanitizeActor),
    distributors: getDistributors()
  });
}

module.exports = {
  login,
  getActors
};
