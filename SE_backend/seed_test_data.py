from db.database import SessionLocal, init_db
from db.model import User, Book, Sentence, Gender


def seed():
    init_db()
    db = SessionLocal()

    try:
        author = (
            db.query(User)
            .filter(User.email == "robert.kiyosaki@test.com")
            .first()
        )

        if not author:
            author = User(
                name="Robert",
                gender=Gender.MALE,
                age=77,
                intro=(
                    "Robert Kiyosaki is an American businessman and author "
                    "best known for writing about personal finance, investing, "
                    "and financial education."
                ),
                email="robert.kiyosaki@test.com",
            )

            db.add(author)
            db.commit()
            db.refresh(author)

            print(f"Created author: id={author.id}, name={author.name}")
        else:
            print(f"Author already exists: id={author.id}, name={author.name}")

        book = (
            db.query(Book)
            .filter(Book.name == "Rich Dad Poor Dad")
            .first()
        )

        if not book:
            book = Book(
                name="Rich Dad Poor Dad",
                intro=(
                    "Rich Dad Poor Dad is a famous personal finance book that "
                    "explains the different mindsets between people who work only "
                    "for money and people who learn how to make money work for them. "
                    "The book compares two father figures: the poor dad, who believes "
                    "in stable jobs and traditional education, and the rich dad, who "
                    "teaches financial independence, investing, assets, and business "
                    "thinking. Through simple stories, the book encourages readers to "
                    "understand the difference between assets and liabilities, build "
                    "financial knowledge, and think more actively about money, work, "
                    "and freedom."
                ),
                author_id=author.id,
            )

            db.add(book)
            db.commit()
            db.refresh(book)

            print(f"Created book: id={book.id}, name={book.name}")
        else:
            print(f"Book already exists: id={book.id}, name={book.name}")

        existing_sentence = (
            db.query(Sentence)
            .filter(Sentence.book_id == book.id)
            .first()
        )

        if not existing_sentence:
            sentences = [
                Sentence(
                    chapter=1,
                    content=(
                        "Money is not just something people earn and spend; "
                        "it is also something people must learn to understand."
                    ),
                    book_id=book.id,
                ),
                Sentence(
                    chapter=1,
                    content=(
                        "The poor dad believed that a stable job was the safest path, "
                        "while the rich dad believed that financial education could create freedom."
                    ),
                    book_id=book.id,
                ),
                Sentence(
                    chapter=1,
                    content=(
                        "The most important lesson is to know the difference between "
                        "assets and liabilities."
                    ),
                    book_id=book.id,
                ),
                Sentence(
                    chapter=1,
                    content=(
                        "Assets put money into your pocket, while liabilities take money "
                        "out of your pocket."
                    ),
                    book_id=book.id,
                ),
                Sentence(
                    chapter=1,
                    content=(
                        "Instead of working only for money, the book encourages readers "
                        "to build systems, investments, and knowledge that can work for them."
                    ),
                    book_id=book.id,
                ),
                Sentence(
                    chapter=1,
                    content=(
                        "Financial freedom begins when people start making decisions based "
                        "on knowledge, not only on fear or habit."
                    ),
                    book_id=book.id,
                ),
            ]

            db.add_all(sentences)
            db.commit()

            print("Created sample sentences.")
        else:
            print("Sample sentences already exist.")

        print("Seed completed successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()