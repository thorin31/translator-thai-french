import { useRef, useState } from 'react'
import { speakText } from '../api.js'

function CopyBtn({ text }) {
  return (
    <button className="cell-btn" onClick={() => navigator.clipboard.writeText(text)} title="Copier">
      📋
    </button>
  )
}

function ReadBtn({ text, language }) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  const handleRead = async () => {
    if (playing) {
      audioRef.current?.pause()
      setPlaying(false)
      return
    }
    try {
      setPlaying(true)
      const blob = await speakText(text, language)
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => { setPlaying(false); URL.revokeObjectURL(url) }
      audio.onerror = () => setPlaying(false)
      await audio.play()
    } catch {
      setPlaying(false)
    }
  }

  return (
    <button className="cell-btn" onClick={handleRead} title={playing ? 'Arrêter' : 'Écouter'}>
      {playing ? '⏹' : '🔊'}
    </button>
  )
}

const LABELS = { th: '🇹🇭 Thaï', fr: '🇫🇷 Français' }

export default function ConversationHistory({ messages, primaryLang }) {
  const secondaryLang = primaryLang === 'th' ? 'fr' : 'th'

  return (
    <div className="history">
      <div className="history-col-headers">
        <span>{LABELS[primaryLang]}</span>
        <span>{LABELS[secondaryLang]}</span>
      </div>

      {messages.map(msg => {
        const leftText = msg.source_lang === primaryLang ? msg.source_text : msg.target_text
        const rightText = msg.source_lang === secondaryLang ? msg.source_text : msg.target_text
        const leftIsSource = msg.source_lang === primaryLang

        return (
          <div key={msg.id} className="history-entry">
            <div className={`history-cell ${leftIsSource ? 'cell-source' : 'cell-target'}`}>
              <p>{leftText}</p>
              <div className="cell-actions">
                <CopyBtn text={leftText} />
                <ReadBtn text={leftText} language={primaryLang} />
              </div>
            </div>
            <div className={`history-cell ${leftIsSource ? 'cell-target' : 'cell-source'}`}>
              <p>{rightText}</p>
              <div className="cell-actions">
                <CopyBtn text={rightText} />
                <ReadBtn text={rightText} language={secondaryLang} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
