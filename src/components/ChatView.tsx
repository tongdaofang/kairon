import { useState, useRef, useEffect, useCallback } from 'react'
import { createRuntime } from '../lib/runtime'
import { builtinTools } from '../lib/tools'
import type { AgentSettings } from './SettingsModal'
import './ChatView.css'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatViewProps {
  sessionId: string
  settings: AgentSettings
}

export default function ChatView({ sessionId, settings }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [sessionId])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const userMsg: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      // Build runtime with current settings
      const runtime = createRuntime({
        model: {
          provider: settings.provider,
          model: settings.model,
          apiKey: settings.apiKey || undefined,
          baseUrl: settings.baseUrl || undefined,
          temperature: settings.temperature,
        },
        systemPrompt: 'You are Kairon, a helpful AI agent. You have access to tools like file operations, web search, and code execution. Use them when appropriate.',
        tools: builtinTools,
      })

      const allMessages = [...messages, userMsg]
      let accumulated = ''

      const response = await runtime.complete({
        messages: allMessages.map(m => ({ role: m.role, content: m.content })),
        onChunk: (chunk) => {
          accumulated += chunk
          // Update the last assistant message with streaming content
          setMessages(prev => {
            const next = [...prev]
            if (next[next.length - 1]?.role === 'assistant') {
              next[next.length - 1] = { role: 'assistant', content: accumulated }
            } else {
              next.push({ role: 'assistant', content: accumulated })
            }
            return next
          })
        },
      })

      // Ensure final response is set
      if (!accumulated && response) {
        setMessages(prev => [...prev, { role: 'assistant', content: response }])
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ **Error:** ${errMsg}\n\nCheck your API key and model settings. Click ⚙️ in the sidebar to configure.`,
      }])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, settings])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const renderContent = (content: string) => {
    // Simple markdown-like rendering for code blocks
    const parts = content.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const lines = part.split('\n')
        const lang = lines[0].replace('```', '').trim()
        const code = lines.slice(1, -1).join('\n')
        return (
          <pre key={i} className="code-block">
            {lang && <div className="code-lang">{lang}</div>}
            <code>{code}</code>
          </pre>
        )
      }
      // Simple bold
      const text = part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return <span key={i} dangerouslySetInnerHTML={{ __html: text }} />
    })
  }

  return (
    <div className="chat-view">
      <div className="chat-header">
        <span className="chat-title">
          {settings.provider === 'ollama' ? '🦙 ' : '⚡ '}
          {settings.model}
          <span className="chat-title-hint">{settings.provider}</span>
        </span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="empty-icon">💬</div>
            <p>Agent connected: <strong>{settings.model}</strong></p>
            <p className="chat-empty-hint">Send a message to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '⚡'}
              </div>
              <div className={`message-bubble ${msg.role === 'assistant' && msg.content.startsWith('⚠️') ? 'error' : ''}`}>
                <div className="message-role">
                  {msg.role === 'user' ? 'You' : 'Kairon'}
                </div>
                <div className="message-content">
                  {renderContent(msg.content)}
                </div>
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
            placeholder={isLoading ? 'Waiting for response...' : 'Type a message... (Shift+Enter for new line)'}
            rows={1}
            className="chat-input"
            disabled={isLoading}
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
