'use client'

import { FiSun, FiMoon } from 'react-icons/fi'
import { useThemeStore } from '@/lib/theme-store'
import { useEffect } from 'react'

export function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useThemeStore()

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [isDarkMode])

  const handleToggle = () => {
    toggleTheme()
    console.log('Theme toggled to:', !isDarkMode ? 'light' : 'dark')
  }

  return (
    <button
      onClick={handleToggle}
      className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <FiSun className="w-5 h-5" />
      ) : (
        <FiMoon className="w-5 h-5" />
      )}
    </button>
  )
} 