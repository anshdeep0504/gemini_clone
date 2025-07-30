import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Chatroom {
  id: string
  name: string
  createdAt: Date
  lastMessage?: string
  lastMessageTime?: Date
  messageCount: number
}

interface ChatroomState {
  chatrooms: Chatroom[]
  activeChatroomId: string | null
  isLoading: boolean
  
  // Actions
  createChatroom: (name: string) => Promise<Chatroom>
  deleteChatroom: (id: string) => Promise<void>
  setActiveChatroom: (id: string) => void
  updateChatroom: (id: string, updates: Partial<Chatroom>) => void
  addMessageToChatroom: (chatroomId: string, message: string) => void
  getChatroom: (id: string) => Chatroom | undefined
  getActiveChatroom: () => Chatroom | undefined
}

export const useChatroomStore = create<ChatroomState>()(
  persist(
    (set, get) => ({
      chatrooms: [],
      activeChatroomId: null,
      isLoading: false,

      createChatroom: async (name: string) => {
        const newChatroom: Chatroom = {
          id: `chatroom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: name.trim() || `Chat ${get().chatrooms.length + 1}`,
          createdAt: new Date(),
          messageCount: 0
        }

        set((state) => ({
          chatrooms: [...state.chatrooms, newChatroom],
          activeChatroomId: newChatroom.id
        }))

        return newChatroom
      },

      deleteChatroom: async (id: string) => {
        const state = get()
        const chatrooms = state.chatrooms.filter(room => room.id !== id)
        
        // If we're deleting the active chatroom, set a new active one
        let newActiveId = state.activeChatroomId
        if (state.activeChatroomId === id) {
          newActiveId = chatrooms.length > 0 ? chatrooms[0].id : null
        }

        set({
          chatrooms,
          activeChatroomId: newActiveId
        })
      },

      setActiveChatroom: (id: string) => {
        set({ activeChatroomId: id })
      },

      updateChatroom: (id: string, updates: Partial<Chatroom>) => {
        set((state) => ({
          chatrooms: state.chatrooms.map(room =>
            room.id === id ? { ...room, ...updates } : room
          )
        }))
      },

      addMessageToChatroom: (chatroomId: string, message: string) => {
        set((state) => ({
          chatrooms: state.chatrooms.map(room =>
            room.id === chatroomId
              ? {
                  ...room,
                  lastMessage: message,
                  lastMessageTime: new Date(),
                  messageCount: room.messageCount + 1
                }
              : room
          )
        }))
      },

      getChatroom: (id: string) => {
        return get().chatrooms.find(room => room.id === id)
      },

      getActiveChatroom: () => {
        const state = get()
        return state.chatrooms.find(room => room.id === state.activeChatroomId)
      }
    }),
    {
      name: 'chatroom-storage',
      partialize: (state) => ({
        chatrooms: state.chatrooms,
        activeChatroomId: state.activeChatroomId
      })
    }
  )
) 