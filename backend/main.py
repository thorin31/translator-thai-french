from urllib.parse import quote
import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

import llm
import stt
import tts
from config import CERT_FILE, HOST, KEY_FILE, PORT

app = FastAPI(title="Translator Thai-French")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Transcript", "X-Translation", "X-Source-Lang"],
)


class TranslateRequest(BaseModel):
    text: str


def _detect_lang(text: str) -> str:
    return "th" if any("฀" <= ch <= "๿" for ch in text) else "fr"


@app.post("/translate")
async def translate_text(req: TranslateRequest):
    if not req.text.strip():
        raise HTTPException(400, "Empty text")
    result = await llm.translate(req.text)
    return {"translation": result, "source_lang": _detect_lang(req.text)}


@app.post("/voice")
async def voice_pipeline(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(400, "Empty audio")

    transcript, src_lang = stt.transcribe(audio_bytes)
    if not transcript:
        raise HTTPException(422, "Could not transcribe audio")

    translation = await llm.translate(transcript)

    # TTS in the target language (opposite of detected source)
    target_lang = "fr" if src_lang == "th" else "th"
    audio_data = await tts.synthesize(translation, target_lang)

    return Response(
        content=audio_data,
        media_type="audio/mpeg",
        headers={
            "X-Transcript": quote(transcript),
            "X-Translation": quote(translation),
            "X-Source-Lang": src_lang,
        },
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=True,
        ssl_certfile=CERT_FILE,
        ssl_keyfile=KEY_FILE,
    )
