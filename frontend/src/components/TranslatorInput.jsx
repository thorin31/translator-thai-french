import { useEffect, useRef, useState } from 'react'
import { sendVoice, translateText } from '../api.js'

// 1-sample silent WAV — used to activate the audio element during the user gesture
// so iOS Safari allows play() later in the async pipeline.
const SILENT_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'

export default function TranslatorInput({ langLeft, langRight, setLoading, setError, onTranslated }) {
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const audioRef = useRef(new Audio())
  // Kept alive between recordings so getUserMedia isn't called again
  const streamRef = useRef(null)
  // True if stopRecording fired before getUserMedia resolved (permission dialog timing)
  const pendingStopRef = useRef(false)

  useEffect(() => {
    // Warm up mic permission as soon as the component mounts.
    // On Android Chrome this resolves silently if already granted.
    // On iOS this is a no-op (requires a user gesture) and the catch is swallowed.
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => { streamRef.current = stream })
      .catch(() => {})

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const acquireStream = async () => {
    const live = streamRef.current?.getTracks().some(t => t.readyState === 'live')
    if (live) return streamRef.current
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    return stream
  }

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
    pendingStopRef.current = false
    setError('')
    audioRef.current.src = SILENT_WAV
    audioRef.current.play().catch(() => {})
    try {
      const stream = await acquireStream()
      // User released the button while the permission dialog was open → abort
      if (pendingStopRef.current) return
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
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
    } else {
      // Recording hasn't started yet (waiting for permission dialog) — signal abort
      pendingStopRef.current = true
    }
  }

  const processVoice = async (blob) => {
    setLoading(true)
    try {
      const { audioData, transcript, translation, sourceLang } = await sendVoice(blob, langLeft, langRight)
      await onTranslated(sourceLang, transcript, translation)
      try {
        const url = URL.createObjectURL(audioData)
        audioRef.current.onended = () => URL.revokeObjectURL(url)
        audioRef.current.src = url
        await audioRef.current.play()
      } catch {
        // Autoplay still blocked — user can tap 🔊 to replay
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
    </div>
  )
}
