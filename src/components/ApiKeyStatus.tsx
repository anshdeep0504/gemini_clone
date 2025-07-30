'use client'

import { useState, useEffect } from 'react'
import { apiStatusChecker, type APIStatus } from '@/lib/api-status'

export function ApiKeyStatus() {
  const [apiStatus, setApiStatus] = useState<APIStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkAPIStatus = async () => {
    setIsLoading(true)
    try {
      const status = await apiStatusChecker.checkAPIStatus()
      setApiStatus(status)
    } catch (error: unknown) {
      console.error('Failed to check API status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAPIStatus()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        Checking API status...
      </div>
    )
  }

  if (!apiStatus) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        API status unknown
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${
        apiStatus.isAvailable ? 'bg-green-500' : 'bg-red-500'
      }`} />
      <span className={apiStatus.isAvailable ? 'text-green-400' : 'text-red-400'}>
        {apiStatus.isAvailable ? 'API Available' : 'API Unavailable'}
      </span>
    </div>
  )
} 