import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";

import Settings from "./pages/Settings";

import Home from "./pages/Home";
import Books from "./pages/Books";
import CreateBook from "./pages/CreateBook";
import Reader from "./pages/Reader";

import Authors from "./pages/Authors";
import CreateAuthor from "./pages/CreateAuthor";
import AuthorDetail from "./pages/AuthorDetail";

import MyPage from "./pages/MyPage";
import Scraps from "./pages/Scraps";

function isLoggedIn() {
  return Boolean(localStorage.getItem("currentUserId"));
}

function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  if (isLoggedIn()) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            isLoggedIn() ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={<Navigate to="/mypage?tab=dashboard" replace />}
        />

        <Route
          path="/books"
          element={
            <ProtectedRoute>
              <Books />
            </ProtectedRoute>
          }
        />

        <Route
          path="/books/new"
          element={
            <ProtectedRoute>
              <CreateBook />
            </ProtectedRoute>
          }
        />

        <Route
          path="/books/:bookId"
          element={
            <ProtectedRoute>
              <Reader />
            </ProtectedRoute>
          }
        />

        <Route
          path="/authors"
          element={
            <ProtectedRoute>
              <Authors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/authors/new"
          element={
            <ProtectedRoute>
              <CreateAuthor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/authors/:authorId"
          element={
            <ProtectedRoute>
              <AuthorDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-page"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/scraps"
          element={
            <ProtectedRoute>
              <Scraps />
            </ProtectedRoute>
          }
        />
        
          <Route
  path="/settings"
  element={
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  }
/>

        <Route
          path="/playlists"
          element={<Navigate to="/mypage?tab=playlists" replace />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}