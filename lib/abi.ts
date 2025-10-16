export const ETH_MOOD_METER_ABI = [
  {
    "inputs": [],
    "name": "today",
    "outputs": [
      { "internalType": "uint256", "name": "day", "type": "uint256" },
      { "internalType": "uint256", "name": "bullish", "type": "uint256" },
      { "internalType": "uint256", "name": "bearish", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totals",
    "outputs": [
      { "internalType": "uint256", "name": "bullish", "type": "uint256" },
      { "internalType": "uint256", "name": "bearish", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "fid", "type": "uint256" },
      { "internalType": "uint8", "name": "mood", "type": "uint8" }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetDayCounters",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
