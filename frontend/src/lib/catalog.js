// Turns the API's catalog response into items the UI can show. Rows that are incomplete are
// skipped, so one bad row cannot break the page. An empty result means "keep the offline copy".
const isColor = (c) =>
  c && typeof c.id === "string" && typeof c.name === "string" &&
  /^#[0-9a-f]{6}$/i.test(c.hex) && typeof c.model_url === "string" && c.model_url.length > 0;

export function normalizeCatalog(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((r) =>
      r && typeof r.id === "string" && typeof r.name === "string" &&
      Array.isArray(r.colors) && r.colors.length > 0 && r.colors.every(isColor))
    .map((r) => ({
      ...r,
      subtitle: r.subtitle ?? "",
      description: r.description ?? "",
      price: Number.isFinite(r.price) ? r.price : 0,
      color_id: r.color_id ?? r.colors[0].id,
      model_url: r.model_url ?? r.colors[0].model_url,
      frame_color: r.frame_color ?? r.colors[0].hex,
    }));
}
