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
    try {
      const status = await apiStatusChecker.checkAPIStatus()
      setApiStatus(status)
    } catch (error: unknown) {
      console.error('Failed to check API status:', error)
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
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-lg mx-auto">
            {/* Enhanced Logo */}
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              {/* Floating particles */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            {/* Enhanced Welcome Message */}
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent ${isDarkMode ? '' : ''}`}>
              Welcome to Gemini Chat!
            </h2>
            
            <p className={`mb-8 text-lg lg:text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Your intelligent AI companion is ready to help
            </p>
            
            {/* Enhanced Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-300' : 'bg-blue-50 border-blue-200 text-gray-700'}`}>
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-sm mb-1">Create Chatrooms</h3>
                <p className="text-xs opacity-75">Organize conversations by topics</p>
              </div>
              
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-300' : 'bg-purple-50 border-purple-200 text-gray-700'}`}>
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-sm mb-1">Smart History</h3>
                <p className="text-xs opacity-75">Each chatroom maintains its own history</p>
              </div>
              
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-300' : 'bg-green-50 border-green-200 text-gray-700'}`}>
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-sm mb-1">Easy Switching</h3>
                <p className="text-xs opacity-75">Switch between different topics seamlessly</p>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/30 border border-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                💡 <strong>Tip:</strong> Select a chatroom from the sidebar to start your conversation with AI
              </p>
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