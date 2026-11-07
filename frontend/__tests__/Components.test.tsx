import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import BuyCoverageButton from '../components/BuyCoverageButton'
import { WalletConnectButton } from '../components/wallet-connect-button'

test('BuyCoverageButton renders correctly', () => {
  render(<BuyCoverageButton />)
  const button = screen.getByRole('button', { name: /coverage/i })
  expect(button).toBeDefined()
})

test('WalletConnectButton renders correctly', () => {
  render(<WalletConnectButton />)
  const button = screen.getByRole('button', { name: /connect wallet/i })
  expect(button).toBeDefined()
})

test('BuyCoverageButton is clickable', () => {
  render(<BuyCoverageButton />)
  const button = screen.getByRole('button', { name: /coverage/i })
  expect(button).not.toBeDisabled()
})
