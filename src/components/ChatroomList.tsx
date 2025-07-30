'use client'

import { useState, useMemo } from 'react'
import { useChatroomStore, type Chatroom } from '@/lib/chatroom-store'
import { useThemeStore } from '@/lib/theme-store'
import { FiMessageSquare, FiTrash2, FiEdit3, FiPlus, FiX } from 'react-icons/fi'
import { SearchBar } from './SearchBar'
import toast from 'react-hot-toast'

export function ChatroomList() {
  const { chatrooms, activeChatroomId, setActiveChatroom, deleteChatroom, createChatroom } = useChatroomStore()
  const { isDarkMode } = useThemeStore()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newChatroomName, setNewChatroomName] = useState('')
  const [editingChatroom, setEditingChatroom] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter chatrooms based on search query
  const filteredChatrooms = useMemo(() => {
    if (!searchQuery.trim()) return chatrooms
    
    return chatrooms.filter(chatroom =>
      chatroom.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [chatrooms, searchQuery])

  const handleCreateChatroom = async () => {
    if (!newChatroomName.trim()) {
      toast.error('Please enter a chatroom name')
      return
    }

    try {
      await createChatroom(newChatroomName)
      setNewChatroomName('')
      setShowCreateForm(false)
      toast.success('Chatroom created successfully!')
    } catch (error) {
      toast.error('Failed to create chatroom')
    }
  }

  const handleDeleteChatroom = async (chatroom: Chatroom) => {
    try {
      await deleteChatroom(chatroom.id)
      toast.success('Chatroom deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete chatroom')
    }
  }

  const handleEditChatroom = (chatroom: Chatroom) => {
    setEditingChatroom(chatroom.id)
    setEditName(chatroom.name)
  }

  const handleSaveEdit = () => {
    if (!editingChatroom || !editName.trim()) {
      toast.error('Please enter a valid name')
      return
    }

    try {
      useChatroomStore.getState().updateChatroom(editingChatroom, { name: editName })
      setEditingChatroom(null)
      setEditName('')
      toast.success('Chatroom name updated!')
    } catch (error) {
      toast.error('Failed to update chatroom name')
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Chatrooms</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'}`}
            title="Create new chatroom"
            aria-label="Create new chatroom"
          >
            <FiPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search chatrooms..."
            className="w-full"
          />
        </div>

        {/* Create Chatroom Form */}
        {showCreateForm && (
          <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newChatroomName}
                onChange={(e) => setNewChatroomName(e.target.value)}
                placeholder="Enter chatroom name..."
                className={`flex-1 px-3 py-2 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900 border border-gray-300'
                }`}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateChatroom()}
                onKeyDown={(e) => e.key === 'Escape' && setShowCreateForm(false)}
                autoFocus
                aria-label="Chatroom name"
              />
              <button
                onClick={handleCreateChatroom}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Create chatroom"
              >
                <FiPlus className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setNewChatroomName('')
                }}
                className={`p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                title="Cancel"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Chatroom List */}
        <div className="space-y-2">
          {filteredChatrooms.length === 0 ? (
            <div className="text-center py-8">
              <FiMessageSquare className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchQuery ? 'No chatrooms found' : 'No chatrooms yet'}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {searchQuery ? 'Try adjusting your search' : 'Create your first chatroom to get started'}
              </p>
            </div>
          ) : (
            filteredChatrooms.map((chatroom) => (
              <div
                key={chatroom.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  activeChatroomId === chatroom.id
                    ? 'bg-blue-600 text-white'
                    : isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                }`}
                onClick={() => setActiveChatroom(chatroom.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setActiveChatroom(chatroom.id)
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Select ${chatroom.name} chatroom`}
              >
                {/* Edit Form */}
                {editingChatroom === chatroom.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`flex-1 px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900 border border-gray-300'
                      }`}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                      onKeyDown={(e) => e.key === 'Escape' && setEditingChatroom(null)}
                      autoFocus
                      aria-label="Edit chatroom name"
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="p-1 text-green-400 hover:text-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      title="Save changes"
                    >
                      <FiPlus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setEditingChatroom(null)}
                      className={`p-1 focus:outline-none focus:ring-2 focus:ring-gray-500 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
                      title="Cancel edit"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{chatroom.name}</h3>
                        {chatroom.lastMessage && (
                          <p className="text-xs opacity-75 truncate mt-1">
                            {chatroom.lastMessage}
                          </p>
                        )}
                        <p className="text-xs opacity-50 mt-1">
                          {formatDate(chatroom.createdAt)} • {chatroom.messageCount} messages
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditChatroom(chatroom)
                          }}
                          className={`p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                          title="Edit chatroom name"
                          aria-label={`Edit ${chatroom.name}`}
                        >
                          <FiEdit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`Are you sure you want to delete "${chatroom.name}"?`)) {
                              handleDeleteChatroom(chatroom)
                            }
                          }}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                          title="Delete chatroom"
                          aria-label={`Delete ${chatroom.name}`}
                        >
                          <FiTrash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 