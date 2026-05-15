import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Heart,
  Menu,
  MessageCircle,
  MoreVertical,
  Music2,
  Play,
  Search,
  Send,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import {
  createScrap,
  createSentenceComment,
  getBook,
  getBookSentences,
  getSentenceComments,
} from "../services/api";

const fallbackBook = {
  id: 1,
  name: "Rich Dad Poor Dad",
  author_name: "Robert",
  intro:
    "Rich Dad Poor Dad explains the difference between assets and liabilities and encourages readers to build financial knowledge.",
};

const fallbackSentences = [
  {
    id: 1,
    chapter: 1,
    content:
      "Rich Dad Poor Dad is a personal finance book that explains how people think differently about money, work, and freedom.",
  },
  {
    id: 2,
    chapter: 1,
    content:
      "The poor dad believes that the safest path is to study hard, get a stable job, and depend on a monthly salary.",
  },
  {
    id: 3,
    chapter: 1,
    content:
      "The rich dad teaches that financial education is more important than simply earning a high income.",
  },
  {
    id: 4,
    chapter: 1,
    content:
      "The most important lesson is to understand the difference between assets and liabilities.",
  },
  {
    id: 5,
    chapter: 1,
    content:
      "Assets put money into your pocket, while liabilities take money out of your pocket.",
  },
  {
    id: 6,
    chapter: 1,
    content:
      "Instead of working only for money, people should learn how to make money work for them.",
  },
];

export default function Reader() {
  const { bookId } = useParams();

  const [book, setBook] = useState(fallbackBook);
  const [sentences, setSentences] = useState(fallbackSentences);
  const [selectedSentence, setSelectedSentence] = useState(null);

  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentError, setCommentError] = useState("");

  const [showComments, setShowComments] = useState(false);
  const [bookmarkedSentenceIds, setBookmarkedSentenceIds] = useState([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    getBook(bookId)
      .then((data) => {
        if (data) {
          setBook(data);
        }
      })
      .catch((error) => {
        console.warn("Failed to load book. Using fallback book.", error);
      });
  }, [bookId]);

  useEffect(() => {
    getBookSentences(bookId)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSentences(data);
        } else {
          setSentences(fallbackSentences);
        }
      })
      .catch((error) => {
        console.warn("Failed to load sentences. Using fallback sentences.", error);
        setSentences(fallbackSentences);
      });
  }, [bookId]);

  useEffect(() => {
    if (!selectedSentence?.id) return;

    getSentenceComments(selectedSentence.id)
      .then((data) => {
        setComments(Array.isArray(data) ? data : []);
        setCommentError("");
      })
      .catch((error) => {
        console.warn("Failed to load comments.", error);
        setComments([]);
        setCommentError(
          "댓글 API 연결에 실패했습니다. 화면에서는 임시 댓글 작성이 가능합니다."
        );
      });
  }, [selectedSentence]);

  const pages = useMemo(() => {
    const middle = Math.ceil(sentences.length / 2);

    return {
      left: sentences.slice(0, middle),
      right: sentences.slice(middle),
    };
  }, [sentences]);

  const title = book?.name || "Untitled Book";
  const author = book?.author_name || "Unknown Author";
  const intro = book?.intro || "No introduction.";

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  const openCommentBox = (sentence) => {
    setSelectedSentence(sentence);
    setShowComments(true);
  };

  const closeCommentBox = () => {
    if (commentInput.trim()) return;
    setShowComments(false);
  };

  const handleSubmitComment = async () => {
    const content = commentInput.trim();

    if (!content || !selectedSentence?.id) return;

    try {
      const newComment = await createSentenceComment(selectedSentence.id, content);

      setComments((prev) => [
        ...prev,
        newComment || {
          id: Date.now(),
          user_id: "me",
          content,
          like_count: 0,
        },
      ]);

      setCommentInput("");
      setCommentError("");
      showToast("Comment saved.");
    } catch (error) {
      console.warn("Comment save failed. Added locally.", error);

      setComments((prev) => [
        ...prev,
        {
          id: Date.now(),
          user_id: "me",
          content,
          like_count: 0,
        },
      ]);

      setCommentInput("");
      setCommentError("백엔드 저장 실패. 화면에만 임시로 추가했습니다.");
      showToast("Comment added locally.");
    }
  };

  const handleBookmark = async () => {
    if (!selectedSentence?.id) return;

    try {
      await createScrap(selectedSentence.id);

      setBookmarkedSentenceIds((prev) =>
        prev.includes(selectedSentence.id)
          ? prev
          : [...prev, selectedSentence.id]
      );

      showToast("This sentence has been bookmarked.");
    } catch (error) {
      console.warn("Bookmark API failed. Updated locally.", error);

      setBookmarkedSentenceIds((prev) =>
        prev.includes(selectedSentence.id)
          ? prev.filter((id) => id !== selectedSentence.id)
          : [...prev, selectedSentence.id]
      );

      showToast("Bookmark updated locally.");
    }
  };

  const renderCommentBox = (sentence) => {
    const isCurrentBookmarked = bookmarkedSentenceIds.includes(sentence.id);

    return (
      <div
        onMouseEnter={() => setShowComments(true)}
        onMouseLeave={closeCommentBox}
        className="absolute left-0 top-full mt-2 w-[420px] max-w-[90vw] bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-slate-100 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MessageCircle size={17} />
              <h3 className="text-sm font-bold">Sentence Comments</h3>
            </div>

            <p className="text-xs text-slate-400 mt-2 line-clamp-2">
              {sentence.content}
            </p>

            {commentError && (
              <p className="text-xs text-orange-500 mt-2">
                {commentError}
              </p>
            )}
          </div>

          <button
            onClick={() => setShowComments(false)}
            className="text-xs text-slate-400 hover:text-slate-700"
          >
            Close
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto">
          {comments.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">
              아직 댓글이 없습니다. 첫 댓글을 작성해보세요.
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="px-4 py-3 border-b border-slate-100 flex items-start gap-3"
              >
                <MessageCircle
                  size={18}
                  className="mt-1 text-slate-700"
                />

                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    User {comment.user_id || "Guest"}
                    <span className="text-xs text-slate-400 font-normal ml-2">
                      now
                    </span>
                  </p>

                  <p className="text-sm text-slate-600 mt-1 leading-5">
                    {comment.content}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                    <button className="inline-flex items-center gap-1 hover:text-blue-600">
                      <Heart size={13} />
                      {comment.like_count || 0}
                    </button>

                    <button className="hover:text-blue-600">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-3 flex items-center gap-2">
          <input
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmitComment();
            }}
            className="flex-1 text-sm outline-none"
            placeholder="Add a thought..."
          />

          <button
            onClick={handleSubmitComment}
            className="text-slate-500 hover:text-blue-600"
          >
            <Send size={16} />
          </button>

          <button
            onClick={handleBookmark}
            className={
              isCurrentBookmarked
                ? "text-yellow-500"
                : "text-slate-500 hover:text-yellow-500"
            }
          >
            <Bookmark
              size={16}
              fill={isCurrentBookmarked ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>
    );
  };

  const renderSentence = (sentence) => {
    const active = selectedSentence?.id === sentence.id && showComments;

    return (
      <p
        key={sentence.id}
        className="relative group"
        onMouseEnter={() => openCommentBox(sentence)}
        onMouseLeave={closeCommentBox}
      >
        <button
          onFocus={() => openCommentBox(sentence)}
          onClick={() => openCommentBox(sentence)}
          className={`text-left rounded px-1 leading-7 transition ${
            active
              ? "bg-blue-100 text-blue-800"
              : "hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          {sentence.content}
        </button>

        <span className="ml-2 opacity-0 group-hover:opacity-100 text-blue-500 transition">
          <MessageCircle size={14} className="inline" />
        </span>

        {active && renderCommentBox(sentence)}
      </p>
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f4ed] pb-28 text-slate-900">
      <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            to="/books"
            className="w-8 h-8 rounded-full hover:bg-slate-100 grid place-items-center"
          >
            <ArrowLeft size={17} />
          </Link>

          <div>
            <h1 className="text-sm font-semibold leading-4">{title}</h1>
            <p className="text-[11px] text-slate-500">by {author}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <Link
            to={`/books/${bookId}/edit`}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            Edit
          </Link>
          <Search size={16} />
          <Menu size={17} />
        </div>
      </header>

      <section className="max-w-6xl mx-auto mt-8 px-7">
        <article className="bg-[#fffdf9] border border-[#eee7da] min-h-[640px] px-8 py-10 shadow-sm relative">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="text-sm text-slate-500 mt-2">by {author}</p>
            <p className="max-w-3xl mx-auto text-sm text-slate-500 mt-4 leading-6">
              {intro}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 text-[14px] leading-7">
            <div className="space-y-5">
              {pages.left.map(renderSentence)}
            </div>

            <div className="space-y-5">
              {pages.right.map(renderSentence)}
            </div>
          </div>
        </article>
      </section>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-xl rounded-full px-12 py-4 text-sm text-slate-500 z-50">
          {toast}
        </div>
      )}

      <footer className="fixed left-0 right-0 bottom-0 bg-white border-t border-slate-200 h-[76px] z-40">
        <div className="h-1.5 bg-slate-100 relative">
          <div className="h-full bg-red-600 w-[42%]" />
          <div className="absolute left-[42%] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-600" />
        </div>

        <div className="max-w-6xl mx-auto px-6 h-[70px] flex items-center justify-between">
          <div className="flex items-center gap-3 w-72">
            <div className="w-11 h-11 border border-slate-300 bg-white grid place-items-center">
              <Music2 size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold">Reading Focus</p>
              <p className="text-[11px] text-slate-500">
                Music API will be added later
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-700">
            <SkipBack size={16} />

            <button className="w-9 h-9 rounded-full bg-slate-900 text-white grid place-items-center">
              <Play size={15} fill="currentColor" />
            </button>

            <SkipForward size={16} />
            <Volume2 size={16} />

            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="w-9 h-full bg-slate-900" />
            </div>

            <Menu size={16} />
            <MoreVertical size={16} />
          </div>
        </div>
      </footer>
    </main>
  );
}