'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface InvoiceCardProps {
  businessName?: string
  invoiceNumber?: string
  amount?: number
  dueDate?: string
  autoFlip?: boolean
}

export function InvoiceCard({
  businessName = 'Mwangi Farm Cooperative',
  invoiceNumber = 'AGS-2024-5412',
  amount = 250000,
  dueDate = 'May 2024',
  autoFlip = true,
}: InvoiceCardProps) {
  return (
    <motion.div
      className="w-full max-w-xs h-56 perspective"
      animate={autoFlip ? { 
        rotateY: [0, 180, 360],
        rotateX: [0, -5, 5, 0],
        scale: [1, 1.02, 0.98, 1],
      } : {}}
      transition={{ 
        rotateY: { duration: 8, repeat: Infinity, ease: 'linear' },
        rotateX: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
        scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' }
      }}
      style={{ transformStyle: 'preserve-3d' as const }}
    >
      {/* Front of card */}
      <motion.div
        className="absolute w-full h-full bg-gradient-to-br from-[#232823] to-[#171917] border border-[#2b332e] rounded-xl p-6 flex flex-col justify-between shadow-2xl"
        style={{
          backfaceVisibility: 'hidden' as const,
        }}
      >
        <div>
          <p className="text-[#8a9bb5] text-sm font-medium">{businessName}</p>
          <p className="font-display text-2xl font-bold text-[#f0f4ff] mt-4">Crop Insurance</p>
        </div>

        <div className="space-y-3 py-4 border-t border-b border-[#2b332e]">
          <div className="flex justify-between">
            <span className="text-[#8a9bb5] text-sm">Policy #</span>
            <span className="font-mono text-[#19a463] font-semibold text-sm">{invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8a9bb5] text-sm">Coverage</span>
            <span className="font-mono text-[#f5a623] font-bold">KES {amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8a9bb5] text-sm">Season</span>
            <span className="font-mono text-[#f0f4ff] font-semibold">{dueDate}</span>
          </div>
        </div>
      </motion.div>

      {/* Back of card */}
      <motion.div
        className="absolute w-full h-full bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl p-6 flex flex-col justify-center items-center shadow-2xl border border-emerald-400"
        style={{
          backfaceVisibility: 'hidden' as const,
        }}
      >
        <div className="text-center">
          <motion.div
            className="text-6xl mb-4 checkmark-animate"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            ✓
          </motion.div>
          <p className="font-display text-3xl font-bold text-white mb-2">PROTECTED</p>
          <p className="text-emerald-100 text-sm font-medium mb-4">Coverage Active on Base</p>

          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-emerald-50 text-xs mb-1">Automated Payouts Enabled</p>
            <p className="font-mono text-white font-bold text-lg">Weather-Triggered</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
