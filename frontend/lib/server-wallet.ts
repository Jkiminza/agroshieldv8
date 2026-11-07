import { createWalletClient, createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

export function getWalletClient() {
  const pk = process.env.PRIVATE_KEY
  if (!pk) throw new Error('PRIVATE_KEY not set')
  const account = privateKeyToAccount(`0x${pk.replace(/^0x/, '')}` as `0x${string}`)
  return {
    account,
    walletClient: createWalletClient({ account, chain: baseSepolia, transport: http('https://sepolia.base.org') }),
    publicClient: createPublicClient({ chain: baseSepolia, transport: http('https://sepolia.base.org') }),
  }
}
