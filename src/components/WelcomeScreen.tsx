import './WelcomeScreen.css'

interface WelcomeScreenProps {
  onNewSession: () => void
}

export default function WelcomeScreen({ onNewSession }: WelcomeScreenProps) {
  return (
    <div className="welcome">
      <div className="welcome-content">
        <div className="welcome-logo">
          <span>⚡</span>
        </div>
        <h1 className="welcome-title">Kairon</h1>
        <p className="welcome-subtitle">Your personal AI computer</p>
        <p className="welcome-desc">
          Open-source AI Agent desktop. Self-hosted. Extensible. Yours.
        </p>

        <div className="quick-actions">
          <button className="action-btn primary" onClick={onNewSession}>
            <span>+</span> Start a conversation
          </button>
          <div className="action-hint">
            Ask me anything — code, research, planning, automation
          </div>
        </div>

        <div className="features-preview">
          <div className="feature-item">
            <span className="feature-icon">🧠</span>
            <div>
              <strong>Multi-Model</strong>
              <p>OpenAI, Claude, DeepSeek, or local models</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔧</span>
            <div>
              <strong>Built-in Tools</strong>
              <p>Code execution, file ops, browser, search</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔌</span>
            <div>
              <strong>Plugin System</strong>
              <p>Extend with custom plugins</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
