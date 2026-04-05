# Atlas Corp Setup Guide

This guide explains exactly how to run the Atlas Corp counterfeit-prevention project on your machine from scratch.

It covers:

- what to install first
- how many terminals to open
- how to start the blockchain
- how to get the private key
- how to deploy the contract
- how to fill each `.env` file
- how to start the AI service, backend, and frontend
- what output you should expect
- how to test the project end to end

## 1. What This Project Contains

This project has four runnable parts:

1. `blockchain/` for the private Ethereum network and smart contract
2. `ai-service/` for fraud detection and graph analysis
3. `backend/` for the API that connects everything
4. `frontend/` for the user interface

You will run them in separate terminals.

## 2. Prerequisites

Install these first:

- Node.js 18 or newer
- npm
- Python 3.10 or newer

To verify:

```powershell
node -v
npm -v
python --version
```

You should see versions printed for all three.

## 3. Project Terminals

Open 5 terminals in total:

1. blockchain node terminal
2. blockchain deploy terminal
3. AI service terminal
4. backend terminal
5. frontend terminal

If you want to minimize confusion, keep them labeled like this:

- Terminal 1: Hardhat node
- Terminal 2: Contract deployment
- Terminal 3: AI service
- Terminal 4: Backend
- Terminal 5: Frontend

## 4. Start The Blockchain Network

### Terminal 1

Run:

```powershell
cd I:\SeM_6\EDAI\blockchain
npm install
npx hardhat node
```

### What you should see

Hardhat will start a local blockchain at:

```text
http://127.0.0.1:8545/
```

It will also print a list of test accounts and private keys.

It usually looks similar to this:

```text
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========

Account #0: 0x...
Private Key: 0x...
```

Do not close this terminal. Leave it running.

## 5. Get The Private Key

From the Hardhat node output in Terminal 1:

1. find `Account #0`
2. copy the `Private Key` shown below it

That private key will be used in:

- `blockchain/.env`
- `backend/.env`

This is only for local testing. Do not use it for real funds or production.

## 6. Create Blockchain Environment File

### In `blockchain/`

Copy the example file:

```powershell
cd I:\SeM_6\EDAI\blockchain
Copy-Item .env.example .env
```

Open `.env` and set:

```env
PRIVATE_KEY=PASTE_THE_HARDHAT_PRIVATE_KEY_HERE
RPC_URL=http://127.0.0.1:8545
```

## 7. Deploy The Smart Contract

### Terminal 2

Run:

```powershell
cd I:\SeM_6\EDAI\blockchain
npm run deploy
```

### What you should see

You should get output similar to:

```text
AtlasSupplyChain deployed to: 0x1234...
```

Copy that deployed contract address. You will need it for the backend.

## 8. Create Backend Environment File

### In `backend/`

Copy the example:

```powershell
cd I:\SeM_6\EDAI\backend
Copy-Item .env.example .env
```

Open `backend/.env` and set:

```env
PORT=4000
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=PASTE_THE_HARDHAT_PRIVATE_KEY_HERE
CONTRACT_ADDRESS=PASTE_DEPLOYED_CONTRACT_ADDRESS_HERE
FRAUD_SERVICE_URL=http://127.0.0.1:5000
CORS_ORIGIN=http://localhost:5173
```

## 9. Create Frontend Environment File

### In `frontend/`

Copy the example:

```powershell
cd I:\SeM_6\EDAI\frontend
Copy-Item .env.example .env
```

Open `frontend/.env` and set:

```env
VITE_API_URL=http://127.0.0.1:4000
```

## 10. Start The AI Service

### Terminal 3

Run these commands:

```powershell
cd I:\SeM_6\EDAI\ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

### Important note

Do not interrupt `python -m venv .venv` while it is running. If you stop it halfway, the virtual environment may be corrupted.

### If `.venv` was partially created

Run:
cd I:\SeM_6\EDAI\ai-service
.\.venv\Scripts\Activate.ps1


```powershell
cd I:\SeM_6\EDAI\ai-service
Remove-Item -Recurse -Force .venv
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

### If PowerShell blocks activation

