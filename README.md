# AgroShield

**Decentralized Parametric Crop Insurance on 0G Network**

Affordable, automatic, and transparent crop insurance for smallholder farmers — starting with maize farmers in Makueni County, Kenya.

---

### Network Details

- **Network**: 0G Galileo Testnet
- **Chain ID**: 16602
- **RPC**: https://evmrpc-testnet.0g.ai
- **Explorer**: https://chainscan-galileo.0g.ai
- **Native Token**: 0G (18 decimals)
- **Faucet**: https://faucet.0g.ai

### Deployment

- **Contract address**: `0xC3EF46B3Fcce1a266a65DdEF2865BE59758a9e75`
- **Deployment transaction**: [0x82161f8efb2b325d6c630e98265ce338ce4d7a9e0b39314b8c6811e9b9db68ad](https://chainscan-galileo.0g.ai/tx/0x82161f8efb2b325d6c630e98265ce338ce4d7a9e0b39314b8c6811e9b9db68ad)

---

### The Problem
Smallholder farmers in Africa face severe climate risks, especially drought, yet fewer than 3% have any form of crop insurance. Traditional insurance has failed them for several reasons:

- **Manual claims process is extremely slow.** After a drought, an assessor must physically visit the farm to verify the damage. This can take weeks or even months.
- **High operational costs make small premiums unviable.** The cost of sending inspectors, processing paperwork, and handling disputes is too high for the low premiums that small farmers can afford.
- **Delayed payouts often arrive too late.** By the time the farmer receives money, the next planting season has already started or passed.
- **Lack of insurance also blocks access to credit.** Banks and microfinance institutions see uninsured farmers as high risk, so they either refuse loans or charge very high interest rates.

This creates a vicious cycle:
No insurance → higher climate risk → no access to credit → low investment in better seeds/inputs → continued poverty and vulnerability. 

Makueni County in Kenya (our starting point) is a clear example of this reality — many maize farmers lose entire seasons to drought with zero financial protection.

---

### Our Solution – AgroShield
AgroShield is a decentralized parametric crop insurance platform built on 0G Network (EVM-compatible smart contracts). Instead of relying on human assessors, AgroShield uses parametric triggers:

- **Automated Triggers:** A weather oracle continuously feeds accurate rainfall data for the farmer's specific region onto the blockchain.
- **Instant Payouts:** If rainfall falls below a pre-agreed threshold (for example, less than 25mm over 30 days) during the coverage period, the smart contract automatically triggers a payout.
- **No Friction:** The farmer receives the money directly and quickly — no claim form, no inspector, no dispute, and no long waiting period.

#### Key advantages:
- **Fast payouts** — money arrives in time for the next planting season.
- **Very low costs** — 0G's sub-cent transaction fees make small premiums and small payouts economically viable.
- **Transparency** — all rules and weather data are on-chain and auditable.
- **Accessibility** — designed for farmers who use mobile money and basic smartphones.

Beyond just insurance, AgroShield is building a full financial safety net for farmers:
- Early weather alerts via SMS so farmers can act before the drought hits.
- Simple crop recommendations based on weather trends.
- An on-chain coverage and claims history (CreditAttestation) that can later help farmers access better credit from lenders.

**In short:**
AgroShield removes the biggest barriers of traditional insurance and turns climate protection into fast, transparent, and affordable on-chain infrastructure for smallholder farmers.

---

### Architecture
The AgroShield system follows a modular, trustless architecture:

```text
       [ Weather Oracle ]
               |
               v
    [ Smart Contract ] <--- [ 0G Network ]
               |
               v
    [ Frontend Dashboard ] <--- [ User Wallet (MetaMask/Rabby) ]
```

1. **Weather Oracle**: Ingests satellite weather data.
2. **Smart Contract**: Stores policy state and automates payouts.
3. **Frontend Dashboard**: User-friendly portal for farmers to buy coverage and track insurance status.
4. **0G Network**: Handles low-cost, secure settlement.

---

### Key Features
- Automatic payouts based on verified weather triggers.
- Multi-wallet support (MetaMask, Rabby, WalletConnect via RainbowKit).
- Dashboard for coverage status, payout history, and weather alerts.
- **(Planned)** SMS notifications integration.
- **(Planned)** Automated weather data ingestion via decentralized oracle.
- **(Planned)** Credit score building through on-chain history.

---

### Project Structure
```text
agroshield/
├── contracts/
│   └── solidity/            # Solidity Smart Contract
│       └── PolicyContract.sol
│   └── scripts/             # Deployment scripts
│       └── deploy.js
│   └── hardhat.config.js    # Hardhat configuration
├── frontend/                 # Next.js Application
│   ├── app/
│   │   ├── dashboard/        # Farmer dashboard
│   │   │   ├── coverage/
│   │   │   ├── payouts/
│   │   │   ├── profile/
│   │   │   └── weather/
│   │   └── layout.tsx
│   ├── components/           # UI Components
│   │   ├── BuyCoverageButton.tsx
│   │   ├── wallet-connect-button.tsx
│   │   └── wagmi-provider.tsx
│   ├── lib/
│   │   ├── agroshield.ts    # Contract interaction logic
│   │   └── wagmi.ts         # Wagmi configuration
│   └── package.json
└── README.md
```

---

### Setup Instructions

#### 1. Clone the repo
```bash
git clone https://github.com/welson-ai/Agroshieldv3.git
cd Agroshieldv3
```

#### 2. Install frontend dependencies
```bash
cd frontend
npm install
```

#### 3. Set up environment variables
Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

#### 4. Run the frontend
```bash
npm run dev
```

#### 5. Deploy Smart Contract
```bash
cd ../contracts
npm install
echo "PRIVATE_KEY=your_private_key_here" > .env
npm run deploy
```

---

### Roadmap
- [x] Core contract + Testnet deployment (Stellar → 0G migration)
- [x] Multi-wallet + Basic UI (Stellar → EVM migration)
- [x] Full Testnet product (frontend + contract connected)
- [x] Security audit + Mainnet preparation
- [ ] **Mainnet Launch** + Pilot in Makueni County
- [ ] Scale across Kenya and East Africa

---

### Contract Functions

The smart contract supports the following functions:

- `buy(uint64 threshold, uint256 coverage)`: Purchase insurance policy with premium payment
- `report(uint256 id, uint256 value, bytes32 reportHash)`: Oracle reports rainfall data
- `settle(uint256 id)`: Trigger automatic payout if conditions are met
- `getPolicy(uint256 id)`: Retrieve policy details

---

### Testing the Application

1. **Get Testnet Funds**: Visit https://faucet.0g.ai to get test 0G tokens
2. **Connect Wallet**: Use MetaMask or Rabby wallet to connect to 0G Galileo Testnet (Chain ID: 16602)
3. **Buy Policy**: Purchase insurance coverage by paying premium
4. **Report Rainfall**: Simulate oracle reporting rainfall data
5. **Settle Payout**: Trigger automatic payout if rainfall is below threshold

---

### Explorer Links

- **Transaction Explorer**: https://chainscan-galileo.0g.ai/tx/{transaction_hash}
- **Contract Explorer**: https://chainscan-galileo.0g.ai/address/{contract_address}
