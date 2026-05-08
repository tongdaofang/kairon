import { useState, useRef, useEffect } from 'react'
import './ChatView.css'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatViewProps {
  sessionId: string
}

export default function ChatView({ sessionId }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [sessionId])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // For now, simulate an AI response (MVP placeholder)
    // TODO: Connect to actual AI model via Agent Runtime
    setTimeout(() => {
      const response: Message = {
        role: 'assistant',
        content: `Hello from Kairon! I'm your AI agent. This is a placeholder response. The agent runtime is coming soon.\n\nYou said: "${userMessage.content}"\n\n**Session ID:** ${sessionId}`,
      }
      setMessages(prev => [...prev, response])
      setIsLoading(false)
    }, 800)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-view">
      <div className="chat-header">
        <h2 className="chat-title">Session {sessionId.slice(-6)}</h2>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>Send a message to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '⚡'}
              </div>
              <div className="message-bubble">
                <div className="message-role">{msg.role === 'user' ? 'You' : 'Kairon'}</div>
                <div className="message-content">{msg.content}</div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">⚡</div>
            <div className="message-bubble">
              <div className="message-role">Kairon</div>
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for new line)"
            rows={1}
            className="chat-input"
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  )
}
