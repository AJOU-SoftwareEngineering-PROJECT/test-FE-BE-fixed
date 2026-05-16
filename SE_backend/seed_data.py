from datetime import datetime

from sqlalchemy import MetaData, Table, delete, insert, select
from sqlalchemy.exc import SQLAlchemyError

from db.database import engine, SessionLocal

try:
    from frontend_api.controller import hash_password
except Exception:
    import hashlib

    def hash_password(password: str) -> str:
        return hashlib.sha256(password.encode("utf-8")).hexdigest()


metadata = MetaData()


def find_table(tables, required_columns):
    for table in tables.values():
        columns = set(table.columns.keys())
        if required_columns.issubset(columns):
            return table

    return None


def now():
    return datetime.utcnow()


def table_insert(db, table: Table, values: dict):
    valid_columns = set(table.columns.keys())
    clean_values = {
        key: value for key, value in values.items() if key in valid_columns
    }

    result = db.execute(insert(table).values(**clean_values))

    if result.inserted_primary_key:
        return result.inserted_primary_key[0]

    primary_keys = list(table.primary_key.columns)

    if primary_keys:
        pk = primary_keys[0]
        row = db.execute(
            select(table).order_by(pk.desc()).limit(1)
        ).first()

        if row:
            return row[0][pk.name]

    return None


def safe_delete(db, table):
    try:
        db.execute(delete(table))
    except Exception as error:
        print(f"Skip delete {table.name}: {error}")


