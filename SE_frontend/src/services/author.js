const AUTH_TOKEN_KEY = "auth_token";

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function loginWithEmail({ email, password }) {
  if (!email?.includes("@") || !password || password.length < 4) {
    throw new Error("Invalid credentials");
  }

  // Temporary local token until backend JWT endpoint is provided.
  const token = `demo-token-${btoa(email)}`;
  setAuthToken(token);
  return { access_token: token, token_type: "bearer" };
}
