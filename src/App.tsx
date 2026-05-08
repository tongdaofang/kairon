import { useState } from 'react'
import './styles/App.css'
import Sidebar from './components/Sidebar'
import ChatView from './components/ChatView'
import WelcomeScreen from './components/WelcomeScreen'

function App() {
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [sessions, setSessions] = useState<string[]>([])

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
      />
      <main className="main-content">
        {activeSession ? (
          <ChatView sessionId={activeSession} />
        ) : (
          <WelcomeScreen onNewSession={handleNewSession} />
        )}
      </main>
    </div>
  )
}

export default App
