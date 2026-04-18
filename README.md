# Atlas Corp Counterfeit Prevention Network
# Video Link: https://drive.google.com/file/d/142zPAwGgf17adtQEdkUX6eYRjPt2ulMj/view?usp=sharing
Atlas Corp needs a supply-chain system that does two things at the same time: keep a tamper-resistant lifecycle record for each spare part, and make suspicious movement visible before a fake part reaches a customer.

This project is a permissioned blockchain-based tracking platform with role-gated operational portals, multi-stop logistics support, dummy NFC extraction, anomaly detection, and a customer-facing verification flow.

## What The System Does

The system tracks each product from manufacturing to final retail completion using a private Ethereum-style network.

Core outcomes:

- manufacturer registers a product with serial number, batch number, and manufacture date
- logistics can record multiple transit stops across cities before handing off to a distributor
- distributor records final retail completion tied to its own location
- customers can verify the full lifecycle of a product by serial number
- Atlas can detect suspicious transitions, broken logistics flows, and endpoint mismatches

## Core Modules

1. `frontend/`
React + Vite + Tailwind user interface with:
- public authenticity verification
- role-based login
- manufacturer portal
- logistics portal
- distributor portal
- fraud intelligence dashboard

2. `backend/`
Node.js + Express orchestration layer that:
- validates role-based actions
- signs blockchain transactions
- exposes auth, product, fraud, and NFC endpoints
- computes or retrieves fraud findings

3. `blockchain/`
Hardhat + Solidity private smart-contract layer that stores:
- product metadata
- append-only lifecycle events
- authorized writer addresses

4. `ai-service/`
Flask service for fraud analysis, with rule-based and ML-ready anomaly detection support.

## Updated Business Flow

```text
Manufacturer registers product
        |
        v
Logistics records stop 1
        |
        v
Logistics records stop 2
        |
        v
Logistics records stop N
        |
        v
Logistics closes cycle at authorized distributor
        |
        v
Distributor records retail delivery
        |
        v
Customer verifies authenticity
```

This means the logistics chain is no longer a single step. It can span multiple transit locations before reaching a distributor.

## Roles And Access Model

The application now uses role-gated dummy accounts in the backend.

Roles:

- `Manufacturer`
- `Logistics`
- `Distributor`
- `Customer` (read-only, no login required)

Only authenticated actors can access operational forms.

### Dummy Accounts

Defined in [actors.js](I:\SeM_6\EDAI\backend\src\data\actors.js):

- `manufacturer1 / atlas-manufacturer`
- `logistics1 / atlas-logistics`
- `logistics2 / atlas-logistics`
- `distributor1 / atlas-distributor`
- `distributor2 / atlas-distributor`

These accounts are for local demo use. They are intended to be replaced later with wallet-based or identity-based auth.

## Smart Contract Model

The contract is in [AtlasSupplyChain.sol](I:\SeM_6\EDAI\blockchain\contracts\AtlasSupplyChain.sol).

### Product Data Stored On Chain

```text
Product
 ├ serialId
 ├ manufacturerName
 ├ batchNumber
 ├ manufactureDate
 ├ exists
 └ events[]
```

### Event Data Stored On Chain

```text
EventRecord
 ├ department
 ├ eventType
 ├ location
 ├ source
 ├ destination
 ├ actorId
 ├ notes
 ├ timestamp
 └ actor
```

This is append-only. Existing lifecycle events are not edited. New events are added to the history.

## Main Contract Functions

- `registerProduct(serialId, manufacturerName, batchNumber, manufactureDate)`
- `addLifecycleEvent(serialId, department, eventType, location, source, destination, actorId, notes)`
- `getProduct(serialId)`
- `getProductHistory(serialId)`
- `setAuthorizedActor(actor, authorized)`

## API Overview

### Auth

- `POST /auth/login`
- `GET /auth/actors`

### Product Operations

- `POST /product/register`
  - manufacturer only
- `POST /product/logistics/stop`
  - logistics only
- `POST /product/logistics/complete`
  - logistics only
  - final destination must match an authorized distributor
- `POST /product/distributor/retail`
  - distributor only
- `GET /product/:serialId`
  - public verification response

### Fraud And Monitoring

- `GET /fraud/alerts`
- `GET /fraud/graph`

### NFC Simulation

- `GET /nfc/tags`
- `GET /nfc/read/:tagId`

## Operational Rules

### Manufacturer Portal

Manufacturer is asked for:
- serial number
- batch number
- date of manufacture

### Logistics Portal

Logistics is asked for:
- serial number
- origin
- destination
- optional notes

Rules:
- first logistics origin should be the manufacturer
- logistics can create multiple stops
- logistics cycle must end at an authorized distributor location
- a first-hop shortcut can prefill manufacturer as source and a distributor as destination
- that shortcut only appears before the first logistics hop is recorded

### Distributor Portal

Distributor is asked for:
- customer name
- serial number
- date of retail

Distributor location is taken from the logged-in distributor account, not typed manually.

## NFC Simulation

The frontend includes a dummy NFC read flow.

What it does now:
- user selects a mock tag
- frontend calls backend NFC endpoint
- backend returns dummy serial and manufacturing metadata
- forms are prefilled from that response

