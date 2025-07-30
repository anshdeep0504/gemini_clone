'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { phoneSchema, otpSchema, type PhoneFormData, type OTPFormData } from '@/lib/auth-validations'
import { useAuthStore } from '@/lib/auth-store'
import { fetchCountries, type Country } from '@/lib/countries'
import { FiPhone, FiShield, FiArrowRight, FiLoader, FiGlobe } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { OTPPopup } from './OTPPopup'

export function Login(): React.JSX.Element {
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [showOTPPopup, setShowOTPPopup] = useState(false)
  const [currentOTP, setCurrentOTP] = useState('')
  const [currentPhone, setCurrentPhone] = useState('')
  const [currentCountryCode, setCurrentCountryCode] = useState('')
  const router = useRouter()
  
  const { 
    user, 
    otpSent, 
    isLoading, 
    sendOTP, 
    verifyOTP 
  } = useAuthStore()

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      countryCode: '+1',
      phone: ''
    }
  })

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ''
    }
  })

  // Auto-fill OTP function - ensure OTP is string
  const handleAutoFillOTP = useCallback((otp: string) => {
    const otpString = String(otp).padStart(6, '0')
    otpForm.setValue('otp', otpString)
    setShowOTPPopup(false)
    toast.success('OTP auto-filled! Press Enter to verify.')
  }, [otpForm])

  // Handle keyboard events for OTP form
  const handleOTPKeyPress = useCallback((e: React.KeyboardEvent) => {
    const otpValue = otpForm.getValues('otp')
    if (e.key === 'Enter' && String(otpValue).length === 6) {
      e.preventDefault()
      onOTPSubmit(otpForm.getValues())
    }
  }, [otpForm])

  // Fetch countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      const countriesData = await fetchCountries()
      setCountries(countriesData)
      setSelectedCountry(countriesData.find(c => c.callingCodes.includes('1')) || countriesData[0])
    }

    loadCountries()
  }, [])

  const onPhoneSubmit = async (data: PhoneFormData) => {
    try {
      // Store current phone and country code for OTP verification
      setCurrentPhone(data.phone)
      setCurrentCountryCode(data.countryCode)
      
      const response = await sendOTP(data.phone, data.countryCode)
      
      // Check if it was a simulated OTP
      if (response.simulated && response.otp) {
        setIsDemoMode(true)
        const otpString = String(response.otp).padStart(6, '0')
        setCurrentOTP(otpString)
        
        // Small delay to ensure state is set before showing popup
        setTimeout(() => {
          setShowOTPPopup(true)
        }, 100)
        
        toast.success('OTP sent successfully! Check the popup for your code.')
      } else {
        setIsDemoMode(false)
        toast.success('OTP sent successfully to your phone!')
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.')
    }
  }

  const onOTPSubmit = async (data: OTPFormData) => {
    try {
      // Ensure OTP is string and 6 digits
      const otpString = String(data.otp).padStart(6, '0')
      console.log('🔍 Submitting OTP:', otpString)
      
      const isValid = await verifyOTP(otpString)
      if (isValid) {
        toast.success('Login successful!')
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        toast.error('Invalid OTP. Please try again.')
      }
    } catch (error) {
      toast.error('Failed to verify OTP')
    }
  }

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Welcome to Gemini</h1>
          <p className="text-gray-400 text-lg">Sign in with your phone number</p>
        </div>

        {/* Phone Number Form */}
        {!otpSent ? (
          <div className="bg-[#2d2d2d] rounded-2xl p-8 border border-gray-700">
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* Country Code Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Country Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="w-full flex items-center justify-between p-4 bg-gray-700 border border-gray-600 rounded-xl text-white hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{selectedCountry?.flag}</span>
                      <span className="text-lg">{selectedCountry?.callingCodes[0] || '+1'}</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-700 border border-gray-600 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                      <div className="p-3 border-b border-gray-600">
                        <input
                          type="text"
                          placeholder="Search countries..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {filteredCountries.map((country) => (
                        <button
                          key={country.name}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(country)
                            setShowCountryDropdown(false)
                            setSearchTerm('')
                            phoneForm.setValue('countryCode', country.callingCodes[0])
                          }}
                          className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-600 transition-colors"
                        >
                          <span className="text-lg">{country.flag}</span>
                          <div className="flex-1">
                            <div className="text-white font-medium">{country.name}</div>
                            <div className="text-gray-400 text-sm">{country.callingCodes[0]}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone Number Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...phoneForm.register('phone')}
                      type="tel"
                      placeholder="Enter your phone number"
                      className="w-full pl-12 pr-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    />
                  </div>
                  {phoneForm.formState.errors.phone && (
                    <p className="mt-2 text-sm text-red-400">{phoneForm.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#2d2d2d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all text-lg font-medium"
              >
                {isLoading ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <FiArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* OTP Verification Form */
          <div className="bg-[#2d2d2d] rounded-2xl p-8 border border-gray-700">
            <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FiShield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Verify OTP</h2>
                <p className="text-gray-400 text-lg">
                  We've sent a 6-digit code to {currentCountryCode} {currentPhone}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Enter OTP
                </label>
                <input
                  {...otpForm.register('otp')}
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  onKeyPress={handleOTPKeyPress}
                  className="w-full px-6 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                />
                {otpForm.formState.errors.otp && (
                  <p className="mt-2 text-sm text-red-400">{otpForm.formState.errors.otp.message}</p>
                )}
                <p className="mt-2 text-xs text-gray-500 text-center">
                  💡 Press Enter to verify automatically
                </p>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#2d2d2d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all text-lg font-medium"
                >
                  {isLoading ? (
                    <>
                      <FiLoader className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify OTP
                      <FiArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Reset to phone form
                    window.location.reload()
                  }}
                  className="w-full text-gray-400 hover:text-white transition-colors py-2"
                >
                  Change phone number
                </button>
              </div>

              {isDemoMode && (
                <div className="mt-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
                  
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    This is a simulated OTP flow for demonstration purposes
                  </p>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
      
      {showOTPPopup && (
        <OTPPopup
          otp={currentOTP}
          phone={currentPhone}
          countryCode={currentCountryCode}
          isVisible={showOTPPopup}
          onClose={() => setShowOTPPopup(false)}
          onAutoFill={handleAutoFillOTP}
        />
      )}
    </div>
  )
} 