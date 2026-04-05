# Atlas Corp Counterfeit Prevention Network

Atlas Corp needs a trusted way to prove that spare parts moving through its supply chain are genuine. This project delivers a permissioned blockchain supply-chain tracking platform that records every product movement on-chain, validates that movement against expected business rules, detects suspicious behavior, and exposes verification and fraud-monitoring interfaces for both customers and internal teams.

The solution is organized into five core modules:

1. `frontend/` - React + Vite + Tailwind interface with product verification, transfer recording, and fraud intelligence pages
2. `backend/` - Node.js + Express orchestration API that talks to the blockchain and fraud services
3. `blockchain/` - Hardhat + Solidity permissioned supply-chain contract
4. `ai-service/` - Flask service that performs rule-based anomaly checks, graph validation, and lightweight ML scoring
5. `README.md` - full project guide, architecture, setup, and demo flow

## Problem Statement

Atlas Corp is facing counterfeit spare parts entering its supply chain. Customers may receive fake components from unauthorized suppliers, skipped intermediaries, or manipulated movement records.

This system solves that by:

- allowing only approved supply-chain actors to write lifecycle events
- storing an immutable product history on a private Ethereum network
- checking product movement against valid business transitions
- flagging unusual movement patterns like duplicate serials or impossible route jumps
- giving customers a verification portal to inspect authenticity
- giving internal teams a fraud dashboard to monitor risk trends

## High-Level Architecture

```text
Frontend (React)
   |
   v
Backend API (Express)
   |---------------------> Fraud Service (Flask + ML + graph rules)
   |
   v
Private Ethereum Network (Hardhat / EVM)
   |
   v
Smart Contract Ledger (immutable product lifecycle)
```

## Core Business Flow

```text
Manufacturer registers product
        |
        v
Logistics records shipment
        |
        v
Distributor receives product
        |
        v
Retailer receives product
        |
        v
Customer verifies product
```

Each transfer becomes:

1. a blockchain transaction
2. a backend validation event
3. an anomaly detection request
4. a graph-analysis update
5. a dashboard data refresh

## Permissioned Roles

- `Manufacturer`
- `Logistics`
- `Distributor`
- `Retailer`
- `Customer` (read only)

Only authorized admin-approved actor wallets can register products or record transfers.

## Project Structure

```text
EDAI/
├─ README.md
├─ blockchain/
├─ backend/
├─ ai-service/
└─ frontend/
```

## Module Responsibilities

### Blockchain Layer

Purpose:

- register new products
- record product transfers
- maintain immutable event history
- prevent tampering with records

Smart contract functions:

- `registerProduct(serialId, manufacturer)`
- `transferProduct(serialId, role, location)`
- `getProductHistory(serialId)`

Blockchain data model:

```text
Product
 ├ serialId
 ├ manufacturer
 ├ exists
 └ events[]

Event
 ├ role
 ├ location
 ├ timestamp
 └ actor
```

### Backend API

Purpose:

- validate API payloads
- submit blockchain transactions
- retrieve on-chain history
- trigger fraud analysis
- aggregate dashboard outputs

Endpoints:

- `POST /product/register`
- `POST /product/transfer`
- `GET /product/:serialId`
- `GET /fraud/alerts`
- `GET /fraud/graph`
- `GET /health`

### Fraud Detection Layer

Signals evaluated:

- duplicate serial usage
- invalid graph transitions
- unauthorized actors
- impossible location jumps
- abnormal transfer timing
- high scan / transfer frequency

Detection style:

- rule-based checks for explainability
- graph validation using supply-chain transitions
- `IsolationForest` when available, with a deterministic fallback if Python ML libraries are missing

### Fraud Intelligence Dashboard

Dashboard widgets:

- suspicious product table
- fraud alerts trend chart
- supply-chain graph summary
- participant risk score table

### Customer Verification

Verification result includes:

- manufacturer name
- lifecycle event trail
- observed supply-chain path
- anomaly warnings
- authenticity status

## Smart Contract Design

### Main Functions

#### `registerProduct(string serialId, string manufacturer)`

Called by an authorized writer. It creates the product record and stores the first lifecycle event as `Manufacturer`.

#### `transferProduct(string serialId, string role, string location)`

Called by an authorized writer when custody changes or a movement milestone is reached. It appends a new event to the product history.

#### `getProductHistory(string serialId)`

Read-only function used by the backend and frontend verification interface.

## Fraud Detection Logic

Valid path:

```text
Manufacturer -> Logistics -> Distributor -> Retailer
```

Examples flagged:

- `Manufacturer -> Retailer`
- `Distributor -> Manufacturer`
- `Unknown -> Distributor`

Rule-based checks:

- invalid transitions
- same product scanned too many times in a short window
- unrealistic movement between named cities

## Frontend Pages

### Product Verification Page

For customers and auditors:

- enter serial number
- fetch lifecycle history
- show authenticity verdict
- show fraud warnings

### Supply Chain Event Page

For authorized participants:

- register product form
- transfer event form
- transaction feedback

### Fraud Intelligence Dashboard

For Atlas operations and fraud teams:

- suspicious products table
- fraud trend chart
- graph summary
- entity risk table

## Local Setup

Open four terminals.

### Terminal 1: Blockchain network

```bash
cd blockchain
npm install
npx hardhat node
```

In another blockchain terminal:

```bash
cd blockchain
copy .env.example .env
npm run deploy
```

Update the deployed contract address in `backend/.env`.

### Terminal 2: AI fraud service

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Terminal 3: Backend API

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

### Terminal 4: Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

## Environment Variables

### `blockchain/.env`

```env
PRIVATE_KEY=your_hardhat_account_private_key
RPC_URL=http://127.0.0.1:8545
```

### `backend/.env`

```env
PORT=4000
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_hardhat_account_private_key
CONTRACT_ADDRESS=deployed_contract_address
FRAUD_SERVICE_URL=http://127.0.0.1:5000
CORS_ORIGIN=http://localhost:5173
```

### `frontend/.env`

```env
VITE_API_URL=http://127.0.0.1:4000
```

## Demo Walkthrough

1. Register a product `AX1001` from the Event page.
2. Transfer it through `Logistics`, `Distributor`, and `Retailer`.
3. Open the Verification page and search `AX1001`.
4. Observe a healthy product lifecycle with no warnings.
5. Submit a suspicious path like `Manufacturer -> Retailer` for another serial.
6. Open the Dashboard page to see the alert, graph issue, and elevated risk score.

## Security and Integrity Features

- Immutable event log through blockchain storage
- Restricted writes through admin-managed actor authorization
- Backend input validation to prevent malformed data
- AI-driven alerting for suspicious behavior
- Transparent customer verification experience

## Future Improvements

- QR-code based product verification
- persistent database for alerts and historical analytics
- stronger geolocation and time-series anomaly modeling
- role-based login and wallet-based signing
- ERP and warehouse management system integration


