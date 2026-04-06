# Atlas Corp Setup Guide

This guide explains how to run the updated Atlas Corp counterfeit-prevention platform locally.

The current version includes:
- role-based access for manufacturer, logistics, and distributor actors
- multi-stop logistics tracking
- dummy NFC tag reading
- visual lifecycle verification
- authenticity and failure-point dashboard metrics

## 1. What You Are Running

There are four runnable parts:

1. `blockchain/`
Private Ethereum-style network and smart contract

2. `ai-service/`
Fraud-analysis service

3. `backend/`
Auth, blockchain orchestration, fraud APIs, and NFC simulation

4. `frontend/`
Public verification page, authorized access portal, and dashboard

## 2. Prerequisites

Install:
- Node.js 18+
- npm
- Python 3.10+

Verify:

```powershell
node -v
npm -v
python --version
```

## 3. Terminals You Need

Open 5 terminals:

1. Hardhat node
2. Contract compile/deploy
3. AI service
4. Backend
5. Frontend

## 4. Start Hardhat Node

### Terminal 1

```powershell
cd I:\SeM_6\EDAI\blockchain
npm install
npx hardhat node
```

Expected output:

```text
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

Also copy the private key for `Account #0`.

## 5. Configure Blockchain Environment

Create `blockchain/.env` from [blockchain/.env.example](I:\SeM_6\EDAI\blockchain\.env.example):

```env
PRIVATE_KEY=PASTE_HARDHAT_ACCOUNT_0_PRIVATE_KEY
RPC_URL=http://127.0.0.1:8545
```

## 6. Compile And Deploy Contract

### Terminal 2

```powershell
cd I:\SeM_6\EDAI\blockchain
npx hardhat compile
npm run deploy
```

Expected output:

```text
AtlasSupplyChain deployed to: 0x...
```

Copy that deployed contract address.

Important:
If you were using an older version of this project, you must redeploy because the contract ABI changed.

## 7. Configure Backend Environment

Create `backend/.env` from [backend/.env.example](I:\SeM_6\EDAI\backend\.env.example):

```env
PORT=4000
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=PASTE_HARDHAT_ACCOUNT_0_PRIVATE_KEY
CONTRACT_ADDRESS=PASTE_DEPLOYED_CONTRACT_ADDRESS
FRAUD_SERVICE_URL=http://127.0.0.1:5000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=atlas-demo-secret
```

## 8. Configure Frontend Environment

Create `frontend/.env` from [frontend/.env.example](I:\SeM_6\EDAI\frontend\.env.example):

```env
VITE_API_URL=http://127.0.0.1:4000
```

## 9. Start AI Service

### Terminal 3

