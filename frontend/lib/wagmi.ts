import { createConfig, http } from 'wagmi'
import { baseSepolia } from 'viem/chains'
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: 'AgroShield' }),
  ],
  chains: [baseSepolia],
  transports: { [baseSepolia.id]: http() },
  ssr: true,
})
