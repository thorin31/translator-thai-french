import { useEffect, useRef, useState } from 'react'
import * as api from './api.js'
import { LANGUAGE_LIST, LANGUAGES } from './languages.js'
import ConversationHistory from './components/ConversationHistory.jsx'
import Sidebar from './components/Sidebar.jsx'
import TranslatorInput from './components/TranslatorInput.jsx'
import './App.css'

export default function App() {
  const [langLeft, setLangLeft]       = useState('fr')
  const [langRight, setLangRight]     = useState('th')
  const [conversations, setConversations] = useState([])
  const [currentConvId, setCurrentConvId] = useState(null)
  const [messages, setMessages]       = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    api.getConversations()
      .then(convs => {
        setConversations(convs)
        if (convs.length > 0) loadConversation(convs[0])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const loadConversation = async (conv) => {
    const msgs = await api.getMessages(conv.id)
    setCurrentConvId(conv.id)
    setLangLeft(conv.lang_left)
    setLangRight(conv.lang_right)
    setMessages(msgs)
    setSidebarOpen(false)
  }

  const startNew = () => {
    setCurrentConvId(null)
    setMessages([])
    setSidebarOpen(false)
  }

  const handleLangChange = (side, code) => {
    // Swap if same language selected on both sides
    if (side === 'left') {
      setLangLeft(code)
      if (code === langRight) setLangRight(langLeft)
    } else {
      setLangRight(code)
      if (code === langLeft) setLangLeft(langRight)
    }
    // Start fresh conversation with new pair
    startNew()
  }

  const handleTranslated = async (sourceLang, sourceText, targetText) => {
    let convId = currentConvId
    if (convId === null) {
      const conv = await api.createConversation(langLeft, langRight)
      convId = conv.id
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
          onSelect={loadConversation}
          onDelete={handleDeleteConversation}
          onNew={startNew}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <header className="app-header">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)} title="Historique">
          ☰
        </button>
        <div className="lang-selectors">
          <select
            className="lang-select"
            value={langLeft}
            onChange={e => handleLangChange('left', e.target.value)}
          >
            {LANGUAGE_LIST.map(l => (
              <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
            ))}
          </select>
          <span className="arrow">↔</span>
          <select
            className="lang-select"
            value={langRight}
            onChange={e => handleLangChange('right', e.target.value)}
          >
            {LANGUAGE_LIST.map(l => (
              <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
            ))}
          </select>
        </div>
        <div className="header-spacer" />
      </header>

      <div className="history-area">
        {messages.length > 0 && (
          <ConversationHistory
            messages={messages}
            langLeft={langLeft}
            langRight={langRight}
          />
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
          langLeft={langLeft}
          langRight={langRight}
          setLoading={setLoading}
          setError={setError}
          onTranslated={handleTranslated}
        />
      </div>
    </div>
  )
}
