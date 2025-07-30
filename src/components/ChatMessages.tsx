'use client'

import { useChatStore } from '@/lib/store'
import { useChatroomStore } from '@/lib/chatroom-store'
import { useThemeStore } from '@/lib/theme-store'
import { FiUser, FiMessageCircle, FiCopy, FiCheck, FiTrash2, FiChevronDown } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import toast from 'react-hot-toast'
import { ChatSkeleton } from './MessageSkeleton'

export function ChatMessages(): React.JSX.Element {
  const { 
    isLoading, 
    isTyping, 
    hasMoreMessages, 
    loadMoreMessages,
    deleteMessage,
    getMessages,
    autoScrollEnabled,
    setAutoScroll,
    setScrollPosition
  } = useChatStore()
  
  const { getActiveChatroom } = useChatroomStore()
  const { isDarkMode } = useThemeStore()
  const activeChatroom = getActiveChatroom()
  
  // Get messages for the active chatroom
  const messages = activeChatroom ? getMessages(activeChatroom.id) : []
  
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showScrollBottom, setShowScrollBottom] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null)
  const [lastScrollTop, setLastScrollTop] = useState(0)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  // Enhanced auto-scroll with smart detection
  const scrollToBottomFn = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior })
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom)
  useEffect(() => {
    if (autoScrollEnabled && isNearBottom && messages.length > 0) {
      scrollToBottomFn('smooth')
    }
  }, [messages, isLoading, isTyping, autoScrollEnabled, isNearBottom, scrollToBottomFn])

  // Enhanced scroll handler with better detection
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || !activeChatroom) return

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const scrollBottom = scrollTop + clientHeight
    const threshold = 100 // pixels from bottom
    
    // Save scroll position
    setScrollPosition(activeChatroom.id, scrollTop)
    
    // Check if user is near bottom
    const nearBottom = scrollHeight - scrollBottom < threshold
    setIsNearBottom(nearBottom)
    
    // Show/hide scroll buttons
    setShowScrollBottom(scrollTop < scrollHeight - clientHeight - 200)
    
    // Disable auto-scroll if user scrolls up
    if (scrollTop < lastScrollTop && autoScrollEnabled) {
      setAutoScroll(false)
    }
    
    // Re-enable auto-scroll if user scrolls to bottom
    if (nearBottom && !autoScrollEnabled) {
      setAutoScroll(true)
    }
    
    setLastScrollTop(scrollTop)

    // Load more messages when near the top (reverse infinite scroll)
    if (scrollTop < 150 && hasMoreMessages && !isLoading && !isLoadingMessages) {
      setIsLoadingMessages(true)
      loadMoreMessages(activeChatroom.id)
      setTimeout(() => setIsLoadingMessages(false), 800)
    }
  }, [hasMoreMessages, isLoading, loadMoreMessages, isLoadingMessages, activeChatroom, autoScrollEnabled, setAutoScroll, setScrollPosition, lastScrollTop])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Reset scroll position when switching chatrooms
  useEffect(() => {
    if (activeChatroom && messages.length > 0) {
      // Scroll to bottom for new chatrooms, or restore position for existing ones
      const savedPosition = useChatStore.getState().scrollPosition[activeChatroom.id]
      if (savedPosition && savedPosition > 0) {
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = savedPosition
          }
        }, 100)
      } else {
        scrollToBottomFn('auto')
      }
    }
  }, [activeChatroom?.id, scrollToBottomFn])

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(messageId)
      toast.success('Message copied to clipboard!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err: unknown) {
      console.error('Failed to copy text: ', err)
      toast.error('Failed to copy message')
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!activeChatroom) return
    
    if (confirm('Are you sure you want to delete this message?')) {
      setDeletingMessage(messageId)
      try {
        deleteMessage(activeChatroom.id, messageId)
        toast.success('Message deleted!')
      } catch (error: unknown) {
        toast.error('Failed to delete message')
      } finally {
        setDeletingMessage(null)
      }
    }
  }

  const handleScrollToBottom = () => {
    scrollToBottomFn('smooth')
    setAutoScroll(true)
  }

  const formatTimestamp = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const renderImage = (imageUrl: string, index: number) => (
    <div key={index} className="mt-2">
      <img
        src={imageUrl}
        alt={`Image ${index + 1}`}
        className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => window.open(imageUrl, '_blank')}
        loading="lazy"
      />
    </div>
  )

  // Show loading skeleton if no messages and loading
  if (messages.length === 0 && isLoading) {
    return (
      <div className="flex-1 flex flex-col relative h-full">
        <div className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-4 lg:space-y-6 scroll-smooth min-h-0">
          <ChatSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleScrollToBottom}
            className={`absolute bottom-20 right-4 z-10 p-2 rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
            title="Scroll to bottom"
            aria-label="Scroll to bottom"
          >
            <FiChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Messages container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-4 lg:space-y-6 scroll-smooth min-h-0"
        id="chat-messages"
        style={{ height: '100%' }}
      >
        {/* Load more indicator */}
        {isLoadingMessages && hasMoreMessages && (
          <div className="flex justify-center py-4">
            <div className={`flex items-center gap-2 rounded-lg px-4 py-2 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200/50'}`}>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading older messages...</span>
            </div>
          </div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4 lg:space-y-6"
        >
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`flex gap-2 lg:gap-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-2 lg:gap-4 max-w-full lg:max-w-4xl ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                        : 'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-300'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <FiUser className="w-3 h-3 lg:w-4 lg:h-4" />
                    ) : (
                      <FiMessageCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`flex-1 ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block max-w-full ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl rounded-br-md'
                          : `${isDarkMode ? 'bg-[#2d2d2d] text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'} border rounded-2xl rounded-bl-md`
                      }`}
                    >
                      <div className="relative group">
                        <div className="p-3 lg:p-4">
                          {/* Message text */}
                          {message.role === 'assistant' ? (
                            <div className={`prose max-w-none prose-sm lg:prose-base ${isDarkMode ? 'prose-invert' : ''}`}>
                              <ReactMarkdown
                                components={{
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  code({ inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    return !inline && match ? (
                                      <div className="relative">
                                        <SyntaxHighlighter
                                          style={tomorrow}
                                          language={match[1]}
                                          PreTag="div"
                                          className="rounded-lg text-xs lg:text-sm"
                                        >
                                          {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                        <button
                                          onClick={() => copyToClipboard(String(children), message.id)}
                                          className={`absolute top-1 right-1 lg:top-2 lg:right-2 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800'}`}
                                          title="Copy code"
                                          aria-label="Copy code"
                                        >
                                          {copiedId === message.id ? (
                                            <FiCheck className="w-2 h-2 lg:w-3 lg:h-3" />
                                          ) : (
                                            <FiCopy className="w-2 h-2 lg:w-3 lg:h-3" />
                                          )}
                                        </button>
                                      </div>
                                    ) : (
                                      <code className={`px-1 py-0.5 rounded text-xs lg:text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} {...props}>
                                        {children}
                                      </code>
                                    )
                                  },
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  p: ({ children }: any) => <p className="mb-2 lg:mb-3 last:mb-0 text-sm lg:text-base">{children}</p>,
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  ul: ({ children }: any) => <ul className="list-disc list-inside mb-2 lg:mb-3 space-y-1 text-sm lg:text-base">{children}</ul>,
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  ol: ({ children }: any) => <ol className="list-decimal list-inside mb-2 lg:mb-3 space-y-1 text-sm lg:text-base">{children}</ol>,
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  li: ({ children }: any) => <li className="text-sm lg:text-base">{children}</li>,
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  blockquote: ({ children }: any) => (
                                    <blockquote className={`border-l-4 pl-3 lg:pl-4 italic mb-2 lg:mb-3 text-sm lg:text-base ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-400 text-gray-600'}`}>
                                      {children}
                                    </blockquote>
                                  ),
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  h1: ({ children }: any) => <h1 className="text-lg lg:text-xl font-bold mb-2 lg:mb-3">{children}</h1>,
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  h2: ({ children }: any) => <h2 className="text-base lg:text-lg font-bold mb-2">{children}</h2>,
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  h3: ({ children }: any) => <h3 className="text-sm lg:text-base font-bold mb-2">{children}</h3>,
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm lg:text-base whitespace-pre-wrap">{message.content}</p>
                          )}

                          {/* Images */}
                          {message.images && message.images.length > 0 && (
                            <div className="mt-3">
                              {message.images.map((image, index) => renderImage(image, index))}
                            </div>
                          )}
                        </div>
                        
                        {/* Action buttons */}
                        <div className="absolute top-1 right-1 lg:top-2 lg:right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className={`p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-black/20 hover:bg-black/30 text-white/70 hover:text-white' : 'bg-white/20 hover:bg-white/30 text-gray-600 hover:text-gray-800'}`}
                            title="Copy message"
                            aria-label="Copy message"
                          >
                            {copiedId === message.id ? (
                              <FiCheck className="w-2 h-2 lg:w-3 lg:h-3" />
                            ) : (
                              <FiCopy className="w-2 h-2 lg:w-3 lg:h-3" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            disabled={deletingMessage === message.id}
                            className="p-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-300 hover:text-red-200 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                            title="Delete message"
                            aria-label="Delete message"
                          >
                            <FiTrash2 className="w-2 h-2 lg:w-3 lg:h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Timestamp */}
                    <div
                      className={`text-xs mt-1 lg:mt-2 ${
                        message.role === 'user' ? 'text-right' : 'text-left'
                      } ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-2 lg:gap-4">
              <div className="flex-shrink-0 w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 text-gray-300 flex items-center justify-center">
                <FiMessageCircle className="w-3 h-3 lg:w-4 lg:h-4" />
              </div>
              <div className={`border rounded-2xl rounded-bl-md p-3 lg:p-4 ${isDarkMode ? 'bg-[#2d2d2d] border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gemini is typing...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Invisible div for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
} 