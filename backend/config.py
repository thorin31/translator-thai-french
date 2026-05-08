# Ollama
OLLAMA_BASE_URL = "http://127.0.0.1:11434"
OLLAMA_MODEL = "bjoernb/gemma4-e4b-fast:latest"

# faster-whisper
WHISPER_MODEL_SIZE = "medium"   # tiny | base | small | medium | large-v3
WHISPER_DEVICE = "cpu"          # cpu | cuda
WHISPER_COMPUTE_TYPE = "int8"

# Supported languages: code → voice, display name, TTS rate
LANGUAGES = {
    "de": {"name": "Allemand",  "voice": "de-DE-KatjaNeural",     "rate": "+0%"},
    "en": {"name": "Anglais",   "voice": "en-US-JennyNeural",     "rate": "+0%"},
    "es": {"name": "Espagnol",  "voice": "es-ES-ElviraNeural",    "rate": "+0%"},
    "fr": {"name": "Français",  "voice": "fr-FR-DeniseNeural",    "rate": "+0%"},
    "lo": {"name": "Laotien",   "voice": "lo-LA-KeomanyNeural",   "rate": "-20%"},
    "ru": {"name": "Russe",     "voice": "ru-RU-SvetlanaNeural",  "rate": "+0%"},
    "th": {"name": "Thaï",      "voice": "th-TH-PremwadeeNeural", "rate": "-25%"},
}

# Server — TLS is terminated by the reverse proxy
HOST = "0.0.0.0"
PORT = 8000
