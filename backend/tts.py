import tempfile
import os
import edge_tts
from config import TTS_VOICE_THAI, TTS_VOICE_FRENCH


async def synthesize(text: str, language: str) -> bytes:
    """Synthesize speech.  language: 'th' → Thai voice, anything else → French voice."""
    voice = TTS_VOICE_THAI if language == "th" else TTS_VOICE_FRENCH
    communicate = edge_tts.Communicate(text, voice)
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        tmp_path = f.name
    try:
        await communicate.save(tmp_path)
        with open(tmp_path, "rb") as f:
            return f.read()
    finally:
        os.unlink(tmp_path)
