const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
// A path on this site (/models/a.glb) or an https URL. Rejects http:, javascript: and //host.
const MODEL_URL = /^(\/(?!\/)|https:\/\/)\S+$/;

export const GLASSES_FIELDS = ["id", "name", "subtitle", "description", "style", "price", "sort_order", "active", "colors"];
export const MAX_COLORS = 12;

const isString = (v, min, max) => typeof v === "string" && v.trim().length >= min && v.length <= max;

function validateColor(color, i) {
  const at = `colors[${i}]`;
  if (color === null || typeof color !== "object" || Array.isArray(color)) return [`${at} must be an object`];
  const errors = [];
  for (const key of Object.keys(color)) {
    if (!["id", "name", "hex", "model_url"].includes(key)) errors.push(`${at}: unknown field ${key}`);
  }
  if (!(typeof color.id === "string" && SLUG.test(color.id) && color.id.length <= 40)) errors.push(`${at}.id must be a lowercase slug`);
  if (!isString(color.name, 2, 40)) errors.push(`${at}.name must be 2-40 characters`);
  if (!(typeof color.hex === "string" && HEX.test(color.hex))) errors.push(`${at}.hex must be a hex color like #17191D`);
  if (!(typeof color.model_url === "string" && MODEL_URL.test(color.model_url))) {
    errors.push(`${at}.model_url must be an absolute path (/models/x.glb) or an https URL`);
  }
  return errors;
}

// Returns a list of problems (empty when valid). partial = PATCH: only the fields present are checked.
export function validateGlasses(input, { partial = false } = {}) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) return ["Body must be a JSON object"];
  const errors = [];
  for (const key of Object.keys(input)) {
    if (!GLASSES_FIELDS.includes(key)) errors.push(`Unknown field: ${key}`);
  }
  const has = (key) => key in input;
  const need = (key) => !partial || has(key);

  if (need("id") && !(typeof input.id === "string" && SLUG.test(input.id) && input.id.length <= 40)) {
    errors.push("id must be a lowercase slug (letters, numbers and hyphens, up to 40 characters)");
  }
  if (need("name") && !isString(input.name, 2, 60)) errors.push("name must be 2-60 characters");
  if (has("subtitle") && !isString(input.subtitle, 0, 80)) errors.push("subtitle must be at most 80 characters");
  if (has("description") && !isString(input.description, 0, 300)) errors.push("description must be at most 300 characters");
  if (has("style") && !(typeof input.style === "string" && SLUG.test(input.style) && input.style.length <= 30)) {
    errors.push("style must be a lowercase slug of at most 30 characters");
  }
  if (has("price") && !(Number.isInteger(input.price) && input.price >= 0 && input.price <= 1_000_000_000)) {
    errors.push("price must be a whole number of rupiah, 0 or more");
  }
  if (has("sort_order") && !(Number.isInteger(input.sort_order) && Math.abs(input.sort_order) <= 1_000_000)) {
    errors.push("sort_order must be a whole number");
  }
  if (has("active") && typeof input.active !== "boolean") errors.push("active must be boolean");

  if (need("colors")) {
    if (!Array.isArray(input.colors) || input.colors.length < 1 || input.colors.length > MAX_COLORS) {
      errors.push(`colors must be a list of 1-${MAX_COLORS} colors`);
    } else {
      input.colors.forEach((color, i) => errors.push(...validateColor(color, i)));
      const ids = input.colors.map((c) => c?.id);
      if (new Set(ids).size !== ids.length) errors.push("colors must have unique ids");
    }
  }
  return errors;
}
