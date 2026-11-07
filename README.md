# AgroShield

**Decentralized Parametric Crop Insurance on Base**

Affordable, automatic, and transparent crop insurance for smallholder farmers — starting with maize farmers in Makueni County, Kenya.

---

### Network Details

- **Network**: Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Native Token**: ETH (18 decimals)
- **Faucet**: https://faucet.quicknode.com/base/sepolia

### Deployment

- **Contract address**: Deployed via `npm run deploy` in contracts folder
- **Contract**: `PolicyContract.sol` (Solidity)

---

### Architecture

```
+-----------------------------------------------------------------------------+
|                           AGROSHIELD (Base Sepolia)                          |
+-----------------------------------------------------------------------------+

   Farmer (phone/web)                      Weather Oracle
        |                                       |
        | 1. Sign up (email or phone+PIN)        |  fetchRainfallData (OpenWeatherMap)
        | 2. Buy cover (wallet or Pretium STK)   |  fetchHistoricalRainfall (CHIRPS)
        v                                       v
   +-------------------+              +-----------------------+
   |  Frontend (Next)  |              |  lib/weather-oracle   |
   |  /dashboard       |              |  /api/oracle          |
   |  /dashboard/*     |              +-----------+-----------+
   |  /api/ussd        |                          |
   |  /api/sms         |                          v
   |  /api/chat        |              +-----------------------+
   +---------+---------+              |  county_rules (DB)    |
             |                        |  trigger / exit /     |
             |                        |  season / premium     |
             v                        +-----------+-----------+
   +-------------------+                          |
   |   Neon Postgres   |<-------------------------+
   |  farmer_profiles  |
   |  policies         |
   |  counties         |
   |  county_rules     |
   +---------+---------+
             |
             | server-side signer (deployer key)
             v
   +-------------------+        +-------------------------+
   |  Base Sepolia     |        |  Africa's Talking /     |
   |  PolicyContract   |<------>|  ThriveVas SMS + USSD    |
   |  buy/report/settle|        +-------------------------+
   +-------------------+
             |
             v
   +-------------------+
   |  Payout (ETH)     |  -->  farmer wallet / Pretium off-ramp -> M-Pesa
   +-------------------+

Flows:
  Signup:  web auth (better-auth) OR USSD phone+PIN -> farmer_profiles
  Buy:     wallet buy() OR Pretium STK -> recordPolicy() (locked county_rules)
  Oracle:  /api/oracle -> weather + checkRainfallTrigger -> report() (deployer)
  Payout:  auto-payout (/api/payout/trigger) -> settle() -> SMS notification
  USSD:    *384*87051# -> profile / policies / payouts / weather / ask assistant
  Chat:    /api/chat -> OpenAI (scoped to AgroShield topics)
```

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
AgroShield is a decentralized parametric crop insurance platform built on Base (EVM-compatible). Instead of relying on human assessors, AgroShield uses parametric triggers:

- **Automated Triggers:** A weather oracle continuously feeds accurate rainfall data for the farmer's specific region onto the blockchain.
- **Instant Payouts:** If rainfall falls below a pre-agreed threshold (for example, less than 2mm (configurable per policy)) during the coverage period, the smart contract automatically triggers a payout.
- **No Friction:** The farmer receives the money directly and quickly — no claim form, no inspector, no dispute, and no long waiting period.

#### Key advantages:
- **Fast payouts** — money arrives in time for the next planting season.
- **Very low costs** — Base's low transaction fees make small premiums and small payouts economically viable.
- **Transparency** — all rules and weather data are on-chain and auditable.
- **Accessibility** — designed for farmers who use mobile money and basic smartphones.

