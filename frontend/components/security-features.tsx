'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const securityFeatures = [
  {
    id: 'encryption',
    title: 'Encryption',
    description: 'All farm data and personal information is encrypted end-to-end using military-grade AES-256 encryption. Your private data stays private.',
    image: '/security-encryption.png',
  },
  {
    id: 'authentication',
    title: 'Authentication',
    description: 'Multi-factor authentication and biometric verification ensure only authorized farmers can access their policies and payouts.',
    image: '/security-authentication.jpg',
  },
  {
    id: 'decentralization',
    title: 'Decentralization',
    description: 'Built on the 0G blockchain, AgroShield operates without central intermediaries. Smart contracts execute insurance triggers autonomously.',
    image: '/security-decentralization.jpg',
  },
  {
    id: 'audit',
    title: 'Audit Trails',
    description: 'Every transaction, trigger event, and payout is permanently recorded on-chain. Complete transparency and immutable audit records.',
    image: '/security-audit-trails.jpg',
  },
]

export function SecurityFeatures() {
  const [activeFeature, setActiveFeature] = useState('encryption')

  const currentFeature = securityFeatures.find(f => f.id === activeFeature)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      {/* Left side - Image (takes 2 columns) */}
      <motion.div
        className="lg:col-span-2 relative h-96 rounded-2xl overflow-hidden border border-[#2b332e]"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {currentFeature && (
          <Image
            key={`${currentFeature.id}-img`}
            src={currentFeature.image}
            alt={currentFeature.title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent" />
      </motion.div>

      {/* Right side - Buttons and Description (takes 3 columns) */}
      <motion.div
        className="lg:col-span-3 flex flex-col space-y-6"
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        {/* Security Feature Buttons - Horizontal */}
        <div className="flex gap-3 flex-nowrap overflow-x-auto lg:overflow-visible">
          {securityFeatures.map((feature) => (
            <motion.button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className={`px-4 py-3 rounded-full font-semibold transition-all whitespace-nowrap text-sm flex-shrink-0 ${
                activeFeature === feature.id
                  ? 'bg-[#19a463] text-[#0a0a0a] shadow-lg shadow-[#19a463]/30'
                  : 'bg-transparent border-2 border-[#19a463] text-[#19a463] hover:bg-[#19a463]/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {feature.title}
            </motion.button>
          ))}
        </div>

        {/* Description Text */}
        <motion.div
          className="mt-8"
          key={`desc-${activeFeature}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-lg text-[#8a9bb5] leading-relaxed">
            {currentFeature?.description}
          </p>
        </motion.div>

        {/* Feature Indicator Dots */}
        <div className="flex space-x-2 mt-8">
          {securityFeatures.map((feature) => (
            <motion.button
              key={`dot-${feature.id}`}
              onClick={() => setActiveFeature(feature.id)}
              className={`h-2 rounded-full transition-all ${
                activeFeature === feature.id
                  ? 'bg-[#19a463] w-8'
                  : 'bg-[#2b332e] w-2 hover:bg-[#19a463]/50'
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