What it is designed for later:
- replace the dummy read action with an actual NFC reader integration
- keep the frontend/backend contract shape mostly unchanged

Dummy NFC data is defined in [nfcTags.js](I:\SeM_6\EDAI\backend\src\data\nfcTags.js).

## Fraud Detection Logic

The current fallback fraud layer checks for:

- invalid first logistics origin
- distributor action before logistics chain exists
- distributor location mismatch with logistics destination
- reverse lifecycle transitions
- suspicious endpoint behavior

It also returns:
- authenticity verdict
- failure point in the lifecycle
- graph nodes and edges
- risk scores per endpoint

Fraud logic entry point:
[fraudService.js](I:\SeM_6\EDAI\backend\src\services\fraudService.js)

## Frontend Experience

### Verify Authenticity

Public page that allows:
- serial lookup
- dummy NFC-assisted lookup
- visual chain of custody
- hover details on lifecycle nodes
- visible failure point when suspicious activity exists

### Authorized Access

Login page for dummy role-based actors.

### Manufacturer / Logistics / Distributor Portal

Single protected portal that changes based on logged-in role.

### Intelligence Dashboard

Shows:
- authentic vs suspicious counts
- fraud trend chart
- failure points
- suspicious products
- risk scores
- network-edge summaries

## Local Development Setup

This project requires a redeploy if the contract changes. The current codebase includes an updated ABI and contract interface, so if you were running an older version you must compile and deploy again.

### 1. Start Hardhat Node

```powershell
cd I:\SeM_6\EDAI\blockchain
npm install
npx hardhat node
```

### 2. Configure Blockchain Environment

Create `blockchain/.env` from [blockchain/.env.example](I:\SeM_6\EDAI\blockchain\.env.example):

```env
PRIVATE_KEY=PASTE_HARDHAT_ACCOUNT_0_PRIVATE_KEY
RPC_URL=http://127.0.0.1:8545
```

### 3. Compile And Deploy Contract

```powershell
cd I:\SeM_6\EDAI\blockchain
npx hardhat compile
npm run deploy
```

Copy the new deployed address.

### 4. Configure Backend Environment

Create `backend/.env` from [backend/.env.example](I:\SeM_6\EDAI\backend\.env.example):

```env
PORT=4000
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=PASTE_HARDHAT_ACCOUNT_0_PRIVATE_KEY
CONTRACT_ADDRESS=PASTE_NEW_DEPLOYED_CONTRACT_ADDRESS
FRAUD_SERVICE_URL=http://127.0.0.1:5000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=atlas-demo-secret
```

### 5. Start AI Service

```powershell
cd I:\SeM_6\EDAI\ai-service
python -m venv .venv
Set-ExecutionPolicy -Scope Process Bypass
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

### 6. Start Backend

```powershell
cd I:\SeM_6\EDAI\backend
npm install
npm run dev
```

### 7. Start Frontend

```powershell
cd I:\SeM_6\EDAI\frontend
npm install
npm run dev
```

## Demo Walkthrough

### Clean Path

1. Login as `manufacturer1`
2. Register `AX1001` with batch and manufacture date
3. Login as `logistics1`
4. Add multi-stop logistics entries such as:
   - Mumbai -> Delhi
   - Delhi -> Goa
5. Close the logistics cycle at authorized distributor `TechSupply Distribution`
6. Login as `distributor1`
7. Record retail completion
8. Open verification page and inspect the visual lifecycle graph

### Suspicious Path

1. Register a product
2. Skip or break the expected logistics/distributor flow
3. Check verification and dashboard
4. Observe failure point and suspicious edge highlights

## Important Notes

- Contract schema has changed from the earlier simpler `role/location` event model.
- If the backend is using an old `CONTRACT_ADDRESS`, calls will fail.
- Restarting Hardhat resets the local chain, which means you must redeploy and update the backend contract address again.

## Key Files

- Smart contract: [AtlasSupplyChain.sol](I:\SeM_6\EDAI\blockchain\contracts\AtlasSupplyChain.sol)
- Role data: [actors.js](I:\SeM_6\EDAI\backend\src\data\actors.js)
- Auth middleware: [auth.js](I:\SeM_6\EDAI\backend\src\middleware\auth.js)
- Product controller: [productController.js](I:\SeM_6\EDAI\backend\src\controllers\productController.js)
- Fraud service: [fraudService.js](I:\SeM_6\EDAI\backend\src\services\fraudService.js)
- Verify page: [VerifyPage.jsx](I:\SeM_6\EDAI\frontend\src\pages\VerifyPage.jsx)
- Portal page: [PortalPage.jsx](I:\SeM_6\EDAI\frontend\src\pages\PortalPage.jsx)
- Dashboard page: [DashboardPage.jsx](I:\SeM_6\EDAI\frontend\src\pages\DashboardPage.jsx)

## Future Improvements

- move role enforcement fully on-chain with distinct writer wallets
- persist fraud intelligence in a database instead of memory
- replace dummy NFC with actual reader integration
- bind each operational actor to a real keypair or wallet signer
- introduce production-grade identity and audit controls
- QR-code based product verification
- stronger geolocation and time-series anomaly modeling
- ERP and warehouse management system integration
