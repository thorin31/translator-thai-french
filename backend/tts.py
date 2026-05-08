import os
import tempfile

import edge_tts

from config import LANGUAGES


async def synthesize(text: str, language: str) -> bytes:
    lang_cfg = LANGUAGES.get(language, LANGUAGES["fr"])
    communicate = edge_tts.Communicate(text, lang_cfg["voice"], rate=lang_cfg["rate"])
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        tmp_path = f.name
    try:
        await communicate.save(tmp_path)
        with open(tmp_path, "rb") as f:
            return f.read()
    finally:
        os.unlink(tmp_path)
