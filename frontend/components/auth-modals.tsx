'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface AuthModalsProps {
  isOpen: boolean
  mode: 'login' | 'signup'
  onClose: () => void
  onSwitchMode: (mode: 'login' | 'signup') => void
  onSubmit: (data: any) => Promise<void>
}

export function AuthModals({
  isOpen,
  mode,
  onClose,
  onSwitchMode,
  onSubmit,
}: AuthModalsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer' as 'farmer' | 'partner',
  })

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await onSubmit(formData)
      setFormData({
        fullName: '',
        businessName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'farmer',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#171917] border border-[#2b332e] rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-[#19a463]/20">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#2b332e]">
            <h2 className="font-display text-xl font-bold text-[#f0f4ff]">
              {mode === 'signup' ? 'Create your AgroShield account' : 'Welcome to AgroShield'}
            </h2>
            <button
              onClick={onClose}
              className="text-[#8a9bb5] hover:text-[#f0f4ff] transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#f0f4ff] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0a0a0a] border border-[#2b332e] rounded-lg px-4 py-2 text-[#f0f4ff] placeholder-[#8a9bb5] focus:outline-none focus:border-[#19a463] transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f0f4ff] mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0a0a0a] border border-[#2b332e] rounded-lg px-4 py-2 text-[#f0f4ff] placeholder-[#8a9bb5] focus:outline-none focus:border-[#19a463] transition-colors"
                    placeholder="Nairobi Fresh Produce Ltd"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-[#f0f4ff] mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-[#0a0a0a] border border-[#2b332e] rounded-lg px-4 py-2 text-[#f0f4ff] placeholder-[#8a9bb5] focus:outline-none focus:border-[#19a463] transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#f0f4ff] mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-[#0a0a0a] border border-[#2b332e] rounded-lg px-4 py-2 text-[#f0f4ff] placeholder-[#8a9bb5] focus:outline-none focus:border-[#19a463] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-[#f0f4ff] mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0a0a0a] border border-[#2b332e] rounded-lg px-4 py-2 text-[#f0f4ff] placeholder-[#8a9bb5] focus:outline-none focus:border-[#19a463] transition-colors"
                  placeholder="••••••••"
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-[#19a463] hover:text-[#00d9a8] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-[#f0f4ff] mb-3">
                  Who are you?
                </label>
                <div className="flex gap-2">
                  {['farmer', 'partner'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          role: role as 'farmer' | 'partner',
                        }))
                      }
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${
                        formData.role === role
                          ? 'bg-[#19a463] text-[#0a0a0a]'
                          : 'bg-[#0a0a0a] border border-[#2b332e] text-[#8a9bb5] hover:text-[#f0f4ff]'
                      }`}
                    >
                      {role === 'farmer' ? 'I\'m a Farmer' : 'I\'m a Partner'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#19a463] text-[#0a0a0a] py-3 px-4 rounded-full font-semibold hover:bg-[#00d9a8] transition-all hover:shadow-lg hover:shadow-[#19a463]/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? 'Loading...'
                : mode === 'signup'
                  ? 'Create Account'
                  : 'Log In'}
            </button>
          </form>

          {/* Footer */}
          <div className="p-6 border-t border-[#2b332e] text-center text-sm text-[#8a9bb5]">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => onSwitchMode('login')}
                  className="text-[#19a463] hover:text-[#00d9a8] transition-colors font-medium"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => onSwitchMode('signup')}
                  className="text-[#19a463] hover:text-[#00d9a8] transition-colors font-medium"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
