import { useState } from 'react'
import { translateText } from '../api.js'

export default function TranslatorInput({ setLoading, setError, onTranslated }) {
  const [text, setText] = useState('')

  const handleTranslate = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await translateText(text)
      onTranslated(data.source_lang, text, data.translation)
      setText('')
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
    </div>
  )
}
