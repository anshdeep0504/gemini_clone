'use client'

import { Chat } from '@/components/Chat'
import { ChatroomList } from '@/components/ChatroomList'
import { ModelSelector } from '@/components/ModelSelector'
import { Settings } from '@/components/Settings'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuthStore } from '@/lib/auth-store'
import { useChatroomStore } from '@/lib/chatroom-store'
import { useThemeStore } from '@/lib/theme-store'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiMenu, FiSettings } from 'react-icons/fi'

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const { getActiveChatroom } = useChatroomStore()
  const { isDarkMode } = useThemeStore()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/')
    }
  }, [mounted, isAuthenticated, router])

  // Apply theme classes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [isDarkMode])

  const activeChatroom = getActiveChatroom()

  // Show loading while checking auth state
  if (!mounted) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className={`h-screen flex ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen}
        >
          <FiMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:relative inset-y-0 left-0 z-30 w-80 ${isDarkMode ? 'bg-[#2d2d2d] border-gray-700' : 'bg-gray-50 border-gray-200'} border-r flex flex-col transition-transform duration-300 ease-in-out`}>
        {/* Header */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Gemini</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button 
                className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                aria-label="More options"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Model Selector */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <ModelSelector />
        </div>

        {/* Chatroom List */}
        <div className="flex-1 overflow-hidden">
          <ChatroomList />
        </div>

        {/* Settings */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => setSettingsOpen(true)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
            aria-label="Open settings"
          >
            <FiSettings className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 h-full">
        {/* Top Header */}
        <header className={`border-b px-4 lg:px-6 py-3 flex items-center justify-between flex-shrink-0 ${isDarkMode ? 'bg-[#1a1a1a] border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <div className={`text-lg lg:text-xl font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {activeChatroom ? (
                <span>{activeChatroom.name}</span>
              ) : (
                <span className="text-blue-400">Hello, {user?.phone ? `+${user.countryCode} ${user.phone}` : 'User'}! How can I help you today?</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="hidden sm:inline">Upgrade</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.phone ? user.phone.slice(-2) : 'U'}
                </span>
              </div>
              <button
                onClick={logout}
                className={`transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                title="Logout"
                aria-label="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className={`flex-1 overflow-hidden ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
          <Chat />
        </main>
      </div>

      {/* Settings Modal */}
      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
} 