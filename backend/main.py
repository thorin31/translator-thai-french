from contextlib import asynccontextmanager
from urllib.parse import quote

import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

import db
import llm
import stt
import tts
from config import HOST, PORT


@asynccontextmanager
async def lifespan(app):
    await db.init_db()
    yield


app = FastAPI(title="Translator Thai-French", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Transcript", "X-Translation", "X-Source-Lang"],
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _detect_lang(text: str) -> str:
    return "th" if any("฀" <= ch <= "๿" for ch in text) else "fr"


# ── Translation endpoints ─────────────────────────────────────────────────────

class TranslateRequest(BaseModel):
    text: str


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


# ── Conversation endpoints ────────────────────────────────────────────────────

class ConversationCreate(BaseModel):
    primary_lang: str


class MessageCreate(BaseModel):
    source_lang: str
    source_text: str
    target_text: str


@app.get("/conversations")
async def get_conversations():
    return await db.list_conversations()


@app.post("/conversations", status_code=201)
async def post_conversation(body: ConversationCreate):
    return await db.create_conversation(body.primary_lang)


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
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