def seed():
    metadata.reflect(bind=engine)

    tables = metadata.tables

    user_table = find_table(
        tables,
        {"name", "email", "password_hash"},
    )

    book_table = find_table(
        tables,
        {"name", "author_name", "intro"},
    )

    sentence_table = find_table(
        tables,
        {"book_id", "content"},
    )

    comment_table = find_table(
        tables,
        {"sentence_id", "content", "user_name"},
    )

    scrap_table = find_table(
        tables,
        {"sentence_id", "user_name"},
    )

    playlist_table = find_table(
        tables,
        {"title", "description", "creator_name"},
    )

    playlist_song_table = find_table(
        tables,
        {"playlist_id", "title", "artist", "url"},
    )

    print("====================================")
    print("Detected tables:")
    print("User:", user_table.name if user_table is not None else "NOT FOUND")
    print("Book:", book_table.name if book_table is not None else "NOT FOUND")
    print("Sentence:", sentence_table.name if sentence_table is not None else "NOT FOUND")
    print("Comment:", comment_table.name if comment_table is not None else "NOT FOUND")
    print("Scrap:", scrap_table.name if scrap_table is not None else "NOT FOUND")
    print("Playlist:", playlist_table.name if playlist_table is not None else "NOT FOUND")
    print("Playlist Song:", playlist_song_table.name if playlist_song_table is not None else "NOT FOUND")
    print("====================================")

    required = [
        user_table,
        book_table,
        sentence_table,
        comment_table,
        scrap_table,
        playlist_table,
        playlist_song_table,
    ]

    if any(table is None for table in required):
        print("Some tables were not found.")
        print("Run backend once first:")
        print("uvicorn main:app --reload")
        return

    db = SessionLocal()

    try:
        # Delete child tables first
        safe_delete(db, playlist_song_table)
        safe_delete(db, playlist_table)
        safe_delete(db, scrap_table)
        safe_delete(db, comment_table)
        safe_delete(db, sentence_table)
        safe_delete(db, book_table)
        safe_delete(db, user_table)

        db.commit()

        # =========================
        # Users
        # =========================
        user1_id = table_insert(
            db,
            user_table,
            {
                "name": "Test User",
                "email": "test@example.com",
                "password_hash": hash_password("1234"),
                "gender": "MALE",
                "age": 22,
                "intro": "I like reading books with calm music.",
                "created_at": now(),
            },
        )

        user2_id = table_insert(
            db,
            user_table,
            {
                "name": "Admin User",
                "email": "admin@example.com",
                "password_hash": hash_password("1234"),
                "gender": "FEMALE",
                "age": 24,
                "intro": "Interactive reading platform administrator.",
                "created_at": now(),
            },
        )

        # =========================
        # Books
        # =========================
        book1_id = table_insert(
            db,
            book_table,
            {
                "name": "Rich Dad Poor Dad",
                "author_name": "Robert Kiyosaki",
                "intro": (
                    "Rich Dad Poor Dad explains how people think differently "
                    "about money, work, assets, liabilities, and financial freedom."
                ),
                "cover_url": "",
                "created_at": now(),
            },
        )

        book2_id = table_insert(
            db,
            book_table,
            {
                "name": "The Little Prince",
                "author_name": "Antoine de Saint-Exupery",
                "intro": (
                    "The Little Prince is a poetic story about friendship, love, "
                    "loneliness, and the way adults see the world."
                ),
                "cover_url": "",
                "created_at": now(),
            },
        )

        # =========================
        # Sentences
        # =========================
        rich_dad_sentences = [
            "Rich Dad Poor Dad is a personal finance book that explains how people think differently about money, work, and freedom.",
            "The poor dad believes that the safest path is to study hard, get a stable job, and depend on a monthly salary.",
            "The rich dad teaches that financial education is more important than simply earning a high income.",
            "The most important lesson is to understand the difference between assets and liabilities.",
            "Assets put money into your pocket, while liabilities take money out of your pocket.",
            "Instead of working only for money, people should learn how to make money work for them.",
            "Many people struggle financially because they buy things that look like assets but are actually liabilities.",
            "Financial freedom begins when passive income becomes greater than living expenses.",
            "The book encourages readers to improve their financial knowledge through practice and experience.",
            "Fear and desire often control the way people make decisions about money.",
        ]

        rich_sentence_ids = []

        for index, content in enumerate(rich_dad_sentences, start=1):
            sentence_id = table_insert(
                db,
                sentence_table,
                {
                    "book_id": book1_id,
                    "chapter": 1,
                    "content": content,
                    "order_index": index,
                    "created_at": now(),
                },
            )

            rich_sentence_ids.append(sentence_id)

        prince_sentences = [
            "Once when I was six years old I saw a magnificent picture in a book about the primeval forest.",
            "The picture showed a boa constrictor swallowing a wild animal.",
            "Grown-ups never understand anything by themselves, and it is tiring for children to explain things to them again and again.",
            "The little prince came from a very small planet, where he cared deeply for a single rose.",
            "He traveled from planet to planet and met different adults who each showed a strange way of thinking.",
            "Through his journey, he learned that what is truly important is often invisible to the eyes.",
        ]

        prince_sentence_ids = []

        for index, content in enumerate(prince_sentences, start=1):
            sentence_id = table_insert(
                db,
                sentence_table,
                {
                    "book_id": book2_id,
                    "chapter": 1,
                    "content": content,
                    "order_index": index,
                    "created_at": now(),
                },
            )

            prince_sentence_ids.append(sentence_id)

        # =========================
        # Comments
        # =========================
        table_insert(
            db,
            comment_table,
            {
                "sentence_id": rich_sentence_ids[0],
                "user_name": "Test User",
                "content": "This sentence clearly explains the main topic of the book.",
                "like_count": 2,
                "created_at": now(),
            },
        )

        table_insert(
            db,
            comment_table,
            {
                "sentence_id": rich_sentence_ids[3],
                "user_name": "Admin User",
                "content": "The difference between assets and liabilities is the key point.",
                "like_count": 5,
                "created_at": now(),
            },
        )

        table_insert(
            db,
            comment_table,
            {
                "sentence_id": prince_sentence_ids[2],
                "user_name": "Test User",
                "content": "This line is simple but very meaningful.",
                "like_count": 3,
                "created_at": now(),
            },
        )

        # =========================
        # Scraps
        # =========================
        table_insert(
            db,
            scrap_table,
            {
                "sentence_id": rich_sentence_ids[4],
                "user_name": "Test User",
                "created_at": now(),
            },
        )

        table_insert(
            db,
            scrap_table,
            {
                "sentence_id": prince_sentence_ids[5],
                "user_name": "Test User",
                "created_at": now(),
            },
        )

        # =========================
        # Playlists
        # =========================
        playlist1_id = table_insert(
            db,
            playlist_table,
            {
                "title": "Calm Reading Music",
                "description": "Soft music for reading finance and self-development books.",
                "creator_name": "Test User",
                "created_at": now(),
            },
        )

        playlist2_id = table_insert(
            db,
            playlist_table,
            {
                "title": "Emotional Story Music",
                "description": "Warm and emotional songs for literature reading.",
                "creator_name": "Admin User",
                "created_at": now(),
            },
        )

        # =========================
        # Songs
        # =========================
        table_insert(
            db,
            playlist_song_table,
            {
                "playlist_id": playlist1_id,
                "title": "Lofi Study",
                "artist": "Reading Music",
                "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4d/59/70/4d597041-b453-531f-171a-b874cb7de3a0/mzaf_15481364943360513552.plus.aac.p.m4a",
                "like_count": 8,
                "created_at": now(),
            },
        )

        table_insert(
            db,
            playlist_song_table,
            {
                "playlist_id": playlist1_id,
                "title": "Calm Piano",
                "artist": "Soft Piano",
                "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/ff/81/5f/ff815f70-6a2d-87f3-26c4-0d8c9e87a239/mzaf_15160998275548264842.plus.aac.p.m4a",
                "like_count": 5,
                "created_at": now(),
            },
        )

        table_insert(
            db,
            playlist_song_table,
            {
                "playlist_id": playlist2_id,
                "title": "Story Mood",
                "artist": "Emotional Reading",
                "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/f1/c6/87/f1c687cf-f0d7-976c-8700-9c1d820cdbf9/mzaf_9835063665616307732.plus.aac.p.m4a",
                "like_count": 3,
                "created_at": now(),
            },
        )

        db.commit()

        print("====================================")
        print("Seed data created successfully!")
        print("Login account:")
        print("Email: test@example.com")
        print("Password: 1234")
        print("------------------------------------")
        print("Admin account:")
        print("Email: admin@example.com")
        print("Password: 1234")
        print("====================================")

    except SQLAlchemyError as error:
        db.rollback()
        print("Seed data failed:", error)
        raise error

    finally:
        db.close()


if __name__ == "__main__":
    seed()