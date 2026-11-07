"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS } from "@/lib/agroshield";
import { CONTRACT_ABI } from "@/lib/abi";
import { getExplorerUrl } from "@/lib/agroshield";

export default function BuyCoverageButton() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const [message, setMessage] = useState("");

  const handleBuy = async () => {
    if (!isConnected) {
      setMessage("Please connect your wallet first");
      return;
    }

    try {
      setMessage("Waiting for wallet signature...");
      
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'buy',
        args: [BigInt(25), parseEther("1")], // threshold: 25mm, coverage: 1 0G
        value: parseEther("0.001"), // premium: 0.001 0G
      });
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message || "Transaction failed");
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">Policy purchased successfully!</p>
          <a 
            href={getExplorerUrl(hash!)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-600 hover:underline text-sm"
          >
            View transaction on explorer →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleBuy}
        disabled={isPending || isConfirming}
        className="rounded-full bg-[#19a463] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#00c896] shadow-sm shadow-[#19a463]/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending || isConfirming ? "Processing..." : "Buy Coverage (0.001 0G)"}
      </button>

      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
      
      {message && !error && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
}
