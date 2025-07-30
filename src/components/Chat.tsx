'use client'

import { ChatForm } from './ChatForm'
import { ChatMessages } from './ChatMessages'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { useChatroomStore } from '@/lib/chatroom-store'
import { apiStatusChecker, type APIStatus } from '@/lib/api-status'
import { useThemeStore } from '@/lib/theme-store'

export function Chat(): React.JSX.Element {
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'valid' | 'invalid' | 'missing'>('checking')
  const [apiStatus, setApiStatus] = useState<APIStatus | null>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const { getActiveChatroom } = useChatroomStore()
  const { isDarkMode } = useThemeStore()
  const activeChatroom = getActiveChatroom()

  const checkApiKey = () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      const localKey = localStorage.getItem('gemini_api_key')
      if (!localKey) {
        setApiKeyStatus('missing')
        return
      }
    }
    setApiKeyStatus('valid')
  }

  const checkAPIStatus = async () => {
    setIsCheckingStatus(true)
    try {
      const status = await apiStatusChecker.checkAPIStatus()
      setApiStatus(status)
    } catch (error) {
      console.error('Failed to check API status:', error)
    } finally {
      setIsCheckingStatus(false)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkApiKey()
      checkAPIStatus()
      
      // Start periodic status checks
      apiStatusChecker.startPeriodicCheck(30000) // Check every 30 seconds
      
      return () => {
        apiStatusChecker.stopPeriodicCheck()
      }
    }
  }, [])

  const handleRetry = async () => {
    await checkAPIStatus()
  }

  return (
    <div className="flex flex-col h-full">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDarkMode ? '#2d2d2d' : '#ffffff',
            color: isDarkMode ? '#fff' : '#1f2937',
            border: isDarkMode ? '1px solid #404040' : '1px solid #e5e7eb',
          },
        }}
      />
      
      {/* Subtle API Status Bar - Only show when there are issues */}
      {(apiKeyStatus === 'missing' || apiStatus?.isQuotaExceeded || apiStatus?.isOverloaded || (apiStatus && !apiStatus.isAvailable && !apiStatus.isOverloaded && !apiStatus.isQuotaExceeded)) && (
        <div className={`px-4 py-2 bg-gradient-to-r ${isDarkMode ? 'from-gray-800 to-gray-700 border-gray-600' : 'from-gray-100 to-gray-200 border-gray-300'} border-b`}>
          <div className={`flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <div className="flex items-center gap-2">
              {apiKeyStatus === 'missing' && (
                <>
                  <span className="text-yellow-400">⚠️</span>
                  <span>API key not configured</span>
                </>
              )}
              
              {apiStatus?.isOverloaded && (
                <>
                  <span className="text-orange-400">🔄</span>
                  <span>API overloaded - responses delayed</span>
                </>
              )}
              {apiStatus && !apiStatus.isAvailable && !apiStatus.isOverloaded && !apiStatus.isQuotaExceeded && (
                <>
                  <span className="text-red-400">❌</span>
                  <span>API unavailable</span>
                </>
              )}
            </div>
          
          </div>
        </div>
      )}

      {/* No Active Chatroom Message */}
      {!activeChatroom && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Welcome to Gemini Chat!</h2>
            <p className={`mb-6 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Select a chatroom from the sidebar to start chatting with AI</p>
            <div className={`text-sm space-y-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Create new chatrooms to organize conversations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Each chatroom maintains its own history</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Switch between chatrooms for different topics</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Interface */}
      {activeChatroom && (
        <>
          <div className="flex-1 overflow-hidden">
            <ChatMessages />
          </div>
          
          <div className={`border-t ${isDarkMode ? 'border-gray-700 bg-[#1a1a1a]' : 'border-gray-200 bg-white'}`}>
            <ChatForm />
          </div>
        </>
      )}
    </div>
  )
} 