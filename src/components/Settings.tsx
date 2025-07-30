'use client'

import { useState, useEffect } from 'react'
import { initializeGeminiAPI, isGeminiConfigured } from '@/lib/gemini-api'
import { useThemeStore } from '@/lib/theme-store'
import { FiSettings, FiKey, FiCheck, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { isDarkMode } = useThemeStore()

  // Load saved API key on mount
  useEffect(() => {
    // First try to get from environment variable
    const envApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    const savedKey = localStorage.getItem('gemini_api_key')
    
    // Use environment variable if available, otherwise use localStorage
    const keyToUse = envApiKey || savedKey
    
    if (keyToUse) {
      setApiKey(keyToUse)
      // Initialize the API with the key
      try {
        initializeGeminiAPI(keyToUse)
        if (envApiKey) {
          console.log('✅ Using API key from environment variable')
        } else {
          console.log('✅ Using API key from localStorage')
        }
      } catch (error) {
        console.error('Failed to initialize with API key:', error)
      }
    }
  }, [])

  const handleSaveAPIKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key')
      return
    }

    setIsLoading(true)
    try {
      // Test the API key
      initializeGeminiAPI(apiKey.trim())
      
      // Save to localStorage (only if not using environment variable)
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        localStorage.setItem('gemini_api_key', apiKey.trim())
      }
      
      toast.success('API key saved successfully!')
      onClose()
    } catch (error) {
      toast.error('Invalid API key. Please check and try again.')
      console.error('API key test failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveAPIKey = () => {
    localStorage.removeItem('gemini_api_key')
    setApiKey('')
    toast.success('API key removed')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg p-6 w-full max-w-md ${isDarkMode ? 'bg-[#2d2d2d]' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FiSettings className="w-6 h-6 text-blue-500" />
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
          </div>
          <button
            onClick={onClose}
            className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* API Key Configuration */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Gemini API Key
            </label>
            <div className="relative">
              <FiKey className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-[#1a1a1a] border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              Get your API key from{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Google AI Studio
              </a>
            </p>
            {process.env.NEXT_PUBLIC_GEMINI_API_KEY && (
              <p className="text-xs text-green-400 mt-1">
                ✅ Using API key from environment variable
              </p>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isGeminiConfigured() ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {isGeminiConfigured() ? 'API configured' : 'API not configured'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveAPIKey}
              disabled={isLoading || !apiKey.trim()}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  Save API Key
                </>
              )}
            </button>
            
            {isGeminiConfigured() && !process.env.NEXT_PUBLIC_GEMINI_API_KEY && (
              <button
                onClick={handleRemoveAPIKey}
                className="px-4 py-3 text-red-400 hover:text-red-300 border border-red-400 hover:border-red-300 rounded-lg transition-colors"
              >
                Remove
              </button>
            )}
          </div>

          {/* Info */}
          <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
            <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>How to get your API key:</h3>
            <ol className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <li>1. Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Google AI Studio</a></li>
              <li>2. Sign in with your Google account</li>
              <li>3. Click &quot;Create API Key&quot;</li>
              <li>4. Copy the generated key and paste it above</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
} 