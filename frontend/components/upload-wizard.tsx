'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Check, ArrowRight } from 'lucide-react'

export function UploadWizard() {
  const [step, setStep] = useState(1)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    businessName: 'Nairobi Fresh Produce Ltd',
    invoiceNumber: '',
    clientName: '',
    amount: '',
    currency: 'KES',
    invoiceDate: '',
    dueDate: '',
    description: '',
  })
  const [discountRate, setDiscountRate] = useState(10)
  const [minimumFunding, setMinimumFunding] = useState('')
  const [fundingDeadline, setFundingDeadline] = useState('')
  const [allowPartial, setAllowPartial] = useState(false)

  const handleSubmit = () => {
    setIsSuccess(true)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center py-8">
        <motion.div
          className="max-w-md w-full bg-[#171917] border border-[#2b332e] rounded-lg p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' }}
        >
          <motion.div
            className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
          >
            <Check className="text-emerald-400 w-8 h-8 checkmark-animate" />
          </motion.div>

          <h2 className="font-display text-2xl font-bold text-[#f0f4ff] mb-2">Invoice Tokenized!</h2>
          <p className="text-[#8a9bb5] mb-6">
            INV-2024-0847 is now live on the marketplace. You&apos;ll be notified when investors fund it.
          </p>

          <button className="w-full bg-[#19a463] hover:bg-[#00d9a8] text-[#0a0a0a] font-bold py-3 rounded-full transition-all hover:shadow-lg hover:shadow-[#19a463]/30 hover:scale-105 flex items-center justify-center gap-2">
            View on Marketplace <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold transition-colors ${
                    s <= step
                      ? 'bg-[#19a463] text-[#0a0a0a]'
                      : 'bg-[#232823] text-[#8a9bb5] border border-[#2b332e]'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${s < step ? 'bg-[#19a463]' : 'bg-[#232823]'}`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-[#8a9bb5] text-sm">
            Step {step} of 3
          </p>
        </div>

        {/* Step 1: Invoice Details */}
        {step === 1 && (
          <motion.div
            className="bg-[#171917] border border-[#2b332e] rounded-lg p-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-2xl font-bold text-[#f0f4ff] mb-6">Invoice Details</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#8a9bb5] mb-2">Business Name</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    disabled
                    className="w-full bg-[#232823] border border-[#2b332e] rounded px-4 py-2 text-[#f0f4ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#8a9bb5] mb-2">Invoice Number *</label>
                  <input
                    type="text"
                    placeholder="INV-2024-0847"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full bg-[#232823] border border-[#2b332e] rounded px-4 py-2 text-[#f0f4ff] placeholder-[#8a9bb5]/50 focus:outline-none focus:border-[#19a463]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8a9bb5] mb-2">Client / Debtor Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Kenya Power & Lighting"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full bg-[#232823] border border-[#2b332e] rounded px-4 py-2 text-[#f0f4ff] placeholder-[#8a9bb5]/50 focus:outline-none focus:border-[#19a463]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#8a9bb5] mb-2">Amount *</label>
                  <input
                    type="number"
                    placeholder="2400000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-[#232823] border border-[#2b332e] rounded px-4 py-2 text-[#f0f4ff] placeholder-[#8a9bb5]/50 focus:outline-none focus:border-[#19a463]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#8a9bb5] mb-2">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full bg-[#232823] border border-[#2b332e] rounded px-4 py-2 text-[#f0f4ff] focus:outline-none focus:border-[#19a463]"
                  >
                    <option>KES</option>
                    <option>NGN</option>
                    <option>GHS</option>
                    <option>USD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#8a9bb5] mb-2">Invoice Date *</label>
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                    className="w-full bg-[#232823] border border-[#2b332e] rounded px-4 py-2 text-[#f0f4ff] focus:outline-none focus:border-[#19a463]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#8a9bb5] mb-2">Payment Due Date *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-[#232823] border border-[#2b332e] rounded px-4 py-2 text-[#f0f4ff] focus:outline-none focus:border-[#19a463]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8a9bb5] mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Invoice description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#232823] border border-[#2b332e] rounded px-4 py-2 text-[#f0f4ff] placeholder-[#8a9bb5]/50 focus:outline-none focus:border-[#19a463]"
                />
              </div>

              {/* Upload Zone */}
              <div className="border-2 border-dashed border-[#2b332e] rounded-lg p-8 text-center hover:border-[#19a463] transition-colors">
                <Upload className="w-8 h-8 text-[#8a9bb5] mx-auto mb-3" />
                <p className="text-[#f0f4ff] font-semibold mb-1">Drag PDF or click to browse</p>
                <p className="text-sm text-[#8a9bb5]">Upload Invoice PDF</p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-[#19a463] hover:bg-[#00b87f] text-[#0a0a0a] font-bold py-3 rounded-lg transition-colors"
              >
                Next Step
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Tokenization Settings */}
        {step === 2 && (
          <motion.div
            className="bg-[#171917] border border-[#2b332e] rounded-lg p-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-2xl font-bold text-[#f0f4ff] mb-6">Tokenization Settings</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#8a9bb5] mb-4">
                  Discount Rate: <span className="text-[#19a463]">{discountRate}%</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-[#8a9bb5] mt-2">You'll accept a 10% discount to get funded faster</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8a9bb5] mb-2">Minimum Funding Amount</label>
                <input
                  type="number"
                  placeholder="KES 1,000,000"
                  value={minimumFunding}
                  onChange={(e) => setMinimumFunding(e.target.value)}
                  className="w-full bg-[#232823] border border-[#2b332e] rounded px-4 py-2 text-[#f0f4ff] placeholder-[#8a9bb5]/50 focus:outline-none focus:border-[#19a463]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8a9bb5] mb-2">Funding Deadline</label>
                <input
                  type="date"
                  value={fundingDeadline}
                  onChange={(e) => setFundingDeadline(e.target.value)}
                  className="w-full bg-[#232823] border border-[#2b332e] rounded px-4 py-2 text-[#f0f4ff] focus:outline-none focus:border-[#19a463]"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="partial"
                  checked={allowPartial}
                  onChange={(e) => setAllowPartial(e.target.checked)}
                  className="w-4 h-4 bg-[#232823] border border-[#2b332e] rounded"
                />
                <label htmlFor="partial" className="text-[#8a9bb5] text-sm font-medium">
                  Allow partial funding
                </label>
              </div>

              <div className="bg-[#232823] border border-[#2b332e] rounded-lg p-4">
                <p className="text-sm text-[#8a9bb5] mb-2">Preview:</p>
                <p className="text-[#f0f4ff] font-mono">
                  You'll receive approximately <span className="text-[#19a463] font-bold">KES 2,160,000</span> for a{' '}
                  <span className="text-[#f5a623] font-bold">KES 2,400,000</span> invoice at 10% discount
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-[#2b332e] text-[#8a9bb5] hover:text-[#f0f4ff] font-bold py-3 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-[#19a463] hover:bg-[#00b87f] text-[#0a0a0a] font-bold py-3 rounded-lg transition-colors"
              >
                Review
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <motion.div
            className="bg-[#171917] border border-[#2b332e] rounded-lg p-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-2xl font-bold text-[#f0f4ff] mb-6">Review & Submit</h2>

            <div className="bg-[#232823] border border-[#2b332e] rounded-lg p-6 mb-6">
              <h3 className="font-display font-bold text-[#f0f4ff] mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#8a9bb5]">Invoice #:</span>
                  <span className="font-mono text-[#19a463]">INV-2024-0847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a9bb5]">Client:</span>
                  <span className="text-[#f0f4ff]">{formData.clientName || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a9bb5]">Amount:</span>
                  <span className="font-mono text-[#f5a623]">{formData.amount || '—'} {formData.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a9bb5]">Discount Rate:</span>
                  <span className="text-[#f0f4ff]">{discountRate}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <details className="group">
                <summary className="cursor-pointer font-semibold text-[#f0f4ff] hover:text-[#19a463] transition-colors">
                  Smart Contract Terms →
                </summary>
                <div className="mt-4 bg-[#232823] rounded p-4 text-sm text-[#8a9bb5] space-y-2">
                  <p>• This invoice token is backed by a verified business invoice</p>
                  <p>• Investors receive coverage on Base (Base Sepolia) proportional to their investment</p>
                  <p>• Repayment occurs when the underlying invoice is paid</p>
                  <p>• All transactions are recorded on Base (Base Sepolia)</p>
                </div>
              </details>
            </div>

            <div className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                id="confirm"
                className="w-4 h-4 bg-[#232823] border border-[#2b332e] rounded mt-1"
              />
              <label htmlFor="confirm" className="text-[#8a9bb5] text-sm">
                I confirm this invoice is real and unpaid
              </label>
            </div>

            <p className="text-xs text-[#8a9bb5] mb-6 text-center">
              Your invoice will be reviewed within 2 hours before going live on the marketplace.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-[#2b332e] text-[#8a9bb5] hover:text-[#f0f4ff] font-bold py-3 rounded-full transition-all hover:bg-[#232823]/50 hover:border-[#19a463]/30"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-[#19a463] hover:bg-[#00d9a8] text-[#0a0a0a] font-bold py-3 rounded-full transition-all hover:shadow-lg hover:shadow-[#19a463]/30"
              >
                Tokenize Invoice
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
