export const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "uint64", "name": "threshold", "type": "uint64"},
      {"internalType": "uint256", "name": "coverage", "type": "uint256"}
    ],
    "name": "buy",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "uint256", "name": "value", "type": "uint256"},
      {"internalType": "bytes32", "name": "reportHash", "type": "bytes32"}
    ],
    "name": "report",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"}
    ],
    "name": "settle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"}
    ],
    "name": "getPolicy",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "holder", "type": "address"},
          {"internalType": "uint64", "name": "threshold", "type": "uint64"},
          {"internalType": "uint256", "name": "premium", "type": "uint256"},
          {"internalType": "uint256", "name": "coverage", "type": "uint256"},
          {"internalType": "uint256", "name": "reportedValue", "type": "uint256"},
          {"internalType": "bytes32", "name": "reportHash", "type": "bytes32"},
          {"internalType": "bool", "name": "active", "type": "bool"},
          {"internalType": "bool", "name": "paid", "type": "bool"}
        ],
        "internalType": "struct PolicyContract.Policy",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const
