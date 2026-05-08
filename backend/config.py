# Ollama
OLLAMA_BASE_URL = "http://127.0.0.1:11434"
OLLAMA_MODEL = "bjoernb/gemma4-e4b-fast:latest"

# faster-whisper
WHISPER_MODEL_SIZE = "medium"   # tiny | base | small | medium | large-v3
WHISPER_DEVICE = "cpu"          # cpu | cuda
WHISPER_COMPUTE_TYPE = "int8"   # int8 | float16 | float32

# edge-tts voices
TTS_VOICE_THAI = "th-TH-PremwadeeNeural"
TTS_VOICE_FRENCH = "fr-FR-DeniseNeural"

# Server — TLS is terminated by the reverse proxy, not here
HOST = "0.0.0.0"
PORT = 8000
