import { useState } from 'react'
import './styles/App.css'
import Sidebar from './components/Sidebar'
import ChatView from './components/ChatView'
import WelcomeScreen from './components/WelcomeScreen'
import SettingsModal from './components/SettingsModal'
import type { AgentSettings } from './components/SettingsModal'

const DEFAULT_SETTINGS: AgentSettings = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  temperature: 0.7,
}

function App() {
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [sessions, setSessions] = useState<string[]>([])
  const [settings, setSettings] = useState<AgentSettings>(DEFAULT_SETTINGS)
  const [showSettings, setShowSettings] = useState(false)

  const handleNewSession = () => {
    const id = `session-${Date.now()}`
    setSessions(prev => [...prev, id])
    setActiveSession(id)
  }

  return (
    <div className="app">
      <Sidebar
        sessions={sessions}
        activeSession={activeSession}
        onNewSession={handleNewSession}
        onSelectSession={setActiveSession}
        onOpenSettings={() => setShowSettings(true)}
      />
      <main className="main-content">
        {activeSession ? (
          <ChatView sessionId={activeSession} settings={settings} />
        ) : (
          <WelcomeScreen onNewSession={handleNewSession} />
        )}
      </main>

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={setSettings}
      />
    </div>
  )
}

export default App
