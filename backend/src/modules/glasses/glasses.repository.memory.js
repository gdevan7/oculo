import { ConflictError } from "../../shared/errors.js";

// Keeps the catalog in memory. Used when DATABASE_URL is not set and in tests.
// Returns copies so callers cannot change stored data by accident.
export function createMemoryGlassesRepository(initial = []) {
  const rows = new Map(initial.map((g) => [g.id, structuredClone(g)]));
  const ordered = () => [...rows.values()].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

  return {
    async list({ includeInactive = false } = {}) {
      return structuredClone(ordered().filter((g) => includeInactive || g.active));
    },
    async get(id) {
      return rows.has(id) ? structuredClone(rows.get(id)) : null;
    },
    async insert(glasses) {
      if (rows.has(glasses.id)) throw new ConflictError(`Glasses "${glasses.id}" already exists`);
      rows.set(glasses.id, structuredClone(glasses));
    },
    async update(glasses) {
      if (!rows.has(glasses.id)) return false;
      rows.set(glasses.id, structuredClone(glasses));
      return true;
    },
    async remove(id) {
      return rows.delete(id);
    },
  };
}
