import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  phone: string
  countryCode: string
  isVerified: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  otpSent: boolean
  otpVerified: boolean
  login: (phone: string, countryCode: string) => Promise<void>
  sendOTP: (phone: string, countryCode: string) => Promise<{ messageId: string; message: string; simulated?: boolean; otp?: string }>
  verifyOTP: (otp: string) => Promise<boolean>
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      otpSent: false,
      otpVerified: false,

      login: async (phone: string, countryCode: string) => {
        set({ isLoading: true })
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const user: User = {
          phone,
          countryCode,
          isVerified: false
        }
        
        set({
          user,
          isLoading: false,
          otpSent: false,
          otpVerified: false
        })
      },

      sendOTP: async (phone: string, countryCode: string) => {
        set({ isLoading: true })
        
        try {
          console.log('📱 Sending OTP from auth store:')
          console.log(`   Phone: "${phone}"`)
          console.log(`   Country Code: "${countryCode}"`)
          
          const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone, countryCode })
          })

          const data = await response.json()
          console.log('📱 Send OTP response:', data)

          if (!response.ok) {
            throw new Error(data.error || 'Failed to send OTP')
          }

          set({
            isLoading: false,
            otpSent: true,
            user: {
              phone,
              countryCode,
              isVerified: false
            }
          })

          // For demo purposes, show OTP in console
          if (data.otp) {
            console.log(`🔐 Demo OTP: ${data.otp}`)
          }

          return data
        } catch (error) {
          console.error('❌ Error in sendOTP:', error)
          set({ isLoading: false })
          throw error
        }
      },

      verifyOTP: async (otp: string): Promise<boolean> => {
        set({ isLoading: true })
        
        try {
          const currentUser = get().user
          if (!currentUser) {
            console.log('❌ No user found for OTP verification')
            throw new Error('No user found')
          }

          // Ensure OTP is string and 6 digits
          const otpString = String(otp).padStart(6, '0')
          
          console.log('🔍 Starting OTP verification:')
          console.log(`   User Phone: "${currentUser.phone}"`)
          console.log(`   User Country Code: "${currentUser.countryCode}"`)
          console.log(`   Original OTP: "${otp}"`)
          console.log(`   Formatted OTP: "${otpString}"`)

          const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              phone: currentUser.phone, 
              countryCode: currentUser.countryCode,
              otp: otpString
            })
          })

          const data = await response.json()
          console.log('🔍 Verification response:', data)

          if (!response.ok) {
            console.log('❌ OTP verification failed:', data.error)
            set({ isLoading: false })
            return false
          }

          console.log('✅ OTP verification successful')
          set({
            user: { ...currentUser, isVerified: true },
            isAuthenticated: true,
            isLoading: false,
            otpVerified: true
          })

          return true
        } catch (error) {
          console.log('❌ OTP verification error:', error)
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          otpSent: false,
          otpVerified: false
        })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
) 