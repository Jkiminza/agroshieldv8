import { baseSepolia } from 'viem/chains'
import { parseEther, formatEther, keccak256, toBytes } from 'viem'
import { CONTRACT_ABI } from './abi'

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"

export const NETWORK = baseSepolia
export const EXPLORER_URL = "https://sepolia.basescan.org"

export async function getConnectedAddress(): Promise<string> {
  throw new Error("Use useAccount hook from wagmi instead")
}

export async function buyPolicy({
  premium,
  coverageAmount,
  rainfallThreshold = 25,
}: {
  premium: number;
  coverageAmount: number;
  rainfallThreshold?: number;
}) {
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
  return {
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getPolicy' as const,
    args: [BigInt(policyId)]
  }
}

export async function reportRainfall(policyId: number, rainfallMm: number) {
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

function generateReportHash(data: any): `0x${string}` {
  return keccak256(toBytes(JSON.stringify(data)))
}

export function getExplorerUrl(txHash: string) {
  return `${EXPLORER_URL}/tx/${txHash}`
}

export function getContractUrl() {
  return `${EXPLORER_URL}/address/${CONTRACT_ADDRESS}`
}
