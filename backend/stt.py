import tempfile
import os
from faster_whisper import WhisperModel
from config import WHISPER_MODEL_SIZE, WHISPER_DEVICE, WHISPER_COMPUTE_TYPE

_model: WhisperModel | None = None


def _get_model() -> WhisperModel:
    global _model
    if _model is None:
        _model = WhisperModel(WHISPER_MODEL_SIZE, device=WHISPER_DEVICE, compute_type=WHISPER_COMPUTE_TYPE)
    return _model


def transcribe(audio_bytes: bytes) -> tuple[str, str]:
    """Returns (transcript, language_code).  language_code is e.g. 'th' or 'fr'."""
    model = _get_model()
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
        f.write(audio_bytes)
        tmp_path = f.name
    try:
        segments, info = model.transcribe(tmp_path, beam_size=5)
        text = " ".join(seg.text for seg in segments).strip()
        return text, info.language
    finally:
        os.unlink(tmp_path)