Beyond just insurance, AgroShield is building a full financial safety net for farmers:
- Early weather alerts via SMS (Africa's Talking) so farmers can act before the drought hits.
- USSD interface for feature phone users (no smartphone needed).
- Simple crop recommendations based on weather trends.
- An on-chain coverage and claims history that can later help farmers access better credit from lenders.

**In short:**
AgroShield removes the biggest barriers of traditional insurance and turns climate protection into fast, transparent, and affordable on-chain infrastructure for smallholder farmers.

---

### Architecture
The AgroShield system follows a modular, trustless architecture:

```text
        [ Weather Oracle (OpenWeatherMap) ]
                |
                v
     [ Smart Contract ] <--- [ Base Sepolia ]
                |
                v
     [ Frontend Dashboard ] <--- [ User Wallet (MetaMask/Rabby) ]
                |
                v
        [ Africa's Talking API ]
           /              \
        SMS              USSD
```

1. **Weather Oracle**: Ingests satellite weather data via OpenWeatherMap API.
2. **Smart Contract**: Stores policy state and automates payouts on Base Sepolia.
3. **Frontend Dashboard**: User-friendly portal for farmers to buy coverage and track insurance status.
4. **Africa's Talking**: Handles SMS notifications and USSD sessions for feature phone users.
5. **Base Network**: Handles low-cost, secure settlement.

---

### Key Features
- Automatic payouts based on verified weather triggers.
- Multi-wallet support (MetaMask, Rabby, WalletConnect via RainbowKit).
- Dashboard for coverage status, payout history, and weather alerts.
- **SMS notifications** via Africa's Talking (policy confirmation, payout alerts, weather warnings).
- **USSD interface** via Africa's Talking (feature phone access: buy coverage, check policies, view payouts).
- **Weather oracle** integration with OpenWeatherMap for real-time rainfall data.
- Credit score building through on-chain history.

---

### Project Structure
```text
agroshield/
├── contracts/
│   └── contracts/            # Solidity Smart Contract
│       └── PolicyContract.sol
│   └── scripts/              # Deployment scripts
│       └── deploy.js
│   └── hardhat.config.js     # Hardhat configuration (Base Sepolia)
├── frontend/                 # Next.js Application
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/         # Better-auth endpoints
│   │   │   ├── oracle/       # Weather oracle endpoints
│   │   │   ├── sms/          # SMS notification endpoints
│   │   │   └── ussd/         # USSD callback endpoint
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
│   │   ├── abi.ts            # Contract ABI
│   │   ├── agroshield.ts     # Contract interaction logic
│   │   ├── africastalking.ts # Africa's Talking SMS/USSD
│   │   ├── auth.ts           # Better-auth config
│   │   ├── wagmi.ts          # Wagmi configuration (Base Sepolia)
│   │   └── weather-oracle.ts # Weather oracle integration
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
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=your_postgresql_url
BETTER_AUTH_SECRET=your_better_auth_secret
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
PRIVATE_KEY=your_deployer_private_key
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=your_africastalking_sandbox_key
WEATHER_API_KEY=your_openweathermap_api_key
```

#### 4. Run the frontend
```bash
npm run dev
```

#### 5. Deploy Smart Contract to Base Sepolia
```bash
cd ../contracts
npm install
# Add PRIVATE_KEY and BASESCAN_API_KEY to .env
npm run deploy
```

#### 6. Configure Africa's Talking Sandbox
1. Sign up at https://africastalking.com
2. Get sandbox credentials (username: `sandbox`, API key from dashboard)
3. Add to frontend `.env.local`
4. Test USSD at https://simulator.africastalking.com:1517

---

### Roadmap
- [x] Core contract + Testnet deployment (Base Sepolia)
- [x] Multi-wallet + Basic UI
- [x] Weather oracle integration (OpenWeatherMap)
- [x] Africa's Talking SMS integration
- [x] Africa's Talking USSD interface
- [x] Deploy contract to Base Sepolia (0x9C478BC167cE2673fd3c5631601D31D2D50E49fF)
- [x] Frontend integration testing
- [x] Auto-payout (oracle) tested on Base Sepolia
- [ ] **Mainnet Launch** + Pilot in Makueni County
- [ ] Scale across Kenya and East Africa

---

### Coverage & Payout Rules

**Coverage (buy):**
- Premium must be > 0 (paid in ETH).
- Coverage amount must be > 0.
- Rainfall threshold must be > 0 (mm).
- Each purchase creates one policy tied to the buyer's wallet.

**Trigger (report):**
- The oracle reports observed rainfall (mm) + a keccak256 report hash.
- A policy can only be reported once.
- Oracle is the contract owner (deployer) by default.

**Payout (settle):**
- Triggers only if `0 < reportedValue < threshold`.
- If rainfall >= threshold, no payout.
- Pays the full coverage amount to the holder; policy closes (no double claims).
- Anyone can call `settle` once reported.

---

### Contract Functions


The smart contract supports the following functions:

- `buy(uint64 threshold, uint256 coverage)`: Purchase insurance policy with premium payment
- `report(uint256 id, uint256 value, bytes32 reportHash)`: Oracle reports rainfall data
- `settle(uint256 id)`: Trigger automatic payout if conditions are met
- `getPolicy(uint256 id)`: Retrieve policy details
- `setOracle(address _oracle)`: Update oracle address (owner only)
- `fundContract()`: Fund the contract for payouts
- `withdrawFunds()`: Withdraw contract balance (owner only)

---

### API Endpoints

#### Weather Oracle
- `GET /api/oracle?lat={lat}&lon={lon}&location={place}&policyId={id}&threshold={threshold}` - Get rainfall data and check trigger (location is geocoded)
- `POST /api/oracle` - Check trigger with body: `{policyId, latitude, longitude, threshold}`
- `POST /api/payout/trigger` - Auto-payout: reads active policies, fetches live weather by policy location, reports rainfall, and settles if below threshold. Returns per-policy results.

#### SMS Notifications
- `POST /api/sms` - Send SMS
  - Types: `policy_confirmation`, `payout`, `weather_alert`, `welcome`, `custom`

#### USSD
- `POST /api/ussd` - Africa's Talking USSD callback
  - Form data: `sessionId`, `phoneNumber`, `text`, `serviceCode`

---

### Testing the Application

1. **Get Testnet Funds**: Visit https://faucet.quicknode.com/base/sepolia for Base Sepolia ETH
2. **Connect Wallet**: Use MetaMask or Rabby wallet to connect to Base Sepolia (Chain ID: 84532)
3. **Buy Policy**: Purchase insurance coverage by paying premium
4. **Report Rainfall**: Simulate oracle reporting rainfall data via API
5. **Settle Payout**: Trigger automatic payout if rainfall is below threshold
6. **Test USSD**: Use Africa's Talking simulator at https://simulator.africastalking.com:1517
7. **Test SMS**: Use Africa's Talking sandbox to send test SMS

---

### Explorer Links

- **Transaction Explorer**: https://sepolia.basescan.org/tx/{transaction_hash}
- **Contract Explorer**: https://sepolia.basescan.org/address/{contract_address}
- **Africa's Talking Sandbox**: https://africastalking.com/sandbox
