import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Send, User, Briefcase, MessageCircle } from 'lucide-react'

interface ChatMessage {
  id: string
  chat_id: string
  sender_id: string
  message: string
  message_type: 'text' | 'system'
  read_by_employer: boolean
  read_by_candidate: boolean
  created_at: string
  sender_name?: string
  is_employer?: boolean
}

interface JobChat {
  id: string
  application_id: string
  employer_id: string
  candidate_id: string
  job_id: string
  job_title?: string
  company_name?: string
  candidate_name?: string
  employer_name?: string
}

export default function Chat() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const [chat, setChat] = useState<JobChat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getCurrentUser()
    if (chatId) {
      loadChat()
      loadMessages()
      subscribeToMessages()
    }
  }, [chatId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChat = async () => {
    try {
      const { data, error } = await supabase
        .from('job_chats')
        .select(`
          *,
          jobs!inner(title, company),
          employer:employer_id(full_name),
          candidate:candidate_id(full_name)
        `)
        .eq('id', chatId)
        .single()

      if (error) throw error

      setChat({
        ...data,
        job_title: data.jobs.title,
        company_name: data.jobs.company,
        employer_name: data.employer?.full_name || 'Employer',
        candidate_name: data.candidate?.full_name || 'Candidate'
      })
    } catch (error) {
      console.error('Error loading chat:', error)
      navigate('/dashboard')
    }
  }

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:sender_id(full_name)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const messagesWithSenderInfo = data.map(msg => ({
        ...msg,
        sender_name: msg.sender?.full_name || 'Unknown User',
        is_employer: chat?.employer_id === msg.sender_id
      }))

      setMessages(messagesWithSenderInfo)
      markMessagesAsRead()
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage
          
          // Get sender info
          const { data: senderData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newMessage.sender_id)
            .single()

          const messageWithSender = {
            ...newMessage,
            sender_name: senderData?.full_name || 'Unknown User',
            is_employer: chat?.employer_id === newMessage.sender_id
          }

          setMessages(prev => [...prev, messageWithSender])
          
          // Mark as read if not sent by current user
          if (newMessage.sender_id !== currentUser?.id) {
            markMessagesAsRead()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const markMessagesAsRead = async () => {
    if (!currentUser || !chat) return

    const isEmployer = currentUser.id === chat.employer_id
    const updateField = isEmployer ? 'read_by_employer' : 'read_by_candidate'

    await supabase
      .from('chat_messages')
      .update({ [updateField]: true })
      .eq('chat_id', chatId)
      .eq(updateField, false)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: currentUser?.id,
          message: newMessage.trim(),
          message_type: 'text'
        })

      if (error) throw error
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chat not found</h2>
          <p className="text-gray-600 mb-4">This chat may not exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const isEmployer = currentUser?.id === chat.employer_id

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sky-600 hover:text-sky-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {isEmployer ? chat.candidate_name : chat.employer_name}
                  </h1>
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 mr-1" />
                    <span>{chat.job_title} at {chat.company_name}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {isEmployer ? 'Employer View' : 'Candidate View'}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => {
              const isOwnMessage = message.sender_id === currentUser?.id
              const isSystemMessage = message.message_type === 'system'

              if (isSystemMessage) {
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm">
                      {message.message}
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-sky-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <div className={`mt-1 text-xs text-gray-500 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                      <span>{message.sender_name}</span>
                      <span className="ml-2">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isOwnMessage ? 'order-1 mr-2 bg-sky-500' : 'order-2 ml-2 bg-gray-300'
                  }`}>
                    <User className={`w-4 h-4 ${isOwnMessage ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={sendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}