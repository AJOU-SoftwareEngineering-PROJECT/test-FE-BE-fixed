import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import MyPage from "./pages/MyPage";
import Reader from "./pages/Reader";
import Playlists from "./pages/Playlists";
import Scraps from "./pages/Scraps";
import CreateBook from "./pages/CreateBook";


import Authors from "./pages/Authors";
import CreateAuthor from "./pages/CreateAuthor";
import AuthorDetail from "./pages/AuthorDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/books" element={<Books />} />
        <Route path="/books/new" element={<CreateBook />} />
        <Route path="/books/:bookId" element={<Reader />} />

        <Route path="/author" element={<Navigate to="/authors" replace />} />
        <Route path="/authors" element={<Authors />} />
        <Route path="/authors/new" element={<CreateAuthor />} />
        <Route path="/authors/:authorId" element={<AuthorDetail />} />

        <Route path="/mypage" element={<MyPage />} />
<Route path="/my-page" element={<MyPage />} />
<Route path="/my" element={<MyPage />} />
        <Route path="/scraps" element={<Scraps />} />
        <Route path="/playlists" element={<Playlists />} />
      </Routes>
    </BrowserRouter>
  );
}