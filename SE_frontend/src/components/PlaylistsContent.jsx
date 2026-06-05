import { useEffect, useState } from "react";
import {
  Heart,
  Link as LinkIcon,
  Music,
  Music2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  addPlaylistSong,
  createPlaylist,
  deletePlaylist,
  deletePlaylistSong,
  getPlaylists,
  likePlaylistSong,
  searchMusic,
} from "../services/api";

export default function PlaylistsContent() {
  const [playlists, setPlaylists] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [addingSong, setAddingSong] = useState(false);
  const [error, setError] = useState("");

  const [musicKeyword, setMusicKeyword] = useState("");
  const [musicResults, setMusicResults] = useState([]);
  const [musicSearching, setMusicSearching] = useState(false);

  const [playlistForm, setPlaylistForm] = useState({
    title: "",
    description: "",
  });

  const [songForm, setSongForm] = useState({
    title: "",
    artist: "",
    url: "",
  });

  const selectedPlaylist =
    playlists.find((playlist) => playlist.id === selectedId) || null;

  const loadPlaylists = async () => {
    setLoading(true);

    try {
      const data = await getPlaylists();
      const items = Array.isArray(data) ? data : [];

      setPlaylists(items);

      if (items.length > 0) {
        setSelectedId((prev) => prev || items[0].id);
      } else {
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Failed to load playlists:", error);
      setPlaylists([]);
      setError("플레이리스트를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  const handlePlaylistChange = (event) => {
    const { name, value } = event.target;
    setPlaylistForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSongChange = (event) => {
    const { name, value } = event.target;
    setSongForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatePlaylist = async (event) => {
    event.preventDefault();

    if (!playlistForm.title.trim()) {
      setError("플레이리스트 제목을 입력하세요.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const created = await createPlaylist({
        title: playlistForm.title.trim(),
        description: playlistForm.description.trim(),
      });

      setPlaylistForm({ title: "", description: "" });
      setSelectedId(created.id);
      await loadPlaylists();
    } catch (error) {
      console.error(error);
      setError("플레이리스트 생성에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  };

  const handleAddSong = async (event) => {
    event.preventDefault();

    if (!selectedPlaylist) {
      setError("먼저 플레이리스트를 선택하세요.");
      return;
    }

    if (!songForm.title.trim()) {
      setError("노래 제목을 입력하세요.");
      return;
    }

    if (!songForm.artist.trim()) {
      setError("아티스트를 입력하세요.");
      return;
    }

    setAddingSong(true);
    setError("");

    try {
      await addPlaylistSong(selectedPlaylist.id, {
        title: songForm.title.trim(),
        artist: songForm.artist.trim(),
        url: songForm.url.trim(),
      });

      setSongForm({ title: "", artist: "", url: "" });
      await loadPlaylists();
    } catch (error) {
      console.error(error);
      setError("노래 추가에 실패했습니다.");
    } finally {
      setAddingSong(false);
    }
  };

  const handleSearchMusic = async (event) => {
    event.preventDefault();

    if (!musicKeyword.trim()) {
      setError("검색할 노래 키워드를 입력하세요.");
      return;
    }

    setMusicSearching(true);
    setError("");

    try {
      const results = await searchMusic(musicKeyword.trim());
      setMusicResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error(error);
      setError("음악 API 검색에 실패했습니다.");
      setMusicResults([]);
    } finally {
      setMusicSearching(false);
    }
  };

  const handleAddApiSong = async (song) => {
    if (!selectedPlaylist) {
      setError("먼저 플레이리스트를 선택하세요.");
      return;
    }

    try {
      await addPlaylistSong(selectedPlaylist.id, {
        title: song.title,
        artist: song.artist,
        url: song.preview_url,
      });

      await loadPlaylists();
    } catch (error) {
      console.error(error);
      setError("API 노래 추가에 실패했습니다.");
    }
  };

  const handleLikeSong = async (songId) => {
    try {
      await likePlaylistSong(songId);
      await loadPlaylists();
    } catch (error) {
      console.error(error);
      alert("좋아요 실패");
    }
  };

  const handleDeleteSong = async (songId) => {
    const ok = window.confirm("이 노래를 삭제하시겠습니까?");
    if (!ok) return;

    try {
      await deletePlaylistSong(songId);
      await loadPlaylists();
    } catch (error) {
      console.error(error);
      alert("노래 삭제 실패");
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    const ok = window.confirm(
      "이 플레이리스트를 삭제하시겠습니까? 포함된 노래도 함께 삭제됩니다."
    );
    if (!ok) return;

    try {
      await deletePlaylist(playlistId);
      setSelectedId(null);
      await loadPlaylists();
    } catch (error) {
      console.error(error);
      alert("플레이리스트 삭제 실패");
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-5 rounded-2xl bg-red-50 text-red-600 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <section className="grid xl:grid-cols-[320px_1fr] gap-6">
        <aside className="space-y-5">
          <form onSubmit={handleCreatePlaylist} className="card p-5">
            <h3 className="font-black mb-4 flex items-center gap-2">
              <Plus size={18} />
              Create Playlist
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sand-600 mb-2">
                  Title
                </label>
                <input
                  name="title"
                  value={playlistForm.title}
                  onChange={handlePlaylistChange}
                  className="w-full rounded-xl border border-sand-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-clay-100"
                  placeholder="Calm Reading Music"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-sand-600 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={playlistForm.description}
                  onChange={handlePlaylistChange}
                  rows={3}
                  className="w-full rounded-xl border border-sand-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-clay-100 resize-none"
                  placeholder="책을 읽을 때 어울리는 음악..."
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-clay-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-clay-700 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Playlist"}
              </button>
            </div>
          </form>

          <div className="card p-5">
            <h3 className="font-black mb-4">Playlist List</h3>

            {loading ? (
              <p className="text-sm text-sand-500">Loading...</p>
            ) : playlists.length === 0 ? (
              <p className="text-sm text-sand-500">
                아직 플레이리스트가 없습니다.
              </p>
            ) : (
              <div className="space-y-2">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => setSelectedId(playlist.id)}
                    className={`w-full text-left rounded-2xl border px-4 py-3 transition ${
                      selectedId === playlist.id
                        ? "border-clay-200 bg-clay-50"
                        : "border-sand-100 hover:bg-sand-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-sm text-sand-800">
                          {playlist.title}
                        </p>
                        <p className="text-xs text-sand-500 mt-1">
                          {playlist.song_count} songs · {playlist.total_likes}{" "}
                          likes
                        </p>
                      </div>

                      <Music size={17} className="text-clay-500" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <section className="space-y-5">
          {!selectedPlaylist ? (
            <div className="card p-10 text-center">
              <Music2 size={48} className="mx-auto text-sand-300 mb-4" />
              <h3 className="font-black text-sand-700">
                플레이리스트를 선택하세요.
              </h3>
              <p className="text-sm text-sand-500 mt-2">
                왼쪽에서 생성하거나 기존 플레이리스트를 선택하면 노래를 추가할 수
                있습니다.
              </p>
            </div>
          ) : (
            <>
              <div className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-clay-50 text-clay-600 flex items-center justify-center mb-4">
                      <Music2 size={26} />
                    </div>

                    <h2 className="text-2xl font-black text-sand-900">
                      {selectedPlaylist.title}
                    </h2>

                    <p className="text-sm text-sand-500 mt-2 leading-6">
                      {selectedPlaylist.description || "No description."}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-sand-400 mt-4">
                      <span>Creator: {selectedPlaylist.creator_name}</span>
                      <span>{selectedPlaylist.song_count} songs</span>
                      <span>{selectedPlaylist.total_likes} likes</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                    className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSearchMusic} className="card p-6">
                <h3 className="font-black mb-5 flex items-center gap-2">
                  <Search size={18} />
                  Search Music API
                </h3>

                <div className="flex gap-3">
                  <input
                    value={musicKeyword}
                    onChange={(event) => setMusicKeyword(event.target.value)}
                    className="flex-1 rounded-xl border border-sand-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-clay-100"
                    placeholder="Search song, artist, lofi, piano..."
                  />

                  <button
                    type="submit"
                    disabled={musicSearching}
                    className="bg-clay-600 text-white rounded-xl px-5 py-3 text-sm font-bold hover:bg-clay-700 disabled:opacity-50"
                  >
                    {musicSearching ? "Searching..." : "Search"}
                  </button>
                </div>

                {musicResults.length > 0 && (
                  <div className="mt-5 space-y-3 max-h-80 overflow-y-auto">
                    {musicResults.map((song, index) => (
                      <div
                        key={`${song.preview_url}-${index}`}
                        className="rounded-2xl border border-sand-100 p-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {song.artwork_url ? (
                            <img
                              src={song.artwork_url}
                              alt={song.title}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-clay-50 flex items-center justify-center text-clay-500">
                              <Music2 size={18} />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="font-black text-sand-800 truncate">
                              {song.title}
                            </p>
                            <p className="text-sm text-sand-500 truncate">
                              {song.artist}
                            </p>
                            <p className="text-xs text-sand-400 truncate">
                              {song.album}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <audio
                            controls
                            src={song.preview_url}
                            className="w-40 h-9"
                          />

                          <button
                            type="button"
                            onClick={() => handleAddApiSong(song)}
                            className="rounded-xl bg-clay-600 text-white px-4 py-2 text-sm font-bold hover:bg-clay-700"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </form>

              <form onSubmit={handleAddSong} className="card p-6">
                <h3 className="font-black mb-5">Add Song Manually</h3>

                <div className="grid md:grid-cols-[1fr_1fr_1.2fr_auto] gap-3">
                  <input
                    name="title"
                    value={songForm.title}
                    onChange={handleSongChange}
                    className="rounded-xl border border-sand-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-clay-100"
                    placeholder="Song title"
                  />

                  <input
                    name="artist"
                    value={songForm.artist}
                    onChange={handleSongChange}
                    className="rounded-xl border border-sand-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-clay-100"
                    placeholder="Artist"
                  />

                  <input
                    name="url"
                    value={songForm.url}
                    onChange={handleSongChange}
                    className="rounded-xl border border-sand-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-clay-100"
                    placeholder="Music URL optional"
                  />

                  <button
                    type="submit"
                    disabled={addingSong}
                    className="bg-clay-600 text-white rounded-xl px-5 py-3 text-sm font-bold hover:bg-clay-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </form>

              <div className="card p-6">
                <h3 className="font-black mb-5">Songs</h3>

                {selectedPlaylist.songs.length === 0 ? (
                  <p className="text-sm text-sand-500">
                    아직 추가된 노래가 없습니다.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedPlaylist.songs
                      .slice()
                      .sort((a, b) => b.like_count - a.like_count)
                      .map((song, index) => (
                        <div
                          key={song.id}
                          className="rounded-2xl border border-sand-100 p-4 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-sand-100 text-sand-600 flex items-center justify-center font-black text-sm">
                              #{index + 1}
                            </div>

                            <div className="min-w-0">
                              <p className="font-black text-sand-800 truncate">
                                {song.title}
                              </p>
                              <p className="text-sm text-sand-500 truncate">
                                {song.artist}
                              </p>

                              {song.url && (
                                <div className="mt-2 flex items-center gap-3">
                                  <audio
                                    controls
                                    src={song.url}
                                    className="w-48 h-9"
                                  />

                                  <a
                                    href={song.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-clay-600 hover:underline"
                                  >
                                    <LinkIcon size={12} />
                                    Open
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleLikeSong(song.id)}
                              className="inline-flex items-center gap-2 rounded-xl bg-clay-50 text-clay-600 px-3 py-2 text-sm font-bold hover:bg-clay-100"
                            >
                              <Heart size={15} />
                              {song.like_count}
                            </button>

                            <button
                              onClick={() => handleDeleteSong(song.id)}
                              className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </section>
    </div>
  );
}
