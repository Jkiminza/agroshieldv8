import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'

// 0G Galileo Testnet
export const galileo = defineChain({
  id: 16602,
  name: '0G Galileo Testnet',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: '0G',
  },
  rpcUrls: {
    default: {
      http: ['https://evmrpc-testnet.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0G Explorer',
      url: 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: true,
})

export const config = getDefaultConfig({
  appName: 'AgroShield',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [galileo],
  ssr: true, // Enable server-side rendering
})
