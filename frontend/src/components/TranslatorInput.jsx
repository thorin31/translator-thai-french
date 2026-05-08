import { useState } from 'react'
import { translateText } from '../api.js'

export default function TranslatorInput({ setLoading, setError }) {
  const [text, setText] = useState('')
  const [translation, setTranslation] = useState('')

  const handleTranslate = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    setTranslation('')
    try {
      const data = await translateText(text)
      setTranslation(data.translation)
    } catch {
      setError('Erreur de traduction. Le serveur est-il démarré ?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="translator-input">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Saisissez du texte en thaï ou en français…"
        rows={4}
        className="input-area"
      />
      <button
        className="translate-btn"
        onClick={handleTranslate}
        disabled={!text.trim()}
      >
        Traduire
      </button>
      {translation && (
        <div className="translation-box">
          <p>{translation}</p>
          <button
            className="copy-btn"
            onClick={() => navigator.clipboard.writeText(translation)}
            title="Copier"
          >
            📋
          </button>
        </div>
      )}
    </div>
  )
}
