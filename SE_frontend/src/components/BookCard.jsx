import { Link } from "react-router-dom";
import { BookOpen, Heart, MessageSquare } from "lucide-react";

export default function BookCard({ book }) {
  const title = book.name || book.title || "Untitled Book";
  const author = book.author_name || book.author || "Unknown Author";
  const intro =
    book.intro ||
    book.description ||
    "No introduction has been provided for this book yet.";

  return (
    <Link
      to={`/books/${book.id}`}
      className="card overflow-hidden block hover:-translate-y-1 hover:shadow-xl transition"
    >
      <div className="h-64 bg-gradient-to-br from-clay-100 via-sand-100 to-white flex items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-white/80 backdrop-blur flex items-center justify-center shadow-sm">
          <BookOpen size={38} className="text-sand-700" />
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-black text-clay-600 line-clamp-1">{title}</h3>

        <p className="text-sm text-sand-500 mt-1">by {author}</p>

        <p className="text-sm text-sand-600 mt-3 leading-6 line-clamp-4">
          {intro}
        </p>

        <div className="flex items-center gap-4 text-xs text-sand-500 mt-4">
          <span className="inline-flex items-center gap-1">
            <BookOpen size={13} />
            Read
          </span>

          <span className="inline-flex items-center gap-1">
            <Heart size={13} />
            {book.like_count || 0}
          </span>

          <span className="inline-flex items-center gap-1">
            <MessageSquare size={13} />
            Comments
          </span>
        </div>
      </div>
    </Link>
  );
}