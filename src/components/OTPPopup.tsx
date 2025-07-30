'use client'

import { useEffect, useState } from 'react'
import { FiX, FiCopy, FiCheck, FiShield } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface OTPPopupProps {
  otp: string
  phone: string
  countryCode: string
  isVisible: boolean
  onClose: () => void
  onAutoFill?: (otp: string) => void
}

export function OTPPopup({ otp, phone, countryCode, isVisible, onClose, onAutoFill }: OTPPopupProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(otp)
      setCopied(true)
      toast.success('Code copied!')
      
      // Auto-fill the form if callback is provided
      if (onAutoFill) {
        onAutoFill(otp)
      }
      
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

  useEffect(() => {
    if (isVisible) {
      // Auto-hide after 5 minutes
      const timer = setTimeout(() => {
        onClose()
      }, 5 * 60 * 1000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FiShield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-white font-semibold text-lg">Verification Code</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {countryCode} {phone}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* OTP Display */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
                {otp}
              </span>
              <button
                onClick={copyToClipboard}
                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg transition-colors"
                title="Copy code"
              >
                {copied ? <FiCheck className="w-4 h-4 text-green-500" /> : <FiCopy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Simple Info */}
        <div className="text-center mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Demo code • Valid for 10 minutes
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={copyToClipboard}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <FiCopy className="w-4 h-4" />
          Copy & Continue
        </button>
      </div>
    </div>
  )
} 