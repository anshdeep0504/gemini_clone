'use client'

import { useState } from 'react'
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi'

export function ApiTest(): React.JSX.Element {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const testApi = async () => {
    setStatus('testing')
    setMessage('')

    try {
      // Dynamic import to avoid SSR issues
      const { generateResponse } = await import('@/lib/gemini')
      const response = await generateResponse('Hello, please respond with "API is working!"')
      
      if (response.includes('API is working')) {
        setStatus('success')
        setMessage('✅ API is working! You can now send real messages.')
      } else {
        setStatus('success')
        setMessage('✅ API is working! Response: ' + response.substring(0, 100) + '...')
      }
    } catch (error: any) {
      setStatus('error')
      setMessage('❌ API Error: ' + error.message)
    }
  }

  return (
    <div className="p-4 bg-[#2d2d2d] rounded-lg border border-gray-600 mb-4">
      <h3 className="text-white font-medium mb-2">API Connection Test</h3>
      
      <div className="flex items-center gap-2 mb-3">
        {status === 'idle' && <FiLoader className="w-4 h-4 text-gray-400" />}
        {status === 'testing' && <FiLoader className="w-4 h-4 text-blue-400 animate-spin" />}
        {status === 'success' && <FiCheckCircle className="w-4 h-4 text-green-400" />}
        {status === 'error' && <FiXCircle className="w-4 h-4 text-red-400" />}
        
        <span className="text-sm text-gray-300">
          {status === 'idle' && 'Ready to test API'}
          {status === 'testing' && 'Testing API connection...'}
          {status === 'success' && 'API is working!'}
          {status === 'error' && 'API test failed'}
        </span>
      </div>

      {message && (
        <div className={`mb-3 p-3 rounded text-sm ${
          status === 'success' 
            ? 'bg-green-900/20 border border-green-600 text-green-300'
            : 'bg-red-900/20 border border-red-600 text-red-300'
        }`}>
          {message}
        </div>
      )}

      <button
        onClick={testApi}
        disabled={status === 'testing'}
        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
      >
        {status === 'testing' ? 'Testing...' : 'Test API Connection'}
      </button>
    </div>
  )
} 