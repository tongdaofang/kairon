// Kairon Agent Runtime — Core Engine

export type ModelProvider = 'openai' | 'anthropic' | 'deepseek' | 'ollama' | 'custom'

export interface ModelConfig {
  provider: ModelProvider
  model: string
  apiKey?: string
  baseUrl?: string
  temperature?: number
  maxTokens?: number
}

export interface ToolDefinition {
  name: string
  description: string
  handler: (args: Record<string, unknown>) => Promise<ToolResult>
}

export interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  name?: string
}

export interface AgentConfig {
  model: ModelConfig
  systemPrompt?: string
  tools?: ToolDefinition[]
  maxIterations?: number
}

export interface CompletionOptions {
  messages: Message[]
  onChunk?: (chunk: string) => void
  signal?: AbortSignal
}

export class AgentRuntime {
  private config: AgentConfig
  private tools: Map<string, ToolDefinition> = new Map()

  constructor(config: AgentConfig) {
    this.config = config
    if (config.tools) {
      config.tools.forEach(t => this.tools.set(t.name, t))
    }
  }

  registerTool(tool: ToolDefinition) {
    this.tools.set(tool.name, tool)
  }

  unregisterTool(name: string) {
    this.tools.delete(name)
  }

  async complete(options: CompletionOptions): Promise<string> {
    const { onChunk } = options
    const messages = [...options.messages]

    // Add system prompt if configured
    if (this.config.systemPrompt) {
      messages.unshift({ role: 'system', content: this.config.systemPrompt })
    }

    // Call the model
    return this.callModel(messages, onChunk)
  }

  private async callModel(
    messages: Message[],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const { provider, model, apiKey, baseUrl, temperature, maxTokens } = this.config.model

    switch (provider) {
      case 'openai':
        return this.callOpenAI(messages, {
          model, apiKey, baseUrl, temperature, maxTokens
        }, onChunk)

      case 'ollama':
        return this.callOllama(messages, {
          model, baseUrl, temperature
        }, onChunk)

      default:
        // Fallback to OpenAI-compatible API
        return this.callOpenAI(messages, {
          model, apiKey: apiKey || '', baseUrl: baseUrl || 'https://api.openai.com/v1',
          temperature, maxTokens
        }, onChunk)
    }
  }

  private async callOpenAI(
    messages: Message[],
    opts: { model: string; apiKey?: string; baseUrl?: string; temperature?: number; maxTokens?: number },
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const baseUrl = opts.baseUrl || 'https://api.openai.com/v1'
    const apiKey = opts.apiKey || ''

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: opts.model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 4096,
        stream: !!onChunk,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenAI API error: ${response.status} — ${err}`)
    }

    if (onChunk && response.body) {
      // Handle streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content || ''
            if (content) {
              fullContent += content
              onChunk(content)
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }

      return fullContent
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }

  private async callOllama(
    messages: Message[],
    opts: { model: string; baseUrl?: string; temperature?: number },
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const baseUrl = opts.baseUrl || 'http://localhost:11434'

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: opts.model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        options: {
          temperature: opts.temperature ?? 0.7,
        },
        stream: !!onChunk,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Ollama API error: ${response.status} — ${err}`)
    }

    if (onChunk && response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.trim())

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line)
            if (parsed.message?.content) {
              fullContent += parsed.message.content
              onChunk(parsed.message.content)
            }
          } catch {
            // Skip malformed lines
          }
        }
      }

      return fullContent
    }

    const data = await response.json()
    return data.message?.content || ''
  }
}

// Factory function
export function createRuntime(config: AgentConfig): AgentRuntime {
  return new AgentRuntime(config)
}
