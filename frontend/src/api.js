const BASE_URL = import.meta.env.VITE_API_URL || 'https://192.168.81.126:8000'

export async function translateText(text) {
  const res = await fetch(`${BASE_URL}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error('Translation failed')
  return res.json()
}

export async function sendVoice(audioBlob) {
  const form = new FormData()
  form.append('audio', audioBlob, 'recording.webm')
  const res = await fetch(`${BASE_URL}/voice`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error('Voice processing failed')
  const audioData = await res.blob()
  // Headers contain URL-encoded text to support Thai characters
  const transcript = decodeURIComponent(res.headers.get('X-Transcript') || '')
  const translation = decodeURIComponent(res.headers.get('X-Translation') || '')
  const sourceLang = res.headers.get('X-Source-Lang') || ''
  return { audioData, transcript, translation, sourceLang }
}
