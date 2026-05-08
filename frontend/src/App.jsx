import { useEffect, useRef, useState } from 'react'
import * as api from './api.js'
import ConversationHistory from './components/ConversationHistory.jsx'
import Sidebar from './components/Sidebar.jsx'
import TranslatorInput from './components/TranslatorInput.jsx'
import './App.css'

export default function App() {
  const [conversations, setConversations] = useState([])
  const [currentConvId, setCurrentConvId] = useState(null)
  const [primaryLang, setPrimaryLang] = useState(null)
  const [messages, setMessages] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    api.getConversations()
      .then(convs => {
        setConversations(convs)
        if (convs.length > 0) selectConversation(convs[0])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const selectConversation = async (conv) => {
    const msgs = await api.getMessages(conv.id)
    setCurrentConvId(conv.id)
    setPrimaryLang(conv.primary_lang)
    setMessages(msgs)
    setSidebarOpen(false)
  }

  const startNew = () => {
    setCurrentConvId(null)
    setPrimaryLang(null)
    setMessages([])
    setSidebarOpen(false)
  }

  const handleTranslated = async (sourceLang, sourceText, targetText) => {
    let convId = currentConvId
    if (convId === null) {
      const conv = await api.createConversation(sourceLang)
      convId = conv.id
      setPrimaryLang(sourceLang)
      setCurrentConvId(convId)
      setConversations(prev => [conv, ...prev])
    }
    const msg = await api.addMessage(convId, sourceLang, sourceText, targetText)
    setMessages(prev => [...prev, msg])
  }

  const handleDeleteConversation = async (id) => {
    await api.deleteConversation(id)
    setConversations(prev => prev.filter(c => c.id !== id))
    if (currentConvId === id) startNew()
  }

  return (
    <div className="app">
      {sidebarOpen && (
        <Sidebar
          conversations={conversations}
          currentConvId={currentConvId}
          onSelect={selectConversation}
          onDelete={handleDeleteConversation}
          onNew={startNew}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <header className="app-header">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)} title="Historique">
          ☰
        </button>
        <div className="header-flags">
          <span className="flag">🇹🇭</span>
          <span className="arrow">↔</span>
          <span className="flag">🇫🇷</span>
        </div>
        <div className="header-spacer" />
      </header>

      <div className="history-area">
        {messages.length > 0 && primaryLang && (
          <ConversationHistory messages={messages} primaryLang={primaryLang} />
        )}
        {messages.length === 0 && (
          <p className="empty-hint">Tapez un texte ou maintenez 🎙️ pour commencer</p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="input-zone">
        {loading && <p className="status">Traitement…</p>}
        {error && <p className="error">{error}</p>}
        <TranslatorInput
          setLoading={setLoading}
          setError={setError}
          onTranslated={handleTranslated}
        />
      </div>
    </div>
  )
}
