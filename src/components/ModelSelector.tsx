'use client'

import { useState } from 'react'
import { useThemeStore } from '@/lib/theme-store'

interface Model {
  id: string
  name: string
  description: string
  isPro: boolean
}

const models: Model[] = [
  {
    id: 'gemini-1.5-flash',
    name: '1.5 Flash',
    description: 'Fast and efficient for most tasks',
    isPro: false
  },
  {
    id: 'gemini-1.5-pro',
    name: '1.5 Pro',
    description: 'Most capable model for complex tasks',
    isPro: true
  },
  {
    id: 'gemini-2.0-flash',
    name: '2.0 Flash',
    description: 'Latest fast model',
    isPro: false
  }
]

export function ModelSelector(): React.JSX.Element {
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash')
  const [isOpen, setIsOpen] = useState(false)
  const { isDarkMode } = useThemeStore()

  const currentModel = models.find(model => model.id === selectedModel)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="text-left">
            <div className="text-sm font-medium">{currentModel?.name}</div>
          </div>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-10 ${
          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
        }`}>
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModel(model.id)
                setIsOpen(false)
              }}
              className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
                selectedModel === model.id 
                  ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')
                  : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{model.name}</span>
                {model.isPro && (
                  <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-xs text-white rounded-full">
                    PRO
                  </span>
                )}
              </div>
              {selectedModel === model.id && (
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 