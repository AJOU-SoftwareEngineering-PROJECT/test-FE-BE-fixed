import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Heart,
  Menu,
  MessageCircle,
  Music2,
  Pause,
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
import BookBGMPanel from "../components/BookBGMPanel";

const emptyBook = {
  id: null,
  name: "Loading Book...",
  author_name: "Unknown Author",
  intro: "",
};

export default function Reader() {
  const { bookId } = useParams();
  const audioRef = useRef(null);

  const [book, setBook] = useState(emptyBook);
  const [sentences, setSentences] = useState([]);
  const [selectedSentence, setSelectedSentence] = useState(null);

  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentError, setCommentError] = useState("");

  const [showComments, setShowComments] = useState(false);
  const [bookmarkedSentenceIds, setBookmarkedSentenceIds] = useState([]);
  const [toast, setToast] = useState("");

  const [bookLoading, setBookLoading] = useState(true);
  const [sentenceLoading, setSentenceLoading] = useState(true);

  // ── Book BGM 패널
  const [bgmPanelOpen, setBgmPanelOpen] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    loadBook();
    loadSentences();
  }, [bookId]);

  const loadBook = () => {
    setBookLoading(true);

    getBook(bookId)
      .then((data) => {
        if (data) {
          setBook(data);
        }
      })
      .catch((error) => {
        console.error("Failed to load book:", error);
        setBook({
          id: null,
          name: "Book not found",
          author_name: "Unknown Author",
          intro: "책 정보를 불러오지 못했습니다.",
        });
      })
      .finally(() => {
        setBookLoading(false);
      });
  };

  const loadSentences = () => {
    setSentenceLoading(true);

    getBookSentences(bookId)
      .then((data) => {
        if (Array.isArray(data)) {
          setSentences(data);
        } else {
          setSentences([]);
        }
      })
      .catch((error) => {
        console.error("Failed to load sentences from DB:", error);
        setSentences([]);
      })
      .finally(() => {
        setSentenceLoading(false);
      });
  };

  useEffect(() => {
    if (!selectedSentence?.id) return;

    getSentenceComments(selectedSentence.id)
      .then((data) => {
        setComments(Array.isArray(data) ? data : []);
        setCommentError("");
      })
      .catch((error) => {
        console.error("Failed to load comments:", error);
        setComments([]);
        setCommentError(
          "댓글을 불러오지 못했습니다. 이 문장이 DB에 실제로 저장되어 있는지 확인하세요."
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

  const musicProgress =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  // ── 현재 곡이 변경되면 audio src 업데이트
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = currentSong?.url || "";
      audioRef.current.load();
    }
  }, [currentSong?.id, currentSong?.url]);

  const formatTime = (seconds) => {
    if (!seconds || Number.isNaN(seconds)) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const restSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(restSeconds).padStart(2, "0")}`;
  };

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
      const newComment = await createSentenceComment(
        selectedSentence.id,
        content
      );

      setComments((prev) => [...prev, newComment]);
      setCommentInput("");
      setCommentError("");
      showToast("Comment saved.");
    } catch (error) {
      console.error("Comment save failed:", error);
      setCommentError(
        "댓글 저장에 실패했습니다. sentence_id가 DB에 존재하는지 확인하세요."
      );
      showToast("Comment save failed.");
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
      console.error("Bookmark failed:", error);
      showToast("Bookmark failed or already exists.");
    }
  };

  // ── 하단 플레이어 재생/일시정지 토글
  const handleTogglePlay = async () => {
    if (!currentSong?.url) {
      setBgmPanelOpen(true);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio play failed:", error);
      setBgmPanelOpen(true);
      showToast("Audio play failed.");
    }
  };

  const renderCommentBox = (sentence) => {
    const isCurrentBookmarked = bookmarkedSentenceIds.includes(sentence.id);

    return (
      <div
        onMouseEnter={() => setShowComments(true)}
        onMouseLeave={closeCommentBox}
        className="absolute left-0 top-full mt-2 w-[420px] max-w-[90vw] bg-white border border-sand-200 shadow-xl rounded-xl z-50 overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-sand-100 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MessageCircle size={17} />
              <h3 className="text-sm font-bold">Sentence Comments</h3>
            </div>

            <p className="text-xs text-sand-400 mt-2 line-clamp-2">
              {sentence.content}
            </p>

            {commentError && (
              <p className="text-xs text-orange-500 mt-2">{commentError}</p>
            )}
          </div>

          <button
            onClick={() => setShowComments(false)}
            className="text-xs text-sand-400 hover:text-sand-700"
          >
            Close
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto">
          {comments.length === 0 ? (
            <div className="px-4 py-6 text-sm text-sand-500">
              아직 댓글이 없습니다. 첫 댓글을 작성해보세요.
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="px-4 py-3 border-b border-sand-100 flex items-start gap-3"
              >
                <MessageCircle size={18} className="mt-1 text-sand-700" />

                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {comment.user_name || `User ${comment.user_id || "Guest"}`}
                    <span className="text-xs text-sand-400 font-normal ml-2">
                      {comment.created_at
                        ? new Date(comment.created_at).toLocaleString()
                        : "now"}
                    </span>
                  </p>

                  <p className="text-sm text-sand-600 mt-1 leading-5">
                    {comment.content}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-sand-500 mt-2">
                    <button className="inline-flex items-center gap-1 hover:text-clay-600">
                      <Heart size={13} />
                      {comment.like_count || 0}
                    </button>

                    <button className="hover:text-clay-600">Reply</button>
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
            className="text-sand-500 hover:text-clay-600"
          >
            <Send size={16} />
          </button>

          <button
            onClick={handleBookmark}
            className={
              isCurrentBookmarked
                ? "text-yellow-500"
                : "text-sand-500 hover:text-yellow-500"
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
              ? "bg-clay-100 text-clay-800"
              : "hover:bg-clay-50 hover:text-clay-700"
          }`}
        >
          {sentence.content}
        </button>

        <span className="ml-2 opacity-0 group-hover:opacity-100 text-clay-500 transition">
          <MessageCircle size={14} className="inline" />
        </span>

        {active && renderCommentBox(sentence)}
      </p>
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f4ed] pb-28 text-sand-900">
      <audio
        ref={audioRef}
        src={currentSong?.url || ""}
        preload="metadata"
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime || 0);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      <header className="h-12 bg-white border-b border-sand-200 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            to="/books"
            className="w-8 h-8 rounded-full hover:bg-sand-100 grid place-items-center"
          >
            <ArrowLeft size={17} />
          </Link>

          <div>
            <h1 className="text-sm font-semibold leading-4">{title}</h1>
            <p className="text-[11px] text-sand-500">by {author}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sand-500">
          <Link
            to={`/books/${bookId}/edit`}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-sand-100 text-sand-600"
          >
            Edit
          </Link>
          <Search size={16} />
          {/* Book BGM 버튼 */}
          <button
            id="book-bgm-toggle"
            onClick={() => setBgmPanelOpen((prev) => !prev)}
            className={`w-8 h-8 rounded-full grid place-items-center transition ${
              bgmPanelOpen
                ? "bg-clay-600 text-white"
                : "hover:bg-sand-100 text-sand-500"
            }`}
            title="Book BGM 패널"
          >
            <Music2 size={17} />
          </button>
          <Menu size={17} />
        </div>
      </header>

      <section className="max-w-6xl mx-auto mt-8 px-7">
        <article className="bg-[#fffdf9] border border-[#eee7da] min-h-[640px] px-8 py-10 shadow-sm relative">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="text-sm text-sand-500 mt-2">by {author}</p>
            <p className="max-w-3xl mx-auto text-sm text-sand-500 mt-4 leading-6">
              {intro}
            </p>
          </div>

          {bookLoading || sentenceLoading ? (
            <div className="text-center py-20 text-sm text-sand-500">
              Loading book content from DB...
            </div>
          ) : sentences.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-bold text-sand-600">
                아직 이 책에 등록된 문장이 없습니다.
              </p>
              <p className="text-sm text-sand-500 mt-2">
                Create Book 페이지에서 문장을 추가하거나 backend DB에 sentence를
                추가하세요.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-12 text-[14px] leading-7">
              <div className="space-y-5">{pages.left.map(renderSentence)}</div>

              <div className="space-y-5">
                {pages.right.map(renderSentence)}
              </div>
            </div>
          )}
        </article>
      </section>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white border border-sand-200 shadow-xl rounded-full px-12 py-4 text-sm text-sand-500 z-50">
          {toast}
        </div>
      )}

      {/* ── Book BGM 우측 슬라이드 패널 */}
      {bgmPanelOpen && (
        <BookBGMPanel
          bookId={bookId}
          bookTitle={title}
          onClose={() => setBgmPanelOpen(false)}
          audioRef={audioRef}
          currentSong={currentSong}
          setCurrentSong={setCurrentSong}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
      )}

      {/* ── 하단 고정 플레이어 */}
      <footer className="fixed left-0 right-0 bottom-0 bg-white border-t border-sand-200 h-[76px] z-40">
        <div className="h-1.5 bg-sand-100 relative">
          <div
            className="h-full bg-red-600 transition-all duration-300"
            style={{ width: `${musicProgress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-600 transition-all duration-300"
            style={{ left: `calc(${musicProgress}% - 6px)` }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 h-[70px] flex items-center justify-between">
          {/* 현재 곡 정보 */}
          <button
            id="reader-bgm-footer-btn"
            onClick={() => setBgmPanelOpen((prev) => !prev)}
            className="flex items-center gap-3 w-72 text-left hover:bg-sand-50 rounded-xl px-2 py-1 transition"
          >
            <div
              className={`w-11 h-11 border grid place-items-center transition ${
                isPlaying
                  ? "border-clay-300 bg-clay-50 text-clay-600"
                  : "border-sand-300 bg-white"
              }`}
            >
              <Music2 size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">
                {currentSong
                  ? currentSong.title
                  : "Book BGM"}
              </p>
              <p className="text-[11px] text-sand-500 truncate">
                {currentSong
                  ? `${currentSong.artist} · ${isPlaying ? "재생 중" : "일시정지"}`
                  : "클릭해서 이 책의 BGM 열기"}
              </p>
            </div>
          </button>

          {/* 컨트롤 */}
          <div className="flex items-center gap-4 text-sand-700">
            <SkipBack size={16} />

            <button
              id="reader-play-btn"
              onClick={handleTogglePlay}
              className={`w-9 h-9 rounded-full text-white grid place-items-center ${
                isPlaying ? "bg-red-600" : "bg-sand-900"
              }`}
            >
              {isPlaying ? (
                <Pause size={15} fill="currentColor" />
              ) : (
                <Play size={15} fill="currentColor" />
              )}
            </button>

            <SkipForward size={16} />
            <Volume2 size={16} />

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-sand-500 w-9 text-right">
                {formatTime(currentTime)}
              </span>

              <div className="w-24 h-2 bg-sand-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isPlaying ? "bg-red-600" : "bg-sand-900"
                  }`}
                  style={{ width: `${musicProgress}%` }}
                />
              </div>

              <span className="text-[11px] text-sand-500 w-9">
                {formatTime(duration)}
              </span>
            </div>

            <button onClick={() => setBgmPanelOpen((prev) => !prev)}>
              <Menu size={16} />
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}