// The public demo can run without an API server: with no base URL the catalog is empty and
// the app uses its built-in list.
export async function fetchGlasses(base, fetchImpl = globalThis.fetch) {
  const root = base?.replace(/\/$/, "");
  if (!root) return [];
  const response = await fetchImpl(`${root}/api/glasses`);
  if (!response.ok) throw new Error("Catalog unavailable");
  const payload = await response.json();
  return Array.isArray(payload.data) ? payload.data : [];
}
