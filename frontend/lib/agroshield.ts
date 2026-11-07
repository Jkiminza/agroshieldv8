import { galileo } from './wagmi'
import { parseEther, formatEther, keccak256, toBytes } from 'viem'
import { CONTRACT_ABI } from './abi'

// Deployed contract address on 0G Galileo Testnet
export const CONTRACT_ADDRESS = "0xC3EF46B3Fcce1a266a65DdEF2865BE59758a9e75"

export const NETWORK = galileo
export const EXPLORER_URL = "https://chainscan-galileo.0g.ai"

// Mock function for getting connected address - wagmi handles this via useAccount hook
export async function getConnectedAddress(): Promise<string> {
  throw new Error("Use useAccount hook from wagmi instead")
}

export async function buyPolicy({
  premium,
  coverageAmount,
  rainfallThreshold = 25,
}: {
  premium: number;          // in ETH (will be converted to wei)
  coverageAmount: number;   // in ETH (will be converted to wei)
  rainfallThreshold?: number;
}) {
  // This function should be called from a React component using wagmi hooks
  // The actual implementation will be in the component using useWriteContract
  const premiumWei = parseEther(premium.toString())
  const coverageWei = parseEther(coverageAmount.toString())
  
  return {
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'buy' as const,
    args: [BigInt(rainfallThreshold), coverageWei],
    value: premiumWei
  }
}

export async function getPolicy(policyId: number) {
  // This should be called from a React component using useReadContract
  return {
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getPolicy' as const,
    args: [BigInt(policyId)]
  }
}

export async function reportRainfall(policyId: number, rainfallMm: number) {
  // Mock report hash - in production this would come from a real oracle/assessment
  const reportHash = generateReportHash({ policyId, rainfallMm, timestamp: Date.now() })
  
  return {
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'report' as const,
    args: [BigInt(policyId), BigInt(rainfallMm), reportHash]
  }
}

export async function settlePolicy(policyId: number) {
  return {
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'settle' as const,
    args: [BigInt(policyId)]
  }
}

// Generate keccak256 hash for mock reports using viem
function generateReportHash(data: any): `0x${string}` {
  return keccak256(toBytes(JSON.stringify(data)))
}

// Helper to format explorer URLs
export function getExplorerUrl(txHash: string) {
  return `${EXPLORER_URL}/tx/${txHash}`
}

export function getContractUrl() {
  return `${EXPLORER_URL}/address/${CONTRACT_ADDRESS}`
}
