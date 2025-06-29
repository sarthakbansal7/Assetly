# OnlyAssets: Cross-Chain RWA Tokenization Protocol

## 🧭 Index

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Solution](#solution)
4. [Architecture](#architecture)
5. [Chainlink Services Used](#chainlink-services-used)
6. [Smart Contracts](#smart-contracts)
7. [Frontend](#frontend)
8. [Technical Challenges](#technical-challenges)
9. [Tech Stack](#tech-stack)
10. [Setup Instructions](#setup-instructions)
11. [Future Roadmap](#future-roadmap)
12. [License](#license)

---

## 📌 Overview

**OnlyAssets** is a cross-chain Real World Asset (RWA) tokenization infrastructure powered by Chainlink CCIP. It brings global liquidity to traditionally illiquid assets like real estate, invoices, and commodities through ERC-1155 tokenization and seamless interoperability between chains.

---

## ❗ Problem Statement

### Traditional RWA Market Problems:

* **Illiquidity**: Assets like real estate and invoices cannot be easily fractionalized or traded.
* **Geographic & Chain Silos**: Most asset registries are isolated, both legally and technically.
* **Lack of Transparency & Trust**: Centralized systems make verification and trust difficult.

---

## ✅ Solution

OnlyAssets provides a blockchain-native marketplace and tokenization protocol that:

* Fractionalizes assets into **ERC-1155 tokens**
* Enables cross-chain buying via **Chainlink CCIP**
* Randomly highlights assets using **Chainlink VRF**
* Automates operations with **Chainlink Automation**
* Synchronizes pricing via **Chainlink Data Feeds**

---

## 🏗️ Architecture

```
+---------------------+
| Frontend (Next.js)  |
+----------+----------+
           |
           v
+---------------------+          +--------------------+
|  Marketplace.sol    |<-------->| AssetToken.sol     |
+----------+----------+          +--------+-----------+
           |                              |
           v                              v
+----------------------+        +--------------------------+
| Chainlink CCIP Router |<----->| Destination Chain Gateway |
+----------------------+        +--------------------------+
```

---

## 🔗 Chainlink Services Used

1. **Chainlink CCIP** - Enables cross-chain token transfers and message execution.
2. **Chainlink VRF** - Randomly selects a daily highlighted property.
3. **Chainlink Automation** - Triggers yield updates, VRF requests, and maintenance functions.
4. **Chainlink Data Feeds** - Syncs asset valuations across chains using real-time price feeds.

---

## 💡 Smart Contracts

* **AssetToken.sol**: ERC-1155 implementation with mint, burn, and CCIP logic.
* **Marketplace.sol**: Handles listing, cross-chain buying, and proceeds withdrawal.
* **CrossChainBurnAndMintERC1155.sol**: Core CCIP integration logic.
* **RealEstatePriceDetails.sol**: Handles dynamic pricing using Chainlink Feeds.

---

## 🌐 Frontend

* Built with **Next.js** and **Ethers.js**
* Users can:

  * Connect wallet
  * List assets (Only verified personal access)
  * Purchase across chains
  * View highlighted property
  * Claim yields

---

## 🛠️ Technical Challenges

### 1. Cross-Chain Message Execution

* Safely encoding and decoding CCIP payloads between chains
* Solution: Standardized ABI encoding and decoding with gas override logic

### 2. Chain-Specific Router Configurations

* Solution: Deployed per-chain router configs and fallback fee checks

### 3. Multi-Chain Price Sync

* Solution: TWAP fallback and offchain pricing via Chainlink Functions

### 4. Random Selection Consistency

* Solution: Cache VRF results and broadcast across chains using Automation

### 5. Time-Based Automation

* Solution: Built centralized keeper pattern that emits cross-chain triggers

### 6. Yield Tracking

* Solution: Snapshot-based accrual system for claimable yield per user

### 7. Time Management

* With limited time, prioritized core flows and deployed modularly for fast debugging.

---

## 🧱 Tech Stack

* **Solidity** - Smart contracts
* **Next.js** - Frontend
* **Hardhat** - Dev environment
* **Chainlink CCIP, VRF, Automation, Feeds**
* **Ethers.js** - Blockchain interaction
* **Avalanche Fuji, Sepolia, BNB Testnet** - Networks used

---

## ⚙️ Setup Instructions

```bash
# 1. Clone the repo
$ git clone https://github.com/your-repo/OnlyAssets
$ cd OnlyAssets

# 2. Install dependencies
$ npm install

# 3. Deploy contracts
$ npx hardhat deploy --network fuji

# 4. Run frontend
$ cd frontend && npm install && npm run dev
```

---

## 🔮 Future Roadmap

* ✅ Cross-chain purchases via CCIP
* ✅ Highlighted property via VRF
* ✅ Dynamic pricing via Chainlink Feeds

---

## 📄 License

MIT License

---

Let us know if you want to contribute or integrate your RWA system with OnlyAssets.
