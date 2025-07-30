'use client'

import { useState } from 'react'
import { FiSend, FiCheck, FiX } from 'react-icons/fi'

export function ApiTest() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const testApi = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError('')
    setResponse('')

    try {
      const res = await fetch('/api/test-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      const data = await res.json()

      if (data.success) {
        setResponse(data.response)
      } else {
        setError(data.error || 'Test failed')
      }
    } catch (error: unknown) {
      setError('Network error')
      console.error('API test error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 bg-[#2d2d2d] rounded-lg border border-gray-600">
      <h3 className="text-white font-medium mb-3">API Test</h3>
      
      <div className="space-y-3">
        <div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a test prompt..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && testApi()}
          />
        </div>

        <button
          onClick={testApi}
          disabled={isLoading || !prompt.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <FiSend className="w-4 h-4" />
              Test API
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-600 rounded text-sm text-red-300 flex items-center gap-2">
            <FiX className="w-4 h-4" />
            {error}
          </div>
        )}

        {response && (
          <div className="p-3 bg-green-900/20 border border-green-600 rounded text-sm text-green-300">
            <div className="flex items-center gap-2 mb-2">
              <FiCheck className="w-4 h-4" />
              <span className="font-medium">Response:</span>
            </div>
            <p className="text-green-200">{response}</p>
          </div>
        )}
      </div>
    </div>
  )
} 