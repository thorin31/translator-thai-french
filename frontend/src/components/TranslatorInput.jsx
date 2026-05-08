import { useRef, useState } from 'react'
import { sendVoice, translateText } from '../api.js'

// Play a silent buffer during a user-gesture event to unlock audio autoplay on mobile.
async function unlockAudio() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const buf = ctx.createBuffer(1, 1, 22050)
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(ctx.destination)
    src.start(0)
    await ctx.resume()
    ctx.close()
  } catch {}
}

export default function TranslatorInput({ langLeft, langRight, setLoading, setError, onTranslated }) {
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const audioRef = useRef(null)

  const handleTranslate = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await translateText(text, langLeft, langRight)
      await onTranslated(data.source_lang, text, data.translation)
      setText('')
    } catch {
      setError('Erreur de traduction. Le serveur est-il démarré ?')
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    setError('')
    await unlockAudio()
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
      const { audioData, transcript, translation, sourceLang } = await sendVoice(blob, langLeft, langRight)
      await onTranslated(sourceLang, transcript, translation)
      try {
        const url = URL.createObjectURL(audioData)
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => URL.revokeObjectURL(url)
        await audio.play()
      } catch {
        // Autoplay blocked by browser — user can tap 🔊 to replay
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
          placeholder="Saisissez du texte…"
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
