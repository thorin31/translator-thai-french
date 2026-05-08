import { useRef, useState } from 'react'
import { sendVoice, translateText } from '../api.js'

export default function TranslatorInput({ setLoading, setError, onTranslated }) {
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const audioRef = useRef(null)

  // ── Text translation ──────────────────────────────────────────────────────
  const handleTranslate = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await translateText(text)
      await onTranslated(data.source_lang, text, data.translation)
      setText('')
    } catch {
      setError('Erreur de traduction. Le serveur est-il démarré ?')
    } finally {
      setLoading(false)
    }
  }

  // ── Voice recording ───────────────────────────────────────────────────────
  const startRecording = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        await processVoice(new Blob(chunksRef.current, { type: 'audio/webm' }))
      }
      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
    } catch {
      setError('Microphone inaccessible. Vérifiez les permissions.')
    }
  }

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
      setRecording(false)
    }
  }

  const processVoice = async (blob) => {
    setLoading(true)
    try {
      const { audioData, transcript, translation, sourceLang } = await sendVoice(blob)
      await onTranslated(sourceLang, transcript, translation)
      const url = URL.createObjectURL(audioData)
      if (audioRef.current) {
        audioRef.current.src = url
        await audioRef.current.play()
        audioRef.current.onended = () => URL.revokeObjectURL(url)
      }
    } catch {
      setError('Erreur lors du traitement vocal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="translator-input">
      <div className="textarea-container">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Saisissez du texte en thaï ou en français…"
          rows={3}
          className="input-area"
        />
        <button
          className={`mic-inline ${recording ? 'recording' : ''}`}
          onPointerDown={startRecording}
          onPointerUp={stopRecording}
          onPointerLeave={stopRecording}
          title={recording ? 'Relâcher pour traduire' : 'Maintenir pour parler'}
        >
          {recording ? '⏹' : '🎙️'}
        </button>
      </div>
      <button className="translate-btn" onClick={handleTranslate} disabled={!text.trim()}>
        Traduire
      </button>
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  )
}
