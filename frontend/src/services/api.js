// The public demo can run without an API server. Configure VITE_API_BASE_URL
// only when a separately hosted catalog API is available.
const BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

export async function getGlasses() {
  if (!BASE) return [];
  const response = await fetch(`${BASE}/api/glasses`);
  if (!response.ok) throw new Error("Catalog unavailable");
  const payload = await response.json();
  return Array.isArray(payload.data) ? payload.data : [];
}
