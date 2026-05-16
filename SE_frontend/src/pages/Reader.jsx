import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  ExternalLink,
  Heart,
  Menu,
  MessageCircle,
  MoreVertical,
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
  getPlaylists,
  likePlaylistSong,
} from "../services/api";

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

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [musicLoading, setMusicLoading] = useState(true);
  const [musicPanelOpen, setMusicPanelOpen] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    loadBook();
    loadSentences();
    loadPlaylistsFromDB();
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

  const loadPlaylistsFromDB = () => {
    setMusicLoading(true);

    getPlaylists()
      .then((data) => {
        const items = Array.isArray(data) ? data : [];

        setPlaylists(items);

        if (items.length > 0) {
          setSelectedPlaylistId((prev) => prev || String(items[0].id));
        } else {
          setSelectedPlaylistId("");
        }
      })
      .catch((error) => {
        console.error("Failed to load playlists from DB:", error);
        setPlaylists([]);
        setSelectedPlaylistId("");
      })
      .finally(() => {
        setMusicLoading(false);
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

  const selectedPlaylist = useMemo(() => {
    return (
      playlists.find(
        (playlist) => String(playlist.id) === String(selectedPlaylistId)
      ) || null
    );
  }, [playlists, selectedPlaylistId]);

  const playlistSongs = selectedPlaylist?.songs || [];
  const currentSong = playlistSongs.length > 0 ? playlistSongs[0] : null;

  const title = book?.name || "Untitled Book";
  const author = book?.author_name || "Unknown Author";
  const intro = book?.intro || "No introduction.";

  const musicProgress =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
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

  const handleLikeMusic = async (songId) => {
    try {
      await likePlaylistSong(songId);
      loadPlaylistsFromDB();
      showToast("Music liked.");
    } catch (error) {
      console.error("Music like failed:", error);
      showToast("Music like failed.");
    }
  };

  const handleTogglePlay = async () => {
    if (!currentSong?.url) {
      setMusicPanelOpen(true);
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
      setMusicPanelOpen(true);
      showToast("Audio play failed.");
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
              <p className="text-xs text-orange-500 mt-2">{commentError}</p>
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
                <MessageCircle size={18} className="mt-1 text-slate-700" />

                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {comment.user_name || `User ${comment.user_id || "Guest"}`}
                    <span className="text-xs text-slate-400 font-normal ml-2">
                      {comment.created_at
                        ? new Date(comment.created_at).toLocaleString()
                        : "now"}
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

                    <button className="hover:text-blue-600">Reply</button>
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

          {bookLoading || sentenceLoading ? (
            <div className="text-center py-20 text-sm text-slate-500">
              Loading book content from DB...
            </div>
          ) : sentences.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-bold text-slate-600">
                아직 이 책에 등록된 문장이 없습니다.
              </p>
              <p className="text-sm text-slate-500 mt-2">
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
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-xl rounded-full px-12 py-4 text-sm text-slate-500 z-50">
          {toast}
        </div>
      )}

      {musicPanelOpen && (
        <div className="fixed right-6 bottom-[92px] w-[420px] max-w-[92vw] bg-white border border-slate-200 shadow-2xl rounded-2xl z-50 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black flex items-center gap-2">
                <Music2 size={17} />
                Playlist from DB
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                /api/playlists 데이터와 연결됨
              </p>
            </div>

            <button
              onClick={() => setMusicPanelOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Close
            </button>
          </div>

          <div className="p-4">
            {musicLoading ? (
              <p className="text-sm text-slate-500">Loading playlists...</p>
            ) : playlists.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-5 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  No playlist yet
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Playlists 페이지에서 먼저 playlist와 song을 추가하세요.
                </p>
              </div>
            ) : (
              <>
                <select
                  value={selectedPlaylistId}
                  onChange={(event) =>
                    setSelectedPlaylistId(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none mb-4 bg-white"
                >
                  {playlists.map((playlist) => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.title} ({playlist.song_count || 0})
                    </option>
                  ))}
                </select>

                {!selectedPlaylist || playlistSongs.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-5 text-center">
                    <p className="text-sm font-semibold text-slate-600">
                      No songs in this playlist
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      선택한 playlist에 아직 song이 없습니다.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {playlistSongs
                      .slice()
                      .sort((a, b) => b.like_count - a.like_count)
                      .map((song, index) => (
                        <div
                          key={song.id}
                          className="rounded-xl border border-slate-100 px-4 py-3 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-[11px] font-black text-red-600">
                              #{index + 1}
                            </p>
                            <p className="text-sm font-bold truncate">
                              {song.title}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {song.artist}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {song.url && (
                              <button
                                onClick={() => {
                                  setSelectedPlaylistId(String(selectedPlaylist.id));
                                  handleTogglePlay();
                                }}
                                className="w-8 h-8 rounded-lg bg-slate-900 text-white grid place-items-center hover:bg-slate-700"
                                title="Play this song"
                              >
                                <Play size={13} fill="currentColor" />
                              </button>
                            )}

                            {song.url && (
                              <a
                                href={song.url}
                                target="_blank"
                                rel="noreferrer"
                                className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center hover:bg-blue-100"
                                title="Open original link"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}

                            <button
                              onClick={() => handleLikeMusic(song.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-50 text-red-600 px-2 py-2 text-xs font-bold hover:bg-red-100"
                            >
                              <Heart size={13} />
                              {song.like_count || 0}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <footer className="fixed left-0 right-0 bottom-0 bg-white border-t border-slate-200 h-[76px] z-40">
        <div className="h-1.5 bg-slate-100 relative">
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
          <button
            onClick={() => setMusicPanelOpen((prev) => !prev)}
            className="flex items-center gap-3 w-72 text-left hover:bg-slate-50 rounded-xl px-2 py-1 transition"
          >
            <div className="w-11 h-11 border border-slate-300 bg-white grid place-items-center">
              <Music2 size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">
                {musicLoading
                  ? "Loading playlist..."
                  : currentSong
                  ? currentSong.title
                  : selectedPlaylist
                  ? selectedPlaylist.title
                  : "No playlist"}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {currentSong
                  ? `${currentSong.artist} · ${
                      isPlaying ? "Playing" : "Paused"
                    }`
                  : playlists.length > 0
                  ? "Click to choose music"
                  : "Add songs in Playlists page"}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-4 text-slate-700">
            <SkipBack size={16} />

            <button
              onClick={handleTogglePlay}
              className={`w-9 h-9 rounded-full text-white grid place-items-center ${
                isPlaying ? "bg-red-600" : "bg-slate-900"
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
              <span className="text-[11px] text-slate-500 w-9 text-right">
                {formatTime(currentTime)}
              </span>

              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isPlaying ? "bg-red-600" : "bg-slate-900"
                  }`}
                  style={{ width: `${musicProgress}%` }}
                />
              </div>

              <span className="text-[11px] text-slate-500 w-9">
                {formatTime(duration)}
              </span>
            </div>

            <button onClick={() => setMusicPanelOpen((prev) => !prev)}>
              <Menu size={16} />
            </button>

            <MoreVertical size={16} />
          </div>
        </div>
      </footer>
    </main>
  );
}