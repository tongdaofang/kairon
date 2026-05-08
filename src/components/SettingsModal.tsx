import { useState } from 'react'
import './SettingsModal.css'
import type { ModelProvider } from '../lib/runtime'

export interface AgentSettings {
  provider: ModelProvider
  model: string
  apiKey: string
  baseUrl: string
  temperature: number
}

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  settings: AgentSettings
  onSave: (s: AgentSettings) => void
}

const MODEL_PRESETS: Record<ModelProvider, { models: string[]; defaultBaseUrl: string }> = {
  openai: { models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano'], defaultBaseUrl: 'https://api.openai.com/v1' },
  anthropic: { models: ['claude-sonnet-4-20250514', 'claude-haiku-3-5'], defaultBaseUrl: 'https://api.anthropic.com/v1' },
  deepseek: { models: ['deepseek-chat', 'deepseek-reasoner'], defaultBaseUrl: 'https://api.deepseek.com/v1' },
  ollama: { models: ['llama3.2', 'qwen2.5', 'deepseek-r1', 'mistral'], defaultBaseUrl: 'http://localhost:11434' },
  custom: { models: ['custom'], defaultBaseUrl: '' },
}

export default function SettingsModal({ open, onClose, settings, onSave }: SettingsModalProps) {
  const [form, setForm] = useState<AgentSettings>(settings)

  if (!open) return null

  const presets = MODEL_PRESETS[form.provider]

  const handleProviderChange = (provider: ModelProvider) => {
    const p = MODEL_PRESETS[provider]
    setForm({
      ...form,
      provider,
      model: p.models[0],
      baseUrl: p.defaultBaseUrl,
    })
  }

  const handleSave = () => {
    onSave(form)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Agent Settings</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Provider</label>
            <div className="provider-tabs">
              {(['openai', 'anthropic', 'deepseek', 'ollama', 'custom'] as ModelProvider[]).map(p => (
                <button
                  key={p}
                  className={`provider-tab ${form.provider === p ? 'active' : ''}`}
                  onClick={() => handleProviderChange(p)}
                >
                  {p === 'openai' ? 'OpenAI' :
                   p === 'anthropic' ? 'Anthropic' :
                   p === 'deepseek' ? 'DeepSeek' :
                   p === 'ollama' ? 'Ollama' : 'Custom'}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Model</label>
            <select
              value={form.model}
              onChange={e => setForm({ ...form, model: e.target.value })}
              className="form-select"
            >
              {presets.models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>API Key {form.provider !== 'ollama' ? '' : '(not needed for local)'}</label>
            <input
              type="password"
              value={form.apiKey}
              onChange={e => setForm({ ...form, apiKey: e.target.value })}
              placeholder={form.provider === 'ollama' ? 'Not needed for local models' : 'sk-...'}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Base URL</label>
            <input
              type="text"
              value={form.baseUrl}
              onChange={e => setForm({ ...form, baseUrl: e.target.value })}
              placeholder={presets.defaultBaseUrl}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Temperature: {form.temperature}</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={form.temperature}
              onChange={e => setForm({ ...form, temperature: parseFloat(e.target.value) })}
              className="form-range"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save & Apply</button>
        </div>
      </div>
    </div>
  )
}
