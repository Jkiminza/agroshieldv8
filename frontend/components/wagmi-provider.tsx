'use client'

import { WagmiProvider as WagmiCoreProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiCoreProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: '#19a463' })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiCoreProvider>
  )
}