Run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\.venv\Scripts\Activate.ps1
```

### What you should see

When Flask starts correctly, you should see something like:

```text
 * Running on http://127.0.0.1:5000
```

Leave this terminal running.

## 11. Start The Backend API

### Terminal 4

Run:

```powershell
cd I:\SeM_6\EDAI\backend
npm install
npm run dev
```

### What you should see

You should see:

```text
Atlas backend listening on port 4000
```

Leave this terminal running.

## 12. Start The Frontend

### Terminal 5

Run:

```powershell
cd I:\SeM_6\EDAI\frontend
npm install
npm run dev
```

### What you should see

Vite should show a local URL, usually:

```text
Local:   http://localhost:5173/
```

Open that URL in your browser.

## 13. First Run Checklist

Before testing the app, confirm:

- Terminal 1 Hardhat node is running on `127.0.0.1:8545`
- Terminal 2 contract deployed successfully
- `backend/.env` has the correct contract address
- Terminal 3 AI service is running on `127.0.0.1:5000`
- Terminal 4 backend is running on port `4000`
- Terminal 5 frontend is running on port `5173`

If one of these is missing, the app may fail.

## 14. How To Test A Normal Product Flow

Open the frontend in the browser and go to the `Supply Chain Event` page.

### Step 1: Register a product

Use:

- Serial ID: `AX1001`
- Manufacturer: `Atlas Corp`

Submit the form.

### What should happen

You should see a success message with a transaction hash.

### Step 2: Record logistics

Use:

- Serial ID: `AX1001`
- Role: `Logistics`
- Location: `Mumbai`
- Actor ID: `DHL`

Submit.

### Step 3: Record distributor

Use:

- Serial ID: `AX1001`
- Role: `Distributor`
- Location: `Delhi`
- Actor ID: `TechSupply`

Submit.

### Step 4: Record retailer

Use:

- Serial ID: `AX1001`
- Role: `Retailer`
- Location: `Bengaluru`
- Actor ID: `Atlas Store`

Submit.

## 15. How To Verify The Product

Go to the `Verify Product` page.

Search for:

```text
AX1001
```

### What you should see

- authenticity status should appear
- manufacturer should show `Atlas Corp`
- path should look like:

```text
Manufacturer -> Logistics -> Distributor -> Retailer
```

- fraud warnings should ideally be empty for this clean flow

## 16. How To Test A Suspicious Flow

Go back to the `Supply Chain Event` page.

Register a new product:

- Serial ID: `AX9999`
- Manufacturer: `Atlas Corp`

Then create an invalid path:

- Serial ID: `AX9999`
- Role: `Retailer`
- Location: `London`
- Actor ID: `Unknown Retail Node`

This skips `Logistics` and `Distributor`.

### What should happen

The fraud layer should flag it as suspicious because:

- the transition is invalid
- the route may be unrealistic
- the dashboard should show a fraud alert

## 17. How To View Fraud Intelligence

Open the `Fraud Intelligence` page.

You should see:

- suspicious product count
- graph node count
- risk entity count
- fraud trend chart
- suspicious product table
- graph summary cards

For the suspicious serial, the dashboard should show at least one flagged anomaly.

## 18. Common Problems And Fixes

### Problem: `python -m venv .venv` hangs or ends with `KeyboardInterrupt`

Cause:

- the command was interrupted before it finished

Fix:

```powershell
cd I:\SeM_6\EDAI\ai-service
Remove-Item -Recurse -Force .venv
python -m venv .venv
```

Then wait until it fully completes.

### Problem: PowerShell says scripts are disabled

Fix:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\.venv\Scripts\Activate.ps1
```

### Problem: backend says blockchain is not configured

Cause:

- `PRIVATE_KEY` or `CONTRACT_ADDRESS` is missing in `backend/.env`

Fix:

- check `backend/.env`
- ensure the contract was deployed
- ensure the Hardhat node is still running

### Problem: frontend cannot fetch data

Cause:

- backend is not running
- `frontend/.env` has wrong API URL

Fix:

- confirm backend is on `http://127.0.0.1:4000`
- confirm `VITE_API_URL=http://127.0.0.1:4000`