```powershell
cd I:\SeM_6\EDAI\ai-service
python -m venv .venv
Set-ExecutionPolicy -Scope Process Bypass
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

Expected output:

```text
Running on http://127.0.0.1:5000
```

If `.venv` already exists, activate it directly:

```powershell
cd I:\SeM_6\EDAI\ai-service
Set-ExecutionPolicy -Scope Process Bypass
.\.venv\Scripts\Activate.ps1
python app.py
```

## 10. Start Backend

### Terminal 4

```powershell
cd I:\SeM_6\EDAI\backend
npm install
npm run dev
```

Expected output:

```text
Atlas backend listening on port 4000
```

## 11. Start Frontend

### Terminal 5

```powershell
cd I:\SeM_6\EDAI\frontend
npm install
npm run dev
```

Expected output:

```text
Local: http://localhost:5173/
```

## 12. Demo Accounts

These dummy accounts are available for local testing:

- `manufacturer1 / atlas-manufacturer`
- `logistics1 / atlas-logistics`
- `logistics2 / atlas-logistics`
- `distributor1 / atlas-distributor`
- `distributor2 / atlas-distributor`

Role definitions live in [actors.js](I:\SeM_6\EDAI\backend\src\data\actors.js).

## 13. Public And Authorized Screens

### Public

- `Verify Authenticity`
- `Intelligence Dashboard`

### Authorized

Access through `Authorized Access` login:
- manufacturer portal
- logistics portal
- distributor portal

The visible form changes based on role.

## 14. How To Test A Clean Multi-Stop Flow

### Step 1: Manufacturer

Login as:

```text
manufacturer1 / atlas-manufacturer
```

Register a product with:
- serial number: `AX1001`
- batch number: `BATCH-APR-01`
- date of manufacture: `2026-04-01`

### Step 2: Logistics

Login as:

```text
logistics1 / atlas-logistics
```

Load `AX1001` and record multiple stops, for example:
- origin: `Atlas Corp Manufacturing Hub`
- destination: `Delhi`
- notes: `North transit hub`

Add another stop:
- origin: `Delhi`
- destination: `Goa`
- notes: `West consolidation`

Then close the cycle at an authorized distributor location such as:
- destination: `Goa`

### Step 3: Distributor

Login as:

```text
distributor1 / atlas-distributor
```

Record:
- customer name
- serial number `AX1001`
- date of retail

The distributor location is applied automatically from the actor profile.

### Step 4: Verify

Open `Verify Authenticity` and search:

```text
AX1001
```

You should see:
- visual chain of events
- colored department nodes
- hoverable transaction details
- verified authenticity status if the path is valid

## 15. How To Test NFC Simulation

In either the public verification page or an authorized portal:
- choose a dummy NFC tag
- click the read button
- observe that the product metadata is prefilled

This is a simulated signal, not a real reader integration.

## 16. How To Test A Suspicious Flow

Example suspicious case:
- register a product
- record logistics stops
- close logistics at one distributor
- try to retail from a different distributor location

Or:
- record distributor retail before any logistics path exists

Expected result:
- product becomes suspicious
- dashboard shows failure point
- suspicious path edge is highlighted

## 17. Dashboard Expectations

The dashboard now shows:
- authentic count
- suspicious count
- failure-point count
- authenticity distribution chart
- suspicion trend chart
- failure analysis cards
- risk scores
- suspicious lifecycle edges

## 18. Common Problems

### `connect ECONNREFUSED 127.0.0.1:8545`

Cause:
- Hardhat node is not running

Fix:

```powershell
cd I:\SeM_6\EDAI\blockchain
npx hardhat node
```

### `could not decode result data (value="0x")`

Cause:
- backend is using an old contract address
- contract was not redeployed after ABI changes

Fix:
1. restart Hardhat node
2. run `npx hardhat compile`
3. run `npm run deploy`
4. update `backend/.env`
5. restart backend

### `.venv` activation fails in PowerShell

Use:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\.venv\Scripts\Activate.ps1
```

### pip SSL certificate failure

Use trusted hosts:

```powershell
python -m pip install --upgrade pip --trusted-host pypi.org --trusted-host files.pythonhosted.org
pip install -r requirements.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org
```

## 19. Final Quick Start

### Terminal 1

```powershell
cd I:\SeM_6\EDAI\blockchain
npm install
npx hardhat node
```

### Terminal 2

```powershell
cd I:\SeM_6\EDAI\blockchain
npx hardhat compile
npm run deploy
```

### Terminal 3

```powershell
cd I:\SeM_6\EDAI\ai-service
Set-ExecutionPolicy -Scope Process Bypass
.\.venv\Scripts\Activate.ps1
python app.py
```

### Terminal 4

```powershell
cd I:\SeM_6\EDAI\backend
npm install
npm run dev
```

### Terminal 5

```powershell
cd I:\SeM_6\EDAI\frontend
npm install
npm run dev
```

## 20. Files You Will Likely Edit During Setup

- [blockchain/.env.example](I:\SeM_6\EDAI\blockchain\.env.example)
- [backend/.env.example](I:\SeM_6\EDAI\backend\.env.example)
- [frontend/.env.example](I:\SeM_6\EDAI\frontend\.env.example)
- [README.md](I:\SeM_6\EDAI\README.md)
- [SETUP_GUIDE.md](I:\SeM_6\EDAI\SETUP_GUIDE.md)
