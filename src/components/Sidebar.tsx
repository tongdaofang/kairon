import './Sidebar.css'

interface SidebarProps {
  sessions: string[]
  activeSession: string | null
  onNewSession: () => void
  onSelectSession: (id: string) => void
  onOpenSettings: () => void
  onSwitchToWorkflow: () => void
  currentMode: 'chat' | 'workflow'
}

export default function Sidebar({
  sessions, activeSession, onNewSession, onSelectSession,
  onOpenSettings, onSwitchToWorkflow, currentMode
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Kairon</span>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="mode-tabs">
        <button
          className={`mode-tab ${currentMode === 'chat' ? 'active' : ''}`}
          onClick={() => {}}
        >
          💬 Chat
        </button>
        <button
          className={`mode-tab ${currentMode === 'workflow' ? 'active' : ''}`}
          onClick={onSwitchToWorkflow}
        >
          🔗 Workflow
        </button>
      </div>

      {currentMode === 'chat' && (
        <>
          <button className="new-chat-btn" onClick={onNewSession}>
            <span>+</span>
            New Chat
          </button>

          <div className="sessions-list">
            {sessions.length === 0 ? (
              <div className="empty-state">
                <p>No conversations yet</p>
                <p className="hint">Start a new chat to begin</p>
              </div>
            ) : (
              sessions.map(id => (
                <div
                  key={id}
                  className={`session-item ${activeSession === id ? 'active' : ''}`}
                  onClick={() => onSelectSession(id)}
                >
                  <span className="session-icon">💬</span>
                  <span className="session-name">Chat {sessions.indexOf(id) + 1}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {currentMode === 'workflow' && (
        <div className="mode-info">
          <div className="empty-state">
            <p>🔗 Workflow Mode</p>
            <p className="hint">Drag and drop nodes to build AI pipelines</p>
          </div>
        </div>
      )}

      <div className="sidebar-footer">
        <button className="settings-btn" onClick={onOpenSettings}>
          ⚙️ Settings
        </button>
        <span className="version">v0.1.0-alpha</span>
      </div>
    </aside>
  )
}
