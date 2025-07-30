// Simplified OTP store for the application
interface OTPData {
  otp: string
  timestamp: number
  phone: string
  countryCode: string
}

// Use a simple object instead of Map for easier debugging
// Make it a global variable to persist across requests
declare global {
  var __otpStore: Record<string, OTPData> | undefined
}

// Use global variable to persist across Next.js hot reloads
const otpStore: Record<string, OTPData> = global.__otpStore || {}
global.__otpStore = otpStore

export function storeOTP(phone: string, countryCode: string, otp: string) {
  const key = `${countryCode}${phone}`
  otpStore[key] = {
    otp,
    timestamp: Date.now(),
    phone,
    countryCode
  }
  console.log(`💾 Stored OTP for ${key}: ${otp}`)
  console.log(`📊 Current store keys:`, Object.keys(otpStore))
  console.log(`📊 Store size:`, Object.keys(otpStore).length)
}

export function getOTP(phone: string, countryCode: string) {
  const key = `${countryCode}${phone}`
  const data = otpStore[key]
  console.log(`🔍 Looking for OTP with key: "${key}"`)
  console.log(`📊 Available keys:`, Object.keys(otpStore))
  console.log(`📊 Store size:`, Object.keys(otpStore).length)
  console.log(`📊 Found data:`, data)
  return data
}

export function removeOTP(phone: string, countryCode: string) {
  const key = `${countryCode}${phone}`
  const removed = delete otpStore[key]
  if (removed) {
    console.log(`🗑️ Removed OTP for ${key}`)
  }
  return removed
}

export function debugOTPStore() {
  console.log('🔍 Current OTP Store:')
  console.log(`📊 Store size:`, Object.keys(otpStore).length)
  if (Object.keys(otpStore).length === 0) {
    console.log('   (empty)')
    return
  }
  Object.entries(otpStore).forEach(([key, value]) => {
    const age = Math.floor((Date.now() - value.timestamp) / 1000)
    console.log(`   "${key}": "${value.otp}" (${age}s ago)`)
  })
}

// Export the store for debugging
export { otpStore } 