const BASE_URL = import.meta.env.VITE_API_URL || 'https://192.168.81.126:8000'

async function _json(res) {
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── Translation ──────────────────────────────────────────────────────────────

export async function translateText(text) {
  return _json(await fetch(`${BASE_URL}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  }))
}

export async function sendVoice(audioBlob) {
  const form = new FormData()
  form.append('audio', audioBlob, 'recording.webm')
  const res = await fetch(`${BASE_URL}/voice`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const audioData = await res.blob()
  const transcript = decodeURIComponent(res.headers.get('X-Transcript') || '')
  const translation = decodeURIComponent(res.headers.get('X-Translation') || '')
  const sourceLang = res.headers.get('X-Source-Lang') || ''
  return { audioData, transcript, translation, sourceLang }
}

export async function speakText(text, language) {
  const res = await fetch(`${BASE_URL}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.blob()
}

// ── Conversations ─────────────────────────────────────────────────────────────

export async function getConversations() {
  return _json(await fetch(`${BASE_URL}/conversations`))
}

export async function createConversation(primaryLang) {
  return _json(await fetch(`${BASE_URL}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ primary_lang: primaryLang }),
  }))
}

export async function deleteConversation(id) {
  const res = await fetch(`${BASE_URL}/conversations/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export async function getMessages(convId) {
  return _json(await fetch(`${BASE_URL}/conversations/${convId}/messages`))
}

export async function addMessage(convId, sourceLang, sourceText, targetText) {
  return _json(await fetch(`${BASE_URL}/conversations/${convId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_lang: sourceLang, source_text: sourceText, target_text: targetText }),
  }))
}
