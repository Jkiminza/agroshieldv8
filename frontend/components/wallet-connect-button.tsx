'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export function WalletConnectButton() {
  return (
    <ConnectButton
      accountStatus={{
        smallScreen: 'avatar',
        largeScreen: 'full',
      }}
      showBalance={{
        smallScreen: false,
        largeScreen: true,
      }}
    />
  )
}
