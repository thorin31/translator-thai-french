import { useEffect, useRef, useState } from 'react'
import { translateText } from '../api.js'

export default function TranslatorInput({ setLoading, setError }) {
  const [text, setText] = useState('')
  const [translation, setTranslation] = useState('')
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!text.trim()) {
      setTranslation('')
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await translateText(text)
        setTranslation(data.translation)
      } catch {
        setError('Erreur de traduction. Le serveur est-il démarré ?')
      } finally {
        setLoading(false)
      }
    }, 600)
    return () => clearTimeout(debounceRef.current)
  }, [text, setLoading, setError])

  return (
    <div className="translator-input">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Saisissez du texte en thaï ou en français…"
        rows={4}
        className="input-area"
      />
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
