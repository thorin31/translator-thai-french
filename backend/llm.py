import httpx
from config import OLLAMA_BASE_URL, OLLAMA_MODEL, LANGUAGES

_PROMPT = (
    "You are a professional translator. "
    "Translate the following {source_name} text into {target_name}. "
    "Reply with ONLY the translation — no explanation, no extra text.\n\n"
    "Text: {text}"
)


async def translate(text: str, source_lang: str, target_lang: str) -> str:
    source_name = LANGUAGES.get(source_lang, {}).get("name", source_lang)
    target_name = LANGUAGES.get(target_lang, {}).get("name", target_lang)
    prompt = _PROMPT.format(text=text, source_name=source_name, target_name=target_name)
    async with httpx.AsyncClient(timeout=300.0) as client:
        r = await client.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model": OLLAMA_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False,
            },
        )
        r.raise_for_status()
        return r.json()["message"]["content"].strip()
