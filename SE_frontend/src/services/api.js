const API_BASE_URL = "http://127.0.0.1:8000";

export async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Request failed: ${response.status}`);
  }

  if (!text) {
    return null;
  }

  return JSON.parse(text);
}

/* Dashboard */
export function getDashboard() {
  return request("/api/dashboard");
}

/* Books */
export function getBooks() {
  return request("/api/books");
}

export function getBook(bookId) {
  return request(`/api/books/${bookId}`);
}

export function createBook(data) {
  return request("/api/books", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* Sentences */
export function getBookSentences(bookId) {
  return request(`/api/books/${bookId}/sentences`);
}

export function createBookSentence(bookId, data) {
  return request(`/api/books/${bookId}/sentences`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* Comments */
export function getSentenceComments(sentenceId) {
  return request(`/api/sentences/${sentenceId}/comments`);
}

export function createSentenceComment(sentenceId, content) {
  return request(`/api/sentences/${sentenceId}/comments`, {
    method: "POST",
    body: JSON.stringify({
      content,
      user_name: "Guest User",
    }),
  });
}

export function likeComment(commentId) {
  return request(`/api/comments/${commentId}/like`, {
    method: "POST",
  });
}

/* Scraps */
export function getScraps() {
  return request("/api/scraps");
}

export function createScrap(sentenceId) {
  return request("/api/scraps", {
    method: "POST",
    body: JSON.stringify({
      sentence_id: sentenceId,
    }),
  });
}

export function deleteScrap(scrapId) {
  return request(`/api/scraps/${scrapId}`, {
    method: "DELETE",
  });
}

/* Authors */
export function getAuthors() {
  return request("/api/authors");
}

export function getAuthor(authorId) {
  return request(`/api/authors/${authorId}`);
}

export function createAuthor(data) {
  return request("/api/authors", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAuthor(authorId, data) {
  return request(`/api/authors/${authorId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteAuthor(authorId) {
  return request(`/api/authors/${authorId}`, {
    method: "DELETE",
  });
}

/* My Page */
export function getMyPage() {
  return request("/api/me");
}

export function updateMyPage(data) {
  return request("/api/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}