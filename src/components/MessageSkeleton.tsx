'use client'

import { FiUser, FiMessageCircle } from 'react-icons/fi'

interface MessageSkeletonProps {
  role: 'user' | 'assistant'
  lines?: number
}

export function MessageSkeleton({ role, lines = 3 }: MessageSkeletonProps) {
  return (
    <div className={`flex gap-2 lg:gap-4 ${
      role === 'user' ? 'justify-end' : 'justify-start'
    }`}>
      <div
        className={`flex gap-2 lg:gap-4 max-w-full lg:max-w-4xl ${
          role === 'user' ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center ${
            role === 'user'
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
              : 'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-300'
          }`}
        >
          {role === 'user' ? (
            <FiUser className="w-3 h-3 lg:w-4 lg:h-4" />
          ) : (
            <FiMessageCircle className="w-3 h-3 lg:w-4 lg:h-4" />
          )}
        </div>

        {/* Message Content */}
        <div
          className={`flex-1 ${
            role === 'user' ? 'text-right' : 'text-left'
          }`}
        >
          <div
            className={`inline-block max-w-full ${
              role === 'user'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl rounded-br-md'
                : 'bg-[#2d2d2d] text-gray-200 border border-gray-600 rounded-2xl rounded-bl-md'
            }`}
          >
            <div className="p-3 lg:p-4">
              <div className="space-y-2">
                {Array.from({ length: lines }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-3 bg-gray-600 rounded animate-pulse ${
                      index === lines - 1 ? 'w-3/4' : 'w-full'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Timestamp skeleton */}
          <div
            className={`text-xs text-gray-400 mt-1 lg:mt-2 ${
              role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div className="h-2 w-12 bg-gray-600 rounded animate-pulse inline-block" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <MessageSkeleton role="user" lines={1} />
      <MessageSkeleton role="assistant" lines={3} />
      <MessageSkeleton role="user" lines={2} />
      <MessageSkeleton role="assistant" lines={4} />
      <MessageSkeleton role="user" lines={1} />
    </div>
  )
} 