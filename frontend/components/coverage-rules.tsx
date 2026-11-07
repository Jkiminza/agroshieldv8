'use client'

import { ShieldCheck, CloudRain, Wallet, AlertCircle } from 'lucide-react'

const rules = [
  {
    icon: ShieldCheck,
    title: 'Coverage',
    items: [
      'Pay a premium in ETH on Base Sepolia to enroll a plot.',
      'Choose a rainfall threshold (mm) and a coverage amount (ETH).',
      'Premium must be > 0, coverage > 0, threshold > 0.',
      'Each purchase creates one policy tied to your wallet.',
    ],
  },
  {
    icon: CloudRain,
    title: 'Trigger',
    items: [
      'The weather oracle (OpenWeatherMap) reports observed rainfall for your location.',
      'A payout triggers only when observed rainfall < your threshold.',
      'If rainfall is at or above the threshold, no payout is made.',
      'Each policy can only be reported once.',
    ],
  },
  {
    icon: Wallet,
    title: 'Payout',
    items: [
      'On trigger, the full coverage amount is sent to your wallet automatically.',
      'The policy is then closed (no double claims).',
      'No claims forms or investigators — settlement is on-chain.',
      'Funds arrive as ETH on Base Sepolia.',
    ],
  },
  {
    icon: AlertCircle,
    title: 'Notes',
    items: [
      'Oracle currently reports current rainfall; historical averaging can be added.',
      'Oracle key is the contract owner (deployer) for now.',
      'Testnet only — use Base Sepolia test ETH.',
    ],
  },
]

export function CoverageRules() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rules.map(({ icon: Icon, title, items }) => (
        <div key={title} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e7f6ee] text-[#16834e]">
              <Icon size={16} />
            </div>
            <h3 className="text-base font-semibold text-neutral-950">{title}</h3>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-neutral-600">
            {items.map((it) => (
              <li key={it} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#19a463]" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
