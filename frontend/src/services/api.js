import { fetchGlasses } from "../lib/catalogApi.js";

// The public demo can run without an API server. Configure VITE_API_BASE_URL
// only when a separately hosted catalog API is available.
const BASE = import.meta.env.VITE_API_BASE_URL;

export const getGlasses = () => fetchGlasses(BASE);
