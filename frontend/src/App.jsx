import { useEffect, useRef, useState } from 'react'
import ConversationHistory from './components/ConversationHistory.jsx'
import MicButton from './components/MicButton.jsx'
import TranslatorInput from './components/TranslatorInput.jsx'
import './App.css'

function loadStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

export default function App() {
  const [history, setHistory] = useState(() => loadStorage('translator_history', []))
  const [primaryLang, setPrimaryLang] = useState(() => loadStorage('translator_primary_lang', null))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  // Scroll to latest entry whenever history grows
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history.length])

  const addEntry = (sourceLang, sourceText, targetText) => {
    const pl = primaryLang ?? sourceLang
    if (!primaryLang) {
      setPrimaryLang(pl)
      localStorage.setItem('translator_primary_lang', JSON.stringify(pl))
    }
    const entry = { id: Date.now(), sourceLang, sourceText, targetText }
    const next = [...history, entry]
    setHistory(next)
    localStorage.setItem('translator_history', JSON.stringify(next))
  }

  const clearHistory = () => {
    setHistory([])
    setPrimaryLang(null)
    localStorage.removeItem('translator_history')
    localStorage.removeItem('translator_primary_lang')
  }

  return (
    <div className="app">
      {/* Scrollable history zone */}
      <div className="history-area">
        <header className="app-header">
          <span className="flag">🇹🇭</span>
          <span className="arrow">↔</span>
          <span className="flag">🇫🇷</span>
        </header>

        {history.length > 0 && (
          <ConversationHistory
            history={history}
            primaryLang={primaryLang}
            onClear={clearHistory}
          />
        )}

        {/* Anchor used to auto-scroll to bottom */}
        <div ref={bottomRef} />
      </div>

      {/* Fixed input zone at the bottom */}
      <div className="input-zone">
        {loading && <p className="status">Traitement…</p>}
        {error && <p className="error">{error}</p>}

        <TranslatorInput
          setLoading={setLoading}
          setError={setError}
          onTranslated={addEntry}
        />

        <div className="divider">— ou parlez —</div>

        <MicButton
          setLoading={setLoading}
          setError={setError}
          onTranslated={addEntry}
        />
      </div>
    </div>
  )
}
