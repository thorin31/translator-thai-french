import httpx
from config import OLLAMA_BASE_URL, OLLAMA_MODEL

_PROMPT = (
    "You are a translator between Thai and French. "
    "If the input is in Thai, translate it to French. "
    "If the input is in French, translate it to Thai. "
    "Reply with ONLY the translation — no explanation, no extra text.\n\n"
    "Text: {text}"
)


async def translate(text: str) -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model": OLLAMA_MODEL,
                "messages": [{"role": "user", "content": _PROMPT.format(text=text)}],
                "stream": False,
            },
        )
        r.raise_for_status()
        return r.json()["message"]["content"].strip()
