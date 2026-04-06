const actors = [
  {
    id: "manufacturer-node-1",
    username: "manufacturer1",
    password: "atlas-manufacturer",
    role: "Manufacturer",
    displayName: "Atlas Corp Manufacturing Hub",
    location: "Mumbai Factory",
    walletHint: "Hardhat Account #0"
  },
  {
    id: "logistics-node-1",
    username: "logistics1",
    password: "atlas-logistics",
    role: "Logistics",
    displayName: "Logistics Node 1",
    location: "Mumbai",
    walletHint: "Hardhat Account #1"
  },
  {
    id: "logistics-node-2",
    username: "logistics2",
    password: "atlas-logistics",
    role: "Logistics",
    displayName: "Logistics Node 2",
    location: "Delhi",
    walletHint: "Hardhat Account #2"
  },
  {
    id: "distributor-node-1",
    username: "distributor1",
    password: "atlas-distributor",
    role: "Distributor",
    displayName: "TechSupply Distribution",
    location: "Goa",
    walletHint: "Hardhat Account #3"
  },
  {
    id: "distributor-node-2",
    username: "distributor2",
    password: "atlas-distributor",
    role: "Distributor",
    displayName: "SouthParts Distribution",
    location: "Tamil Nadu",
    walletHint: "Hardhat Account #4"
  }
];

function sanitizeActor(actor) {
  const { password, ...safeActor } = actor;
  return safeActor;
}

function findActorByCredentials(username, password) {
  return actors.find((actor) => actor.username === username && actor.password === password) || null;
}

function findActorById(id) {
  return actors.find((actor) => actor.id === id) || null;
}

function getDistributors() {
  return actors.filter((actor) => actor.role === "Distributor").map(sanitizeActor);
}

module.exports = {
  actors,
  sanitizeActor,
  findActorByCredentials,
  findActorById,
  getDistributors
};
