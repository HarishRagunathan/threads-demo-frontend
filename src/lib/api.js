// Production requests stay on the frontend origin; Vercel proxies /api to Render.
export const API = import.meta.env.PROD
  ? "/api"
  : import.meta.env.VITE_API_URL || "/api";
export const SESSION_EXPIRED = "session-expired";

export async function api(path, options = {}) {
  if (!API) throw new Error("Set VITE_API_URL in frontend/.env");
  const res = await fetch(API + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401 && !["/auth/login", "/auth/me"].includes(path)) {
      window.dispatchEvent(new Event(SESSION_EXPIRED));
    }
    throw new Error(data.error || "Request failed");
  }
  return data;
}
