# Traducteur Thaï ↔ Français

Voice and text translator between Thai and French. Runs entirely on a local server — no cloud API needed.

## First-time setup

```bash
bash setup.sh
```

This installs Python and Node dependencies, and generates the HTTPS certificate required for microphone access on mobile.

## Starting the servers

Open two terminals:

```bash
# Terminal 1 — Backend (FastAPI)
cd backend
source .venv/bin/activate
python main.py
```

```bash
# Terminal 2 — Frontend (React)
cd frontend
npm run dev
```

## Accessing from your phone

Because the microphone requires HTTPS, you need to trust the self-signed certificate once:

1. **Trust the certificate** — open `https://192.168.81.126:8000` on your phone and accept the security warning.
2. **Open the app** — navigate to `https://192.168.81.126:5173`.

> If your server IP changes, update `frontend/.env` and regenerate the certificate by re-running `bash setup.sh`.

## Usage

- **Text**: type in Thai or French — translation appears automatically after a short pause.
- **Voice**: hold the microphone button, speak, then release. The translation plays back as audio.

## Configuration

All settings are in `backend/config.py`:

| Setting | Default | Description |
|---|---|---|
| `OLLAMA_MODEL` | `bjoernb/gemma4-e4b-fast:latest` | Ollama model used for translation |
| `WHISPER_MODEL_SIZE` | `medium` | `tiny` / `base` / `small` / `medium` / `large-v3` |
| `WHISPER_DEVICE` | `cpu` | `cpu` or `cuda` |
| `TTS_VOICE_THAI` | `th-TH-PremwadeeNeural` | edge-tts voice for Thai output |
| `TTS_VOICE_FRENCH` | `fr-FR-DeniseNeural` | edge-tts voice for French output |
