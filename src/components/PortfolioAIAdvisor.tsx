import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, Briefcase } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { chatWithGeminiStreamForPortfolio } from '../services/geminiService'
import type { UserDomain } from '../services/domaService'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isStreaming?: boolean
}

interface PortfolioAIAdvisorProps {
  portfolioContext: {
    totalDomains: number
    totalValue: number
    averageValue: number
    domains: UserDomain[]
    topPerformer: string
    lowestValue: number
    highestValue: number
    tldDistribution: Record<string, number>
    totalOffers: number
  }
}

export function PortfolioAIAdvisor({ portfolioContext }: PortfolioAIAdvisorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hi! I'm your AI Portfolio Advisor. I have analyzed your ${portfolioContext.totalDomains} domain${portfolioContext.totalDomains !== 1 ? 's' : ''} worth a total of $${portfolioContext.totalValue.toFixed(2)}. I can help you optimize your portfolio, suggest diversification strategies, and provide insights on market trends. Ask me anything!`,
          timestamp: Date.now(),
        },
      ])
    }
  }, [isOpen, portfolioContext.totalDomains, portfolioContext.totalValue, messages.length])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Create placeholder for streaming message
    const streamingMessageId = Date.now()
    const streamingMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: streamingMessageId,
      isStreaming: true,
    }
    setMessages(prev => [...prev, streamingMessage])

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      // Create portfolio context for AI - properly typed
      const portfolioData = {
        totalDomains: portfolioContext.totalDomains,
        totalValue: portfolioContext.totalValue,
        averageValue: portfolioContext.averageValue,
        domains: portfolioContext.domains,
        topPerformer: portfolioContext.topPerformer,
        lowestValue: portfolioContext.lowestValue,
        highestValue: portfolioContext.highestValue,
        tldDistribution: portfolioContext.tldDistribution,
        totalOffers: portfolioContext.totalOffers,
      }

      await chatWithGeminiStreamForPortfolio(
        inputMessage,
        portfolioData,
        conversationHistory,
        (chunk) => {
          // Update the streaming message with new content
          setMessages(prev =>
            prev.map(msg =>
              msg.timestamp === streamingMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          )
        }
      )

      // Mark streaming as complete
      setMessages(prev =>
        prev.map(msg =>
          msg.timestamp === streamingMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      )
    } catch (error) {
      console.error('Error chatting with Gemini:', error)
      // Remove streaming message and add error
      setMessages(prev =>
        prev.filter(msg => msg.timestamp !== streamingMessageId)
      )
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Circle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#163C6D] text-white rounded-full shadow-lg hover:shadow-xl hover:bg-[#1a4a85] transition-all duration-300 flex items-center justify-center group z-50"
        aria-label="Portfolio AI Advisor"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <Briefcase className="w-6 h-6" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-[#163C6D] text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Portfolio AI Advisor</h3>
                <p className="text-xs opacity-90">Powered by Gemini</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-[#163C6D] text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                    {message.role === 'user' ? (
                      <p className="whitespace-pre-wrap m-0 text-white">{message.content}</p>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="m-0 mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="m-0 mb-2 last:mb-0 pl-4">{children}</ul>,
                          ol: ({ children }) => <ol className="m-0 mb-2 last:mb-0 pl-4">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          strong: ({ children }) => <strong className="font-bold text-gray-900 dark:text-gray-100">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">{children}</code>,
                        }}
                      >
                        {message.content || ' '}
                      </ReactMarkdown>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {message.isStreaming && (
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-[#163C6D] rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-[#163C6D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#163C6D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#163C6D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your portfolio..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#163C6D] focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-[#163C6D] text-white px-4 py-2 rounded-lg hover:bg-[#1a4a85] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