### Problem: contract deployment fails

Cause:

- Hardhat node is not running
- wrong private key in `blockchain/.env`

Fix:

- restart Terminal 1 with `npx hardhat node`
- recopy the private key from the Hardhat output

### Problem: AI service install fails on `scikit-learn`

Cause:

- missing Python tooling or incompatible Python version

Fix:

- use Python 3.10 or 3.11 if possible
- upgrade pip first
- retry `pip install -r requirements.txt`

The backend has a fallback fraud analysis path, so even if the AI service is temporarily unavailable, the system can still return basic suspicious-path detection.

## 19. What Each Page Is For

### Verify Product

Used by customers or auditors to:

- enter serial ID
- inspect history
- see warnings
- confirm authenticity

### Supply Chain Event

Used by authorized participants to:

- register products
- record transfers

### Fraud Intelligence

Used by Atlas Corp internal teams to:

- review suspicious products
- inspect fraud trends
- view risk scores

## 20. Recommended Demo Sequence

For a classroom or viva demo, use this order:

1. show Hardhat node running
2. show smart contract deployed
3. register a clean product
4. record valid transfers
5. verify the product
6. register a suspicious product
7. record an invalid transfer
8. open the fraud dashboard
9. explain how blockchain plus AI makes counterfeit insertion visible

## 21. Files You Will Touch During Setup

- [blockchain/.env.example](I:\SeM_6\EDAI\blockchain\.env.example)
- [backend/.env.example](I:\SeM_6\EDAI\backend\.env.example)
- [frontend/.env.example](I:\SeM_6\EDAI\frontend\.env.example)
- [README.md](I:\SeM_6\EDAI\README.md)

## 22. Final Quick Start

If you already understand the process, this is the short version:

### Terminal 1

```powershell
cd I:\SeM_6\EDAI\blockchain
npm install
npx hardhat node
```

Wait until you see:

```text
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

Copy the `Private Key` for `Account #0`.

### Terminal 2

First create `blockchain/.env` from `blockchain/.env.example` and paste:

```env
PRIVATE_KEY=PASTE_HARDHAT_ACCOUNT_0_PRIVATE_KEY
RPC_URL=http://127.0.0.1:8545
```

Then run:

```powershell
cd I:\SeM_6\EDAI\blockchain
npm run deploy
```

Wait until you see:

```text
AtlasSupplyChain deployed to: 0x...
```

Copy that deployed contract address.

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

Wait until you see:

```text
Running on http://127.0.0.1:5000
```

### Terminal 4

First create `backend/.env` from `backend/.env.example` and paste:

```env
PORT=4000
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=PASTE_HARDHAT_ACCOUNT_0_PRIVATE_KEY
CONTRACT_ADDRESS=PASTE_DEPLOYED_CONTRACT_ADDRESS
FRAUD_SERVICE_URL=http://127.0.0.1:5000
CORS_ORIGIN=http://localhost:5173
```

Then run:

```powershell
cd I:\SeM_6\EDAI\backend
npm install
npm run dev
```

Wait until you see:

```text
Atlas backend listening on port 4000
```

### Terminal 5

First create `frontend/.env` from `frontend/.env.example` and paste:

```env
VITE_API_URL=http://127.0.0.1:4000
```

Then run:

```powershell
cd I:\SeM_6\EDAI\frontend
npm install
npm run dev
```

Wait until you see:

```text
Local: http://localhost:5173/
```

Then test the app:

1. On `Supply Chain Event`, register:

```text
Serial ID: AX1001
Manufacturer: Atlas Corp
```

2. Add transfers:

```text
AX1001 | Logistics | Mumbai | DHL
AX1001 | Distributor | Delhi | TechSupply
AX1001 | Retailer | Bengaluru | Atlas Store
```

3. On `Verify Product`, search:

```text
AX1001
```

4. For suspicious activity, register:

```text
AX9999
```

Then transfer:

```text
AX9999 | Retailer | London | Unknown Retail Node
```

5. Open `Fraud Intelligence` to see the fraud alert.
