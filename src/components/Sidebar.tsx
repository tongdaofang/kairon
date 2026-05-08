import './Sidebar.css'

interface SidebarProps {
  sessions: string[]
  activeSession: string | null
  onNewSession: () => void
  onSelectSession: (id: string) => void
  onOpenSettings: () => void
}

export default function Sidebar({ sessions, activeSession, onNewSession, onSelectSession, onOpenSettings }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Kairon</span>
        </div>
      </div>

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

      <div className="sidebar-footer">
        <button className="settings-btn" onClick={onOpenSettings}>
          ⚙️ Settings
        </button>
        <span className="version">v0.1.0-alpha</span>
      </div>
    </aside>
  )
}
