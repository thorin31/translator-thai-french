import { useRef, useState } from 'react'
import { sendVoice } from '../api.js'

export default function MicButton({ setTranscript, setTranslation, setLoading, setError }) {
  const [recording, setRecording] = useState(false)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const audioRef = useRef(null)

  const startRecording = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await processVoice(blob)
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
      const { audioData, transcript, translation } = await sendVoice(blob)
      setTranscript(transcript)
      setTranslation(translation)
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
    <div className="mic-container">
      <button
        className={`mic-button ${recording ? 'recording' : ''}`}
        onPointerDown={startRecording}
        onPointerUp={stopRecording}
        onPointerLeave={stopRecording}
      >
        {recording ? '⏹' : '🎙️'}
      </button>
      <span className="mic-label">
        {recording ? 'Parlez… (relâchez pour traduire)' : 'Maintenir pour parler'}
      </span>
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  )
}
