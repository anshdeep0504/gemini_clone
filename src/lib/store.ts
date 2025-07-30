import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  images?: string[] // Base64 or URLs
  isTyping?: boolean
}

export interface ChatStore {
  messagesByChatroom: Record<string, Message[]>
  isLoading: boolean
  isTyping: boolean
  currentPage: number
  hasMoreMessages: boolean
  messagesPerPage: number
  autoScrollEnabled: boolean
  scrollPosition: Record<string, number> // Track scroll position per chatroom
  totalPages: number // Fixed to 4 pages
  
  // Actions
  addMessage: (chatroomId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  setLoading: (loading: boolean) => void
  setTyping: (typing: boolean) => void
  clearMessages: (chatroomId: string) => void
  loadMoreMessages: (chatroomId: string) => void
  addImageToMessage: (chatroomId: string, messageId: string, imageUrl: string) => void
  updateMessage: (chatroomId: string, messageId: string, updates: Partial<Message>) => void
  deleteMessage: (chatroomId: string, messageId: string) => void
  getMessages: (chatroomId: string, page?: number) => Message[]
  setAutoScroll: (enabled: boolean) => void
  setScrollPosition: (chatroomId: string, position: number) => void
  getPaginatedMessages: (chatroomId: string, page: number) => Message[]
  getTotalPages: (chatroomId: string) => number
  setCurrentPage: (page: number) => void
  generateDummyMessages: (chatroomId: string) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messagesByChatroom: {},
      isLoading: false,
      isTyping: false,
      currentPage: 1,
      hasMoreMessages: true,
      messagesPerPage: 20,
      autoScrollEnabled: true,
      scrollPosition: {},
      totalPages: 4, // Fixed to 4 pages

      addMessage: (chatroomId, message) => {
        const state = get()
        const newMessage = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        }
        
        set((state) => ({
          messagesByChatroom: {
            ...state.messagesByChatroom,
            [chatroomId]: [
              ...(state.messagesByChatroom[chatroomId] || []),
              newMessage,
            ],
          },
          // Enable auto-scroll when new message is added
          autoScrollEnabled: true,
        }))
      },

      setLoading: (loading) => set({ isLoading: loading }),
      
      setTyping: (typing) => set({ isTyping: typing }),

      clearMessages: (chatroomId) => 
        set((state) => ({
          messagesByChatroom: {
            ...state.messagesByChatroom,
            [chatroomId]: []
          },
          currentPage: 1, 
          hasMoreMessages: true,
          scrollPosition: {
            ...state.scrollPosition,
            [chatroomId]: 0
          }
        })),

      loadMoreMessages: (chatroomId) => {
        const state = get()
        if (!state.hasMoreMessages || state.isLoading) return

        set((state) => ({
          isLoading: true,
          currentPage: state.currentPage + 1,
        }))

        // Simulate loading older messages with more realistic data
        setTimeout(() => {
          const currentMessages = state.messagesByChatroom[chatroomId] || []
          const page = state.currentPage
          
          // Generate more realistic dummy messages
          const dummyMessages: Message[] = Array.from({ length: 10 }, (_, i) => {
            const messageIndex = (page - 1) * 10 + i
            const isUser = messageIndex % 2 === 0
            const content = isUser 
              ? `User message ${messageIndex + 1} - This is a longer message to simulate real conversation content.`
              : `AI response ${messageIndex + 1} - Here's a detailed response that might include code, explanations, or other content that would be typical in a conversation with an AI assistant.`
            
            return {
              id: `old-${Date.now()}-${messageIndex}`,
              content,
              role: isUser ? 'user' : 'assistant',
              timestamp: new Date(Date.now() - (messageIndex + 1) * 60000), // 1 minute apart
            }
          })

          set((state) => ({
            messagesByChatroom: {
              ...state.messagesByChatroom,
              [chatroomId]: [
                ...dummyMessages,
                ...currentMessages
              ]
            },
            isLoading: false,
            hasMoreMessages: page < 10, // Limit to 10 pages for demo
          }))
        }, 800) // Slightly faster loading
      },

      // Generate initial dummy messages for demonstration
      generateDummyMessages: (chatroomId: string) => {
        const state = get()
        const currentMessages = state.messagesByChatroom[chatroomId] || []
        
        // Generate 40 dummy messages to ensure 4 pages (10 messages per page)
        const dummyMessages: Message[] = Array.from({ length: 40 }, (_, i) => {
          const isUser = i % 2 === 0
          const content = isUser 
            ? `Demo user message ${i + 1} - This is a sample message to demonstrate the 4-page pagination system.`
            : `Demo AI response ${i + 1} - This is a sample AI response that shows how the pagination works across multiple pages.`
          
          return {
            id: `demo-${Date.now()}-${i}`,
            content,
            role: isUser ? 'user' : 'assistant',
            timestamp: new Date(Date.now() - (40 - i) * 60000), // 1 minute apart, newest first
          }
        })

        set((state) => ({
          messagesByChatroom: {
            ...state.messagesByChatroom,
            [chatroomId]: [
              ...dummyMessages,
              ...currentMessages
            ]
          },
          currentPage: 1,
          hasMoreMessages: false, // No more loading since we have 4 pages
        }))
      },

      addImageToMessage: (chatroomId, messageId, imageUrl) =>
        set((state) => ({
          messagesByChatroom: {
            ...state.messagesByChatroom,
            [chatroomId]: (state.messagesByChatroom[chatroomId] || []).map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    images: [...(msg.images || []), imageUrl],
                  }
                : msg
            ),
          },
        })),

      updateMessage: (chatroomId, messageId, updates) =>
        set((state) => ({
          messagesByChatroom: {
            ...state.messagesByChatroom,
            [chatroomId]: (state.messagesByChatroom[chatroomId] || []).map((msg) =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
          },
        })),

      deleteMessage: (chatroomId, messageId) =>
        set((state) => ({
          messagesByChatroom: {
            ...state.messagesByChatroom,
            [chatroomId]: (state.messagesByChatroom[chatroomId] || []).filter((msg) => msg.id !== messageId),
          },
        })),

      getMessages: (chatroomId) => {
        const state = get()
        return state.messagesByChatroom[chatroomId] || []
      },

      setAutoScroll: (enabled) => set({ autoScrollEnabled: enabled }),

      setScrollPosition: (chatroomId, position) => 
        set((state) => ({
          scrollPosition: {
            ...state.scrollPosition,
            [chatroomId]: position
          }
        })),

      getPaginatedMessages: (chatroomId, page) => {
        const state = get()
        const messages = state.messagesByChatroom[chatroomId] || []
        const totalMessages = messages.length
        
        // Always divide into 4 pages
        const messagesPerPage = Math.ceil(totalMessages / 4)
        const startIndex = (page - 1) * messagesPerPage
        const endIndex = startIndex + messagesPerPage
        
        return messages.slice(startIndex, endIndex)
      },

      getTotalPages: (chatroomId) => {
        // Always return 4 pages
        return 4
      },

      setCurrentPage: (page) => set({ currentPage: page }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        messagesByChatroom: state.messagesByChatroom,
        scrollPosition: state.scrollPosition
      }),
      onRehydrateStorage: () => (state) => {
        // Convert timestamp strings back to Date objects after rehydration
        if (state && state.messagesByChatroom) {
          Object.keys(state.messagesByChatroom).forEach(chatroomId => {
            state.messagesByChatroom[chatroomId] = state.messagesByChatroom[chatroomId].map(message => ({
              ...message,
              timestamp: new Date(message.timestamp)
            }))
          })
        }
      }
    }
  )
)