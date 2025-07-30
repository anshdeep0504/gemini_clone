'use client'

import { useState } from 'react'

interface Conversation {
  id: string
  title: string
  timestamp: Date
  messageCount: number
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'How to build a React app',
    timestamp: new Date('2024-01-15T10:30:00'), // Fixed timestamp
    messageCount: 8
  },
  {
    id: '2',
    title: 'Python data analysis tips',
    timestamp: new Date('2024-01-15T08:00:00'), // Fixed timestamp
    messageCount: 12
  },
  {
    id: '3',
    title: 'CSS Grid vs Flexbox',
    timestamp: new Date('2024-01-14T15:30:00'), // Fixed timestamp
    messageCount: 6
  },
  {
    id: '4',
    title: 'Machine learning basics',
    timestamp: new Date('2024-01-13T09:15:00'), // Fixed timestamp
    messageCount: 15
  }
]

export function ConversationHistory(): React.JSX.Element {
  const [conversations] = useState<Conversation[]>(mockConversations)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const formatTimestamp = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  }

  return (
    <div className="p-2 lg:p-4">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h3 className="text-xs lg:text-sm font-medium text-gray-300">Recent conversations</h3>
        <button className="text-xs text-gray-400 hover:text-white transition-colors">
          Clear all
        </button>
      </div>
      
      <div className="space-y-1 lg:space-y-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => setSelectedId(conversation.id)}
            className={`w-full text-left p-2 lg:p-3 rounded-lg transition-colors ${
              selectedId === conversation.id
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 lg:gap-2 mb-1">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h4 className="text-xs lg:text-sm font-medium truncate">{conversation.title}</h4>
                </div>
                <div className="flex items-center gap-1.5 lg:gap-2 text-xs text-gray-400">
                  <span>{conversation.messageCount} messages</span>
                  <span>•</span>
                  <span>{formatTimestamp(conversation.timestamp)}</span>
                </div>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle delete conversation
                }}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    // Handle delete conversation
                  }
                }}
              >
                <svg className="w-2.5 h-2.5 lg:w-3 lg:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {conversations.length === 0 && (
        <div className="text-center py-6 lg:py-8">
          <svg className="w-8 h-8 lg:w-12 lg:h-12 text-gray-500 mx-auto mb-3 lg:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-xs lg:text-sm text-gray-400">No conversations yet</p>
          <p className="text-xs text-gray-500 mt-1">Start a new chat to see it here</p>
        </div>
      )}
    </div>
  )
} 