// API client — sends the auth token via Authorization header
// This works reliably in ALL contexts including iframes where cookies are blocked

const TOKEN_KEY = "edu_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token: string) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
}

export function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}

/** fetch wrapper that automatically attaches Authorization header */
export async function api(input: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}
