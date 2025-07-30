'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiSend, FiPaperclip, FiImage, FiX } from 'react-icons/fi'
import { useState, useRef, useEffect } from 'react'
import { useChatroomStore } from '@/lib/chatroom-store'
import { useChatStore } from '@/lib/store'
import { useThemeStore } from '@/lib/theme-store'
import { generateResponseWithThrottling } from '@/lib/gemini'
import toast from 'react-hot-toast'
import { apiStatusChecker } from '@/lib/api-status'

const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
})

type MessageFormData = z.infer<typeof messageSchema>

export function ChatForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
  })
  
  const { getActiveChatroom } = useChatroomStore()
  const { addMessage, setTyping, getMessages } = useChatStore()
  const { isDarkMode } = useThemeStore()
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false)
  const [isProcessingWithDelay, setIsProcessingWithDelay] = useState(false)
  const [thinkingTime, setThinkingTime] = useState(0)
  const [demoMode, setDemoMode] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const activeChatroom = getActiveChatroom()

  // Check API status for quota exceeded
  const checkAPIStatus = async () => {
    try {
      const status = await apiStatusChecker.checkAPIStatus()
      setIsQuotaExceeded(status.isQuotaExceeded || false)
    } catch (error) {
      console.error('Failed to check API status:', error)
    }
  }

  // Check API status on component mount
  useEffect(() => {
    checkAPIStatus()
  }, [])

  // Demo responses for testing throttling
  const getDemoResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase()
    
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
      return "Hello! I'm here to help you. How can I assist you today?"
    }
    
    if (lowerPrompt.includes('weather')) {
      return "I can't check real-time weather, but you can use weather apps or websites for current conditions."
    }
    
    if (lowerPrompt.includes('code') || lowerPrompt.includes('programming')) {
      return "I can help with programming questions! What language or framework are you working with?"
    }
    
    if (lowerPrompt.includes('explain') || lowerPrompt.includes('what is')) {
      return "I'd be happy to explain that! Could you provide more specific details about what you'd like me to explain?"
    }
    
    return "That's an interesting question! I'd be happy to help you with that. Could you provide more details so I can give you a better answer?"
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setImagePreviewUrls(prev => [...prev, result])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (index: number) => {
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Calculate thinking delay based on message complexity
  const calculateThinkingDelay = (message: string): number => {
    const wordCount = message.split(' ').length
    const hasComplexKeywords = /(explain|analyze|compare|describe|how|why)/i.test(message)
    const hasCodeKeywords = /(code|program|function|class|algorithm)/i.test(message)
    
    let baseDelay = 800 // Base thinking time
    
    // Adjust delay based on message complexity
    if (wordCount > 20) baseDelay += 300
    if (hasComplexKeywords) baseDelay += 400
    if (hasCodeKeywords) baseDelay += 500
    if (isQuotaExceeded) baseDelay += 1000 // Extra delay for quota issues
    
    return Math.min(baseDelay, 3000) // Cap at 3 seconds
  }

  const onSubmit = async (data: MessageFormData) => {
    if (!activeChatroom) {
      toast.error('Please select a chatroom first')
      return
    }

    console.log('📝 Adding message to chatroom:', activeChatroom.id, activeChatroom.name)

    const userMessage = {
      content: data.content,
      role: 'user' as const,
      images: imagePreviewUrls,
    }

    addMessage(activeChatroom.id, userMessage)
    
    // Debug: Check if message was added
    setTimeout(() => {
      const messages = getMessages(activeChatroom.id)
      console.log('✅ Messages after adding user message:', messages.length)
    }, 100)
    
    reset()
    setImagePreviewUrls([])
    setAttachedFiles([])
    setTyping(true)
    setIsProcessingWithDelay(false)

    // Calculate thinking time based on message complexity
    const thinkingDelay = calculateThinkingDelay(data.content)
    setThinkingTime(thinkingDelay)

    try {
      // Show delay message if quota is exceeded
      if (isQuotaExceeded) {
        setIsProcessingWithDelay(true)
        toast.success('Processing with delay due to high demand...')
      }

      let aiResponse: string

      if (demoMode) {
        // Demo mode: simulate throttling with fake response
        console.log('🎭 Demo mode: simulating AI response with throttling...')
        aiResponse = getDemoResponse(data.content)
      } else {
        // Use enhanced throttling with configurable options
        aiResponse = await generateResponseWithThrottling(data.content, {
          enableProgressiveResponse: false, // Can be enabled for long responses
          customThinkingDelay: thinkingDelay,
          maxRetries: 5
        })
      }
      
      const aiMessage = {
        content: aiResponse,
        role: 'assistant' as const,
        images: [],
      }

      addMessage(activeChatroom.id, aiMessage)
      
      // Debug: Check if AI message was added
      setTimeout(() => {
        const messages = getMessages(activeChatroom.id)
        console.log('✅ Messages after adding AI message:', messages.length)
      }, 100)
      
      // Show success message if there was delay
      if (isProcessingWithDelay) {
        toast.success('Response received! (Processed with delay)')
      }
      
    } catch (error: unknown) {
      console.error('Error generating response:', error)
      
      let errorMessage = 'Failed to generate response'
      if ((error as Error).message?.includes('quota') || (error as Error).message?.includes('429')) {
        errorMessage = 'Still processing with delay...'
        toast.loading(errorMessage, { duration: 3000 })
      } else if ((error as Error).message?.includes('overloaded')) {
        errorMessage = 'Processing with delay due to high demand...'
        toast.loading(errorMessage, { duration: 3000 })
      } else if ((error as Error).message?.includes('network')) {
        errorMessage = 'Network error - please check connection'
        toast.error(errorMessage)
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setTyping(false)
      setIsProcessingWithDelay(false)
      setThinkingTime(0)
    }
  }

  return (
    <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700 bg-[#1a1a1a]' : 'border-gray-200 bg-white'}`}>
      {/* Thinking Indicator */}
      {thinkingTime > 0 && (
        <div className="mb-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-400">AI is thinking...</span>
            </div>
            <span className="text-xs text-blue-300">
              ~{(thinkingTime / 1000).toFixed(1)}s
            </span>
          </div>
          <div className="w-full bg-blue-900/30 rounded-full h-1">
            <div 
              className="bg-blue-400 h-1 rounded-full transition-all duration-300 ease-out"
              style={{ width: '60%' }}
            ></div>
          </div>
        </div>
      )}

      {/* Delay Notice */}
      {isProcessingWithDelay && (
        <div className="mb-3 text-center">
          <p className="text-xs text-blue-400">⏰ Processing with delay due to high demand...</p>
        </div>
      )}

      {/* Subtle Quota Notice */}
      {isQuotaExceeded && !isProcessingWithDelay && !thinkingTime && (
        <div className="mb-3 text-center">
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>⏰ Responses may be delayed due to API quota limits</p>
        </div>
      )}

      {/* Image Previews */}
      {imagePreviewUrls.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {imagePreviewUrls.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className={`w-16 h-16 object-cover rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label={`Remove image ${index + 1}`}
              >
                <FiX className="w-2 h-2" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Attached Files */}
      {attachedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-red-400 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label={`Remove file ${file.name}`}
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
        <div className="relative">
          <textarea
            {...register('content')}
            placeholder={activeChatroom ? "Ask Gemini..." : "Select a chatroom to start chatting..."}
            disabled={!activeChatroom}
            className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(onSubmit)()
              }
              if (e.key === 'Escape') {
                e.currentTarget.blur()
              }
            }}
            aria-label="Message input"
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-400">{errors.content.message}</p>
          )}
        </div>

        {/* Send Button and Input Options */}
        <div className="mt-4 flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Demo Mode Toggle */}
            <button
              type="button"
              onClick={() => setDemoMode(!demoMode)}
              className={`flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                demoMode 
                  ? 'text-yellow-400 hover:text-yellow-300' 
                  : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
              title={demoMode ? 'Disable demo mode' : 'Enable demo mode to test throttling'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm">{demoMode ? 'Demo Mode' : 'Demo'}</span>
            </button>

            <button
              type="button"
              className={`flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
              title="Deep Research"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm">Deep Research</span>
            </button>
            
            <button
              type="button"
              className={`flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
              title="Canvas"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="text-sm">Canvas</span>
            </button>
            
            <button
              type="button"
              className={`flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
              title="Image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">Image</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* File Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
              accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              aria-label="Attach files"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'}`}
              title="Attach files"
              aria-label="Attach files"
            >
              <FiPaperclip className="w-5 h-5" />
            </button>

            {/* Image Upload */}
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
              multiple
              aria-label="Attach images"
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'}`}
              title="Attach images"
              aria-label="Attach images"
            >
              <FiImage className="w-5 h-5" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isSubmitting || !activeChatroom}
              className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Send message"
              aria-label="Send message"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  )
} 