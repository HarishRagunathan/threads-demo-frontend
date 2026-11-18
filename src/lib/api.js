export const API = import.meta.env.VITE_API_URL;

export async function api(path, options = {}) {
  if (!API) throw new Error("Set VITE_API_URL in frontend/.env");
  const res = await fetch(API + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
