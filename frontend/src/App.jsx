import { useState } from 'react'
import MicButton from './components/MicButton.jsx'
import TranslatorInput from './components/TranslatorInput.jsx'
import './App.css'

export default function App() {
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [voiceTranslation, setVoiceTranslation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  return (
    <div className="app">
      <header className="app-header">
        <span className="flag">🇹🇭</span>
        <span className="arrow">↔</span>
        <span className="flag">🇫🇷</span>
      </header>

      <TranslatorInput setLoading={setLoading} setError={setError} />

      <div className="divider">— ou parlez —</div>

      <MicButton
        setTranscript={setVoiceTranscript}
        setTranslation={setVoiceTranslation}
        setLoading={setLoading}
        setError={setError}
      />

      {voiceTranscript && (
        <div className="voice-result">
          <p className="voice-transcript">
            <span className="label">Détecté :</span> {voiceTranscript}
          </p>
          <p className="voice-translation">
            <span className="label">Traduction :</span> {voiceTranslation}
          </p>
        </div>
      )}

      {loading && <p className="status">Traitement…</p>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}
