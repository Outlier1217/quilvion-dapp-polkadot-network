# 🛒 Quilvion-dAPP
### Decentralized Web3 E-Commerce Platform

A next-generation **Web3 commerce platform** where **Wallet = Identity**.

No accounts.  
No passwords.  
No centralized authentication.

Just connect your wallet and start shopping.

---

# 🚀 Core Idea

Traditional e-commerce platforms suffer from several major issues:

- Users must create **separate accounts** on every website
- Repeated sharing of **sensitive personal information**
- Increased risk of **spam, data leaks, and identity theft**
- **Cumbersome login/logout systems**
- Fragmented shopping experiences

### 💡 Solution

**Quilvion-dAPP** eliminates these problems by introducing:

> **Wallet = Identity**

Users simply connect their wallet and instantly access the marketplace.

No signups.  
No logins.  
No passwords.

---

# ⚙️ How It Works

### 1️⃣ Wallet Login

Connect Wallet → Instant Authentication

- No email
- No password
- No account creation

Your **Web3 wallet becomes your identity**.

---

### 2️⃣ Unified Shopping Experience

Users can purchase:

- Digital Products
- Physical Products
- Services

All transactions occur within a **single decentralized ecosystem**.

---

### 3️⃣ Privacy First

Sensitive personal data such as:

- Address
- Phone number
- Name

is:

- Shared **only when necessary**
- Used **only for delivery**
- Can be **deleted after order completion**

---

### 4️⃣ Merchant Registration

Merchants can onboard easily:

1. Register wallet
2. Submit business details
3. Admin approval
4. Start selling instantly

---

### 5️⃣ Built-in Security

Security layers include:

- AI fraud detection
- Escrow-based payments
- Daily spending limits
- Admin approvals for large transactions
- Role-based access control

---

# 🛠 Technology Stack

## Blockchain

| Component | Technology |
|--------|-------------|
| Network | **Polkadot Hub EVM Testnet** |
| Smart Contracts | Solidity ^0.8.20 |
| Framework | Hardhat |
| Token | Mock USDC |
| Payment Standard | X402 |

---

## Backend

| Component | Technology |
|--------|-------------|
| Framework | FastAPI |
| Language | Python |
| Database | PostgreSQL |
| Blockchain Interaction | Web3.py |
| Event Listener | Python Worker |

---

## Frontend

| Component | Technology |
|--------|-------------|
| Framework | React + Vite |
| State Management | Redux Toolkit |
| Web3 Integration | ethers.js |
| Styling | Custom CSS |

---

## AI / Machine Learning

| Component | Technology |
|--------|-------------|
| Model | XGBoost Classifier |
| Features | 28 PCA features + Amount + Time |
| Output | Fraud risk score (0-100) |
| Integration | Real-time transaction risk analysis |

---

# 📁 Project Structure


Quilvion-dAPP/

contracts/
├── core/
│ └── CommerceCore.sol
│
├── config/
│ └── ConfigManager.sol
│
├── security/
│ └── Roles.sol
│
├── libraries/
│ └── PaymentLib.sol
│
└── mocks/
└── ERC20Mock.sol

backend/
├── main.py
├── listener.py
├── fraud_model.pkl
├── requirements.txt

frontend/
├── src/
│ ├── components/
│ ├── pages/
│ ├── services/
│ ├── store/
│ ├── hooks/
│ ├── abi/

scripts/
test/


---

# 💡 Smart Contract Architecture

### 1️⃣ CommerceCore.sol

Main marketplace contract responsible for:

- Order creation
- Payment escrow
- Order settlement
- Platform fee deduction
- Role-based permissions

---

### 2️⃣ ConfigManager.sol

Controls platform configuration:

- Spending limits
- Admin approval thresholds
- Refund window
- Platform fees

---

### 3️⃣ Roles.sol

Access control system.

| Role | Permission |
|-----|-------------|
| DEFAULT_ADMIN_ROLE | Full control |
| ADMIN_ROLE | Merchant approvals |
| BOT_ROLE | AI fraud scoring |

---

### 4️⃣ EscrowLogic.sol

Handles:

- Escrow payments
- Spending tracking
- Order settlement logic

---

# 🔄 Order Flow

User connects wallet

↓

User selects product

↓

Smart contract validates:

- Daily spending limit
- Product type
- Amount threshold

↓

USDC transferred to escrow contract

---

### Order Outcomes

| Scenario | Result |
|--------|--------|
| Digital + Small Amount | Auto Complete |
| Digital + Large Amount | Escrow + Admin Review |
| Physical Product | Escrow Hold |

---

# 🤖 AI Fraud Detection

### Workflow

1️⃣ Smart contract emits **OrderCreated event**

2️⃣ Backend event listener detects event

3️⃣ Transaction data sent to AI service

4️⃣ AI calculates fraud probability

5️⃣ Risk score written back **on-chain**

---

### Architecture


Smart Contract
│
▼
Event Listener
(listener.py)
│
▼
AI Fraud Service
│
▼
Risk Score
│
▼
setRiskScore()
│
▼
Smart Contract Decision


---

# 🔐 Security Features

- ReentrancyGuard
- Pausable contracts
- SafeERC20
- Role-based permissions
- Escrow protection
- Daily spending limits
- AI fraud monitoring

---

# 🌐 Polkadot Hub Deployment

### Network

**Polkadot Hub EVM Testnet**

RPC


https://services.polkadothub-rpc.com/testnet


Chain ID


420420417


Currency


PAS


Block Explorer


https://polkadot.testnet.routescan.io


---

# 📦 Deployed Contracts

### CommerceCore

Explorer

https://polkadot.testnet.routescan.io/address/0x78c37Dcb5C3C072DAfb9D4e28638BBcdf297FeeB

Address


0x78c37Dcb5C3C072DAfb9D4e28638BBcdf297FeeB


---

### Mock USDC

Explorer

https://polkadot.testnet.routescan.io/address/0x84b6a3e3a7ffE62D339524d7C678c252aBD2d4b0

Address


0x84b6a3e3a7ffE62D339524d7C678c252aBD2d4b0


---

# 🧪 Deployment

### Install Dependencies


npm install


### Compile


npx hardhat compile


### Deploy


npx hardhat run scripts/deploy.js --network polkadot_hub_testnet


---

# 🎯 Key Features

### Platform

- Wallet-based identity
- Merchant onboarding
- Escrow payments
- Digital product delivery
- Physical product protection
- Platform fee management

---

### Security

- AI fraud detection
- Spending limits
- Role-based permissions
- Escrow protection

---

### User Experience

- Product marketplace
- Order history
- Messaging system
- Profile management

---

# 💬 Messaging System

Communication between:

- Buyer ↔ Seller
- User ↔ Support

Features:

- Conversation history
- Read/unread status
- Notifications

---

# 🚧 Future Roadmap

- Multi-token payments
- Decentralized delivery tracking
- Seller reputation system
- Dispute resolution
- Mobile app (React Native)
- DAO governance
- NFT product support

---

# 🏁 Conclusion

**Quilvion-dAPP introduces a new paradigm for decentralized commerce.**

By making **wallet the primary identity**, the platform:

- Removes account fatigue
- Protects user privacy
- Enables seamless Web3 commerce

Combined with **AI-powered fraud detection and escrow protection**, the platform delivers a secure and decentralized marketplace.

---

# 👨‍💻 Developer

**Mustak Aalam**

Email  
mustakaalam10@gmail.com

---

# 🎥 Demo

https://youtu.be/CIJyl1d8Rx0

---

Built with ❤️