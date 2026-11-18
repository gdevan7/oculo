import { ConflictError, NotFoundError, ValidationError } from "../../shared/errors.js";
import { buildGlasses } from "./glasses.model.js";
import { validateGlasses } from "./glasses.validation.js";

// Business rules for the catalog. Knows nothing about HTTP or SQL: it talks to a repository
// (memory or PostgreSQL) and throws AppErrors that the HTTP layer turns into status codes.
export function createGlassesService(repository) {
  return {
    list: () => repository.list(),

    async get(id) {
      const glasses = await repository.get(id);
      if (!glasses || !glasses.active) throw new NotFoundError("Glasses not found");
      return glasses;
    },

    async create(input) {
      const errors = validateGlasses(input);
      if (errors.length) throw new ValidationError(errors);
      const glasses = buildGlasses(input);
      if (await repository.get(glasses.id)) throw new ConflictError(`Glasses "${glasses.id}" already exists`);
      await repository.insert(glasses);
      return glasses;
    },

    async update(id, patch) {
      const errors = validateGlasses(patch, { partial: true });
      if ("id" in (patch ?? {}) && patch.id !== id) errors.push("id cannot be changed");
      if (errors.length) throw new ValidationError(errors);
      const current = await repository.get(id);
      if (!current) throw new NotFoundError("Glasses not found");
      const next = buildGlasses({ ...current, ...patch, id });
      await repository.update(next);
      return next;
    },

    async remove(id) {
      if (!(await repository.remove(id))) throw new NotFoundError("Glasses not found");
    },
  };
}
