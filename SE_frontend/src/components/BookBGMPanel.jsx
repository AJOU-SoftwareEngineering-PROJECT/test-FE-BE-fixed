import { useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  Heart,
  Music2,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  addPlaylistSong,
  createBookPlaylist,
  deletePlaylist,
  deletePlaylistSong,
  getBookPlaylists,
  likePlaylistSong,
  searchMusic,
} from "../services/api";

/**
 * BookBGMPanel — 독서 화면 우측에 표시되는 책 전용 BGM 패널
 *
 * Props:
 *   bookId      — 현재 책 ID
 *   bookTitle   — 헤더에 표시할 책 제목
 *   onClose     — 패널 닫기 콜백
 *   audioRef    — 공유 audio 요소 ref (Reader.jsx와 공유)
 *   currentSong — 현재 재생 중인 곡 객체
 *   setCurrentSong — 재생 곡 변경 함수
 *   isPlaying   — 재생 상태
 *   setIsPlaying — 재생 상태 변경 함수
 */
export default function BookBGMPanel({
  bookId,
  bookTitle,
  onClose,
  audioRef,
  currentSong,
  setCurrentSong,
  isPlaying,
  setIsPlaying,
}) {
  // ── 탭: "playlist" | "search" | "create"
  const [tab, setTab] = useState("playlist");

  // ── 플레이리스트 상태
  const [playlists, setPlaylists] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── 플레이리스트 생성 폼
  const [createForm, setCreateForm] = useState({ title: "", description: "" });
  const [creating, setCreating] = useState(false);

  // ── iTunes 검색 상태
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState(null); // 추가 중인 song preview_url

  // ── 오류 메시지
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ── 컴포넌트 마운트 / bookId 변경 시 데이터 로드
  useEffect(() => {
    if (!bookId) return;
    loadPlaylists();
  }, [bookId]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 3000);
  };

  // ── 플레이리스트 로드
  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const data = await getBookPlaylists(bookId);
      const items = Array.isArray(data) ? data : [];
      setPlaylists(items);
      if (items.length > 0) {
        setSelectedId((prev) => prev || items[0].id);
        setTab("playlist");
      } else {
        setSelectedId(null);
        setTab("create");
      }
    } catch (err) {
      console.error("Failed to load book playlists:", err);
      showError("플레이리스트를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlaylist =
    playlists.find((p) => p.id === selectedId) || null;

  const songs = selectedPlaylist?.songs || [];

  // ── 플레이리스트 생성
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim()) {
      showError("플레이리스트 이름을 입력하세요.");
      return;
    }
    setCreating(true);
    try {
      const created = await createBookPlaylist(bookId, {
        title: createForm.title.trim(),
        description: createForm.description.trim(),
      });
      setCreateForm({ title: "", description: "" });
      setSelectedId(created.id);
      await loadPlaylists();
      setTab("playlist");
      showSuccess("플레이리스트가 생성되었습니다!");
    } catch (err) {
      console.error(err);
      showError("생성에 실패했습니다. 다시 시도하세요.");
    } finally {
      setCreating(false);
    }
  };

  // ── iTunes 음악 검색
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const results = await searchMusic(keyword.trim());
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (err) {
      console.error(err);
      showError("음악 검색에 실패했습니다.");
    } finally {
      setSearching(false);
    }
  };

  // ── 검색 결과에서 플레이리스트에 곡 추가
  const handleAddFromSearch = async (song) => {
    if (!selectedPlaylist) {
      showError("먼저 플레이리스트를 선택하거나 생성하세요.");
      return;
    }
    setAddingId(song.preview_url);
    try {
      await addPlaylistSong(selectedPlaylist.id, {
        title: song.title,
        artist: song.artist,
        url: song.preview_url,
      });
      await loadPlaylists();
      showSuccess(`"${song.title}"이(가) 추가되었습니다.`);
    } catch (err) {
      console.error(err);
      showError("곡 추가에 실패했습니다.");
    } finally {
      setAddingId(null);
    }
  };

  // ── 좋아요
  const handleLike = async (songId) => {
    try {
      await likePlaylistSong(songId);
      await loadPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  // ── 곡 삭제
  const handleDeleteSong = async (songId) => {
    if (!window.confirm("이 곡을 삭제하시겠습니까?")) return;
    try {
      await deletePlaylistSong(songId);
      if (currentSong?.id === songId) {
        setCurrentSong(null);
        setIsPlaying(false);
        if (audioRef?.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
      }
      await loadPlaylists();
    } catch (err) {
      console.error(err);
      showError("곡 삭제에 실패했습니다.");
    }
  };

  // ── 플레이리스트 삭제
  const handleDeletePlaylist = async () => {
    if (!selectedPlaylist) return;
    if (
      !window.confirm(
        `"${selectedPlaylist.title}" 플레이리스트를 삭제할까요? 포함된 곡도 모두 삭제됩니다.`
      )
    )
      return;
    try {
      await deletePlaylist(selectedPlaylist.id);
      setSelectedId(null);
      setCurrentSong(null);
      setIsPlaying(false);
      if (audioRef?.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      await loadPlaylists();
    } catch (err) {
      console.error(err);
      showError("플레이리스트 삭제에 실패했습니다.");
    }
  };

  // ── 재생 제어
  const handlePlaySong = async (song) => {
    if (!song?.url) return;

    const audio = audioRef?.current;
    if (!audio) return;

    if (currentSong?.id === song.id) {
      // 같은 곡 → 토글
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (err) {
          console.error(err);
        }
      }
    } else {
      // 다른 곡 → 전환 후 재생
      setCurrentSong(song);
      setIsPlaying(false);
      // src 변경은 Reader.jsx의 useEffect에서 처리됨
      // 약간의 딜레이 후 재생 시도
      setTimeout(async () => {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (err) {
          console.error("Auto-play blocked:", err);
        }
      }, 150);
    }
  };

  // ────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────
  return (
    <div
      id="book-bgm-panel"
      className="fixed right-0 top-0 h-full w-[380px] max-w-[95vw] bg-white border-l border-sand-200 shadow-2xl z-50 flex flex-col"
      style={{ fontFamily: "inherit" }}
    >
      {/* ── 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-sand-100 bg-gradient-to-r from-clay-50 to-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-clay-600 text-white flex items-center justify-center shadow">
            <Music2 size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black text-sand-900">Book BGM</h2>
            <p className="text-[11px] text-sand-400 truncate max-w-[200px]">
              {bookTitle || "이 책 전용 플레이리스트"}
            </p>
          </div>
        </div>
        <button
          id="book-bgm-panel-close"
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-sand-100 grid place-items-center text-sand-400 hover:text-sand-700 transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── 알림 메시지 */}
      {(error || successMsg) && (
        <div
          className={`mx-4 mt-3 px-4 py-2 rounded-xl text-xs font-semibold ${
            error
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-700"
          }`}
        >
          {error || successMsg}
        </div>
      )}

      {/* ── 탭 */}
      <div className="flex gap-1 px-4 pt-3 pb-0 shrink-0">
        {[
          { key: "playlist", label: "🎵 플레이리스트" },
          { key: "search", label: "🔍 음악 검색" },
          { key: "create", label: "➕ 새 목록" },
        ].map(({ key, label }) => (
          <button
            key={key}
            id={`bgm-tab-${key}`}
            onClick={() => setTab(key)}
            className={`px-3 py-2 rounded-t-lg text-xs font-bold transition border-b-2 ${
              tab === key
                ? "border-clay-600 text-clay-700 bg-clay-50"
                : "border-transparent text-sand-500 hover:text-sand-700 hover:bg-sand-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="border-b border-sand-100 mx-4" />

      {/* ── 탭 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ────────── 탭: 플레이리스트 ────────── */}
        {tab === "playlist" && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin w-6 h-6 rounded-full border-2 border-clay-200 border-t-clay-600" />
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-16">
                <Music2 size={44} className="mx-auto text-sand-200 mb-4" />
                <p className="font-black text-sand-600 text-sm">
                  아직 플레이리스트가 없어요
                </p>
                <p className="text-xs text-sand-400 mt-2 mb-5">
                  이 책 전용 BGM을 만들어보세요
                </p>
                <button
                  onClick={() => setTab("create")}
                  className="inline-flex items-center gap-2 bg-clay-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-clay-700 transition"
                >
                  <Plus size={15} />
                  첫 플레이리스트 만들기
                </button>
              </div>
            ) : (
              <>
                {/* 플레이리스트 선택 드롭다운 */}
                {playlists.length > 1 && (
                  <select
                    id="bgm-playlist-select"
                    value={selectedId || ""}
                    onChange={(e) => setSelectedId(Number(e.target.value))}
                    className="w-full rounded-xl border border-sand-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-clay-100 bg-white"
                  >
                    {playlists.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.title} ({pl.song_count}곡)
                      </option>
                    ))}
                  </select>
                )}

                {/* 선택된 플레이리스트 헤더 */}
                {selectedPlaylist && (
                  <div className="rounded-2xl bg-gradient-to-br from-clay-50 to-sand-50 border border-clay-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-sand-900 text-sm">
                          {selectedPlaylist.title}
                        </p>
                        {selectedPlaylist.description && (
                          <p className="text-xs text-sand-500 mt-1 leading-5">
                            {selectedPlaylist.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] text-sand-400 mt-2">
                          <span>{selectedPlaylist.song_count}곡</span>
                          <span>♥ {selectedPlaylist.total_likes}</span>
                          <span>{selectedPlaylist.creator_name}</span>
                        </div>
                      </div>
                      <button
                        onClick={handleDeletePlaylist}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition shrink-0"
                        title="플레이리스트 삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 곡 목록 */}
                {songs.length === 0 ? (
                  <div className="text-center py-8 rounded-2xl bg-sand-50">
                    <p className="text-sm text-sand-500 mb-3">
                      아직 곡이 없습니다.
                    </p>
                    <button
                      onClick={() => setTab("search")}
                      className="inline-flex items-center gap-2 text-clay-600 text-sm font-bold hover:underline"
                    >
                      <Search size={14} />
                      iTunes에서 음악 검색
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {songs
                      .slice()
                      .sort((a, b) => b.like_count - a.like_count)
                      .map((song, idx) => {
                        const isThisPlaying =
                          currentSong?.id === song.id && isPlaying;
                        return (
                          <div
                            key={song.id}
                            id={`bgm-song-${song.id}`}
                            className={`rounded-2xl border p-3 flex items-center gap-3 transition ${
                              currentSong?.id === song.id
                                ? "border-clay-200 bg-clay-50"
                                : "border-sand-100 hover:bg-sand-50"
                            }`}
                          >
                            {/* 순위 */}
                            <div className="w-7 h-7 rounded-lg bg-sand-100 text-sand-600 flex items-center justify-center text-xs font-black shrink-0">
                              {idx + 1}
                            </div>

                            {/* 곡 정보 */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-sand-800 truncate">
                                {song.title}
                              </p>
                              <p className="text-[11px] text-sand-500 truncate">
                                {song.artist}
                              </p>
                            </div>

                            {/* 재생 버튼 */}
                            {song.url && (
                              <button
                                id={`bgm-play-${song.id}`}
                                onClick={() => handlePlaySong(song)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition shrink-0 ${
                                  isThisPlaying
                                    ? "bg-red-500 text-white"
                                    : "bg-sand-900 text-white hover:bg-sand-700"
                                }`}
                                title={isThisPlaying ? "일시정지" : "재생"}
                              >
                                {isThisPlaying ? (
                                  <Pause size={13} fill="currentColor" />
                                ) : (
                                  <Play size={13} fill="currentColor" />
                                )}
                              </button>
                            )}

                            {/* 외부 링크 */}
                            {song.url && (
                              <a
                                href={song.url}
                                target="_blank"
                                rel="noreferrer"
                                className="w-8 h-8 rounded-lg bg-clay-50 text-clay-600 flex items-center justify-center hover:bg-clay-100 transition shrink-0"
                                title="미리듣기 링크"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}

                            {/* 좋아요 */}
                            <button
                              id={`bgm-like-${song.id}`}
                              onClick={() => handleLike(song.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-50 text-red-500 px-2 py-1.5 text-[11px] font-bold hover:bg-red-100 transition shrink-0"
                            >
                              <Heart size={12} />
                              {song.like_count}
                            </button>

                            {/* 삭제 */}
                            <button
                              onClick={() => handleDeleteSong(song.id)}
                              className="w-7 h-7 rounded-lg text-sand-300 hover:text-red-400 flex items-center justify-center transition shrink-0"
                              title="삭제"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* 이 플레이리스트에 검색으로 추가 CTA */}
                <button
                  onClick={() => setTab("search")}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-clay-200 text-clay-500 hover:border-clay-400 hover:text-clay-700 py-3 text-sm font-bold transition"
                >
                  <Search size={15} />
                  iTunes 음악 검색으로 곡 추가
                </button>
              </>
            )}
          </>
        )}

        {/* ────────── 탭: iTunes 음악 검색 ────────── */}
        {tab === "search" && (
          <>
            {!selectedPlaylist && playlists.length > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
                플레이리스트 탭에서 목록을 선택한 뒤 곡을 추가하세요.
              </div>
            )}

            {playlists.length === 0 && (
              <div className="rounded-xl bg-clay-50 border border-clay-100 px-4 py-3 text-xs text-clay-700 flex items-center gap-2">
                <Plus size={14} />
                먼저 플레이리스트를 생성하면 검색 결과를 바로 추가할 수 있습니다.
                <button
                  onClick={() => setTab("create")}
                  className="ml-auto font-bold underline"
                >
                  만들기
                </button>
              </div>
            )}

            <form
              onSubmit={handleSearch}
              className="flex gap-2"
              id="bgm-search-form"
            >
              <input
                id="bgm-search-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 rounded-xl border border-sand-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-clay-100"
                placeholder="lofi, piano, 재즈, 팝 등..."
              />
              <button
                id="bgm-search-btn"
                type="submit"
                disabled={searching}
                className="bg-clay-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-clay-700 disabled:opacity-50 transition"
              >
                {searching ? "검색 중..." : "검색"}
              </button>
            </form>

            {searching && (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin w-6 h-6 rounded-full border-2 border-clay-200 border-t-clay-600" />
              </div>
            )}

            {!searching && searchResults.length === 0 && keyword && (
              <p className="text-center text-sm text-sand-400 py-8">
                검색 결과가 없습니다.
              </p>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] text-sand-400 font-semibold">
                  {searchResults.length}개 결과 — 클릭해서{" "}
                  <span className="text-clay-600">
                    {selectedPlaylist
                      ? `"${selectedPlaylist.title}"`
                      : "플레이리스트"}
                  </span>
                  에 추가
                </p>

                {searchResults.map((song, idx) => (
                  <div
                    key={`${song.preview_url}-${idx}`}
                    id={`bgm-result-${idx}`}
                    className="rounded-2xl border border-sand-100 p-3"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {song.artwork_url ? (
                        <img
                          src={song.artwork_url}
                          alt={song.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-clay-50 flex items-center justify-center text-clay-400 shrink-0">
                          <Music2 size={18} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sand-800 text-sm truncate">
                          {song.title}
                        </p>
                        <p className="text-xs text-sand-500 truncate">
                          {song.artist}
                        </p>
                        <p className="text-[11px] text-sand-400 truncate">
                          {song.album}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* 미리듣기 */}
                      <audio
                        controls
                        src={song.preview_url}
                        className="flex-1 h-8"
                        style={{ minWidth: 0 }}
                      />

                      {/* 플레이리스트에 추가 */}
                      <button
                        id={`bgm-add-${idx}`}
                        onClick={() => handleAddFromSearch(song)}
                        disabled={addingId === song.preview_url}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-clay-600 text-white px-3 py-2 text-xs font-bold hover:bg-clay-700 disabled:opacity-50 transition"
                      >
                        <Plus size={13} />
                        {addingId === song.preview_url ? "추가 중..." : "추가"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ────────── 탭: 새 플레이리스트 생성 ────────── */}
        {tab === "create" && (
          <form
            id="bgm-create-form"
            onSubmit={handleCreate}
            className="space-y-4"
          >
            <div className="rounded-2xl bg-clay-50 border border-clay-100 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-clay-600 text-white flex items-center justify-center">
                  <Plus size={16} />
                </div>
                <div>
                  <p className="font-black text-sand-900 text-sm">
                    새 플레이리스트
                  </p>
                  <p className="text-[11px] text-sand-400">
                    이 책 전용으로 생성됩니다
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-sand-600 mb-1.5">
                    제목 *
                  </label>
                  <input
                    id="bgm-create-title"
                    value={createForm.title}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-sand-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-clay-100 bg-white"
                    placeholder="예: 잔잔한 독서 BGM"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-sand-600 mb-1.5">
                    설명 (선택)
                  </label>
                  <textarea
                    id="bgm-create-desc"
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full rounded-xl border border-sand-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-clay-100 resize-none bg-white"
                    placeholder="책 분위기, 장르, 추천 이유 등..."
                  />
                </div>

                <button
                  id="bgm-create-submit"
                  type="submit"
                  disabled={creating}
                  className="w-full bg-clay-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-clay-700 disabled:opacity-50 transition"
                >
                  {creating ? "생성 중..." : "플레이리스트 생성"}
                </button>
              </div>
            </div>

            {playlists.length > 0 && (
              <button
                type="button"
                onClick={() => setTab("playlist")}
                className="w-full text-center text-sm text-clay-600 hover:underline font-bold"
              >
                ← 기존 플레이리스트로 돌아가기
              </button>
            )}
          </form>
        )}
      </div>

      {/* ── 하단: 현재 재생 중 표시 */}
      {currentSong && (
        <div className="shrink-0 border-t border-sand-100 px-4 py-3 bg-gradient-to-r from-sand-50 to-white flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              isPlaying ? "bg-green-400 animate-pulse" : "bg-sand-300"
            }`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-sand-700 truncate">
              {currentSong.title}
            </p>
            <p className="text-[11px] text-sand-400 truncate">
              {currentSong.artist} · {isPlaying ? "재생 중" : "일시정지"}
            </p>
          </div>
          <button
            onClick={() => handlePlaySong(currentSong)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-white transition ${
              isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-sand-700 hover:bg-sand-900"
            }`}
          >
            {isPlaying ? (
              <Pause size={13} fill="currentColor" />
            ) : (
              <Play size={13} fill="currentColor" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
