'use client'

import { useState, useEffect } from 'react'
import { FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi'

export function ApiKeyStatus(): React.JSX.Element {
  const [isTesting, setIsTesting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const testApiKey = async () => {
    setIsTesting(true)
    setStatus('idle')
    setErrorMessage('')

    try {
      // Dynamic import to avoid SSR issues
      const { generateResponse } = await import('@/lib/gemini')
      await generateResponse('Hello')
      setStatus('success')
    } catch (error: any) {
      setStatus('error')
      setErrorMessage(error.message)
    } finally {
      setIsTesting(false)
    }
  }

  // Check if API key is available on mount (client-side only)
  useEffect(() => {
    const checkApiKey = () => {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!apiKey) {
        setStatus('error')
        setErrorMessage('API key not found in environment variables')
      }
    }
    
    // Only check on client side
    if (typeof window !== 'undefined') {
      checkApiKey()
    }
  }, [])

  return (
    <div className="p-4 bg-[#2d2d2d] rounded-lg border border-gray-600 mb-4">
      <h3 className="text-white font-medium mb-2">API Key Status</h3>
      
      <div className="flex items-center gap-2 mb-3">
        {status === 'idle' && <FiAlertCircle className="w-4 h-4 text-yellow-400" />}
        {status === 'success' && <FiCheckCircle className="w-4 h-4 text-green-400" />}
        {status === 'error' && <FiXCircle className="w-4 h-4 text-red-400" />}
        
        <span className="text-sm text-gray-300">
          {status === 'idle' && 'API key not tested'}
          {status === 'success' && 'API key is valid'}
          {status === 'error' && 'API key error'}
        </span>
      </div>

      {status === 'error' && (
        <div className="mb-3 p-3 bg-red-900/20 border border-red-600 rounded text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={testApiKey}
          disabled={isTesting}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Test API Key'}
        </button>
        
        <div className="text-xs text-gray-400">
          <p>To get a valid API key:</p>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener" className="text-blue-400 hover:underline">Google AI Studio</a></li>
            <li>Create a new API key</li>
            <li>Update your .env.local file</li>
            <li>Restart the development server</li>
          </ol>
          <p className="mt-2 text-yellow-400">
            💡 The app will work in mock mode until you configure a valid API key
          </p>
        </div>
      </div>
    </div>
  )
} 