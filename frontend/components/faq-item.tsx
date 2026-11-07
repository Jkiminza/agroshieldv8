'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FAQItemProps {
  question: string
  answer: string
  index: number
}

export function FAQItem({ question, answer, index }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      className="bg-[#111827] border border-[#1e2d45] rounded-lg overflow-hidden hover:border-[#00c896]/30 transition-all"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-[#1a2235]/50 transition-colors cursor-pointer group"
      >
        <h3 className="font-semibold text-[#f0f4ff] group-hover:text-[#00c896] transition-colors text-left flex-1">
          {question}
        </h3>
        <motion.span
          className="text-[#00c896] ml-4 flex-shrink-0 text-2xl"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          +
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-[#8a9bb5] leading-relaxed border-t border-[#1e2d45]">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
