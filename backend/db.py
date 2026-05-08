import os
from datetime import datetime, timezone

import aiosqlite

DB_PATH = os.path.join(os.path.dirname(__file__), "translator.db")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("PRAGMA foreign_keys = ON")

        # Check existing conversations columns for migration
        async with db.execute("PRAGMA table_info(conversations)") as cur:
            cols = {row[1] for row in await cur.fetchall()}

        if not cols:
            # Fresh database
            await db.execute("""
                CREATE TABLE conversations (
                    id         INTEGER PRIMARY KEY AUTOINCREMENT,
                    lang_left  TEXT    NOT NULL,
                    lang_right TEXT    NOT NULL,
                    created_at TEXT    NOT NULL
                )
            """)
        elif "primary_lang" in cols and "lang_left" not in cols:
            # Migrate: rename primary_lang → lang_left, infer lang_right
            await db.execute("ALTER TABLE conversations RENAME COLUMN primary_lang TO lang_left")
            await db.execute("ALTER TABLE conversations ADD COLUMN lang_right TEXT NOT NULL DEFAULT ''")
            await db.execute("""
                UPDATE conversations
                SET lang_right = CASE WHEN lang_left = 'th' THEN 'fr' ELSE 'th' END
            """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                source_lang     TEXT    NOT NULL,
                source_text     TEXT    NOT NULL,
                target_text     TEXT    NOT NULL,
                created_at      TEXT    NOT NULL
            )
        """)
        await db.commit()


async def list_conversations() -> list[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT id, lang_left, lang_right, created_at FROM conversations ORDER BY created_at DESC"
        ) as cur:
            return [dict(r) for r in await cur.fetchall()]


async def create_conversation(lang_left: str, lang_right: str) -> dict:
    now = _now()
    async with aiosqlite.connect(DB_PATH) as db:
        cur = await db.execute(
            "INSERT INTO conversations (lang_left, lang_right, created_at) VALUES (?, ?, ?)",
            (lang_left, lang_right, now),
        )
        await db.commit()
        return {"id": cur.lastrowid, "lang_left": lang_left, "lang_right": lang_right, "created_at": now}


async def delete_conversation(conv_id: int):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("PRAGMA foreign_keys = ON")
        await db.execute("DELETE FROM conversations WHERE id = ?", (conv_id,))
        await db.commit()


async def list_messages(conv_id: int) -> list[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """SELECT id, source_lang, source_text, target_text, created_at
               FROM messages WHERE conversation_id = ? ORDER BY created_at ASC""",
            (conv_id,),
        ) as cur:
            return [dict(r) for r in await cur.fetchall()]


async def add_message(conv_id: int, source_lang: str, source_text: str, target_text: str) -> dict:
    now = _now()
    async with aiosqlite.connect(DB_PATH) as db:
        cur = await db.execute(
            """INSERT INTO messages (conversation_id, source_lang, source_text, target_text, created_at)
               VALUES (?, ?, ?, ?, ?)""",
            (conv_id, source_lang, source_text, target_text, now),
        )
        await db.commit()
        return {
            "id": cur.lastrowid,
            "conversation_id": conv_id,
            "source_lang": source_lang,
            "source_text": source_text,
            "target_text": target_text,
            "created_at": now,
        }
