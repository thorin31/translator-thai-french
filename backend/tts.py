import tempfile
import os
import edge_tts
from config import TTS_VOICE_THAI, TTS_VOICE_FRENCH, TTS_RATE_THAI, TTS_RATE_FRENCH


async def synthesize(text: str, language: str) -> bytes:
    """Synthesize speech.  language: 'th' → Thai voice, anything else → French voice."""
    if language == "th":
        voice, rate = TTS_VOICE_THAI, TTS_RATE_THAI
    else:
        voice, rate = TTS_VOICE_FRENCH, TTS_RATE_FRENCH
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        tmp_path = f.name
    try:
        await communicate.save(tmp_path)
        with open(tmp_path, "rb") as f:
            return f.read()
    finally:
        os.unlink(tmp_path)
