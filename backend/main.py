from contextlib import asynccontextmanager
from urllib.parse import quote

import uvicorn
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

import db
import llm
import stt
import tts
from config import HOST, LANGUAGES, PORT


@asynccontextmanager
async def lifespan(app):
    await db.init_db()
    yield


app = FastAPI(title="Translator", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Transcript", "X-Translation", "X-Source-Lang"],
)


# ── Language detection ────────────────────────────────────────────────────────

def _detect_source_lang(text: str, lang_left: str, lang_right: str) -> str:
    """Detect whether text is in lang_left or lang_right using Unicode ranges."""
    for ch in text:
        if "฀" <= ch <= "๿":   # Thai
            return "th" if "th" in (lang_left, lang_right) else lang_left
        if "຀" <= ch <= "໿":   # Lao
            return "lo" if "lo" in (lang_left, lang_right) else lang_left
        if "Ѐ" <= ch <= "ӿ":   # Cyrillic (Russian)
            return "ru" if "ru" in (lang_left, lang_right) else lang_left
    # For Latin-script languages, try langdetect
    try:
        from langdetect import detect
        detected = detect(text)
        if detected == lang_left:
            return lang_left
        if detected == lang_right:
            return lang_right
    except Exception:
        pass
    return lang_left


# ── Translation endpoints ─────────────────────────────────────────────────────

class TranslateRequest(BaseModel):
    text: str
    lang_left: str = "fr"
    lang_right: str = "th"


@app.post("/translate")
async def translate_text(req: TranslateRequest):
    if not req.text.strip():
        raise HTTPException(400, "Empty text")
    if req.lang_left not in LANGUAGES or req.lang_right not in LANGUAGES:
        raise HTTPException(400, "Unknown language code")
    source_lang = _detect_source_lang(req.text, req.lang_left, req.lang_right)
    target_lang = req.lang_right if source_lang == req.lang_left else req.lang_left
    translation = await llm.translate(req.text, source_lang, target_lang)
    return {"translation": translation, "source_lang": source_lang}


@app.post("/voice")
async def voice_pipeline(
    audio: UploadFile = File(...),
    lang_left: str = Form("fr"),
    lang_right: str = Form("th"),
):
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(400, "Empty audio")

    transcript, src_lang = stt.transcribe(audio_bytes)
    if not transcript:
        raise HTTPException(422, "Could not transcribe audio")

    # Map Whisper's detected language to one of the two conversation languages
    if src_lang == lang_left:
        target_lang = lang_right
    elif src_lang == lang_right:
        target_lang = lang_left
    else:
        # Whisper detected a third language — treat as lang_left
        src_lang, target_lang = lang_left, lang_right

    translation = await llm.translate(transcript, src_lang, target_lang)
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


@app.post("/tts")
async def text_to_speech_endpoint(req: "TTSRequest"):
    if not req.text.strip():
        raise HTTPException(400, "Empty text")
    audio_data = await tts.synthesize(req.text, req.language)
    return Response(content=audio_data, media_type="audio/mpeg")


# ── Conversation endpoints ────────────────────────────────────────────────────

class TTSRequest(BaseModel):
    text: str
    language: str


class ConversationCreate(BaseModel):
    lang_left: str
    lang_right: str


class MessageCreate(BaseModel):
    source_lang: str
    source_text: str
    target_text: str


@app.get("/conversations")
async def get_conversations():
    return await db.list_conversations()


@app.post("/conversations", status_code=201)
async def post_conversation(body: ConversationCreate):
    return await db.create_conversation(body.lang_left, body.lang_right)


@app.delete("/conversations/{conv_id}", status_code=204)
async def del_conversation(conv_id: int):
    await db.delete_conversation(conv_id)


@app.get("/conversations/{conv_id}/messages")
async def get_messages(conv_id: int):
    return await db.list_messages(conv_id)


@app.post("/conversations/{conv_id}/messages", status_code=201)
async def post_message(conv_id: int, body: MessageCreate):
    return await db.add_message(conv_id, body.source_lang, body.source_text, body.target_text)


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True, reload_excludes=[".venv"])
