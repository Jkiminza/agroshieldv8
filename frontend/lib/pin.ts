import crypto from 'crypto'

// Storage format: scrypt:<saltHex>:<derivedKeyHex>
export function hashPin(pin: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const dk = crypto.scryptSync(String(pin), salt, 64).toString('hex')
  return `scrypt:${salt}:${dk}`
}

export function verifyPin(pin: string, stored: string | null | undefined): boolean {
  if (!stored || !pin) return false
  const parts = stored.split(':')
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false
  const salt = parts[1]
  const expected = parts[2]
  try {
    const derived = crypto.scryptSync(String(pin), salt, 64).toString('hex')
    // constant-time compare
    const a = Buffer.from(derived, 'hex')
    const b = Buffer.from(expected, 'hex')
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(String(pin || ''))
}
