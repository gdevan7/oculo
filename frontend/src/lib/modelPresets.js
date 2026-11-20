// How each model folder under /models/ is fitted to the face. Pure data, shared by the try-on
// loader and the catalog preview so the two cannot disagree.
//
// "Upright" models (model-3 and up) are exported with the frame's width along x, up along y and
// the lenses facing +z, so they need no rotation. model-0, model-1 and model-2 were exported in
// other orientations and keep their rotation presets in the loader and the preview.
//
// widthMm       the frame's full width after scaling (1 unit is roughly 1 mm)
// faceFrontMm   how far behind the front plane of the frame the invisible face block starts
//               (see GlassesScene). Wrap-around frames curve back at the lens edges and need
//               it deeper, or the block cuts holes in the lenses and rims.
export const DEFAULT_WIDTH_MM = 150;
export const DEFAULT_FACE_FRONT_MM = 21;

const UPRIGHT = {
  "model-3": {},
  "model-4": {},
  "model-5": {},
  "model-6": { widthMm: 175 },
  "model-7": {},
  "model-8": {},
  "model-9": {},
  "model-10": {},
  "model-11": {},
  "model-12": {},
  "model-13": {},
  "model-14": {},
  "model-15": { faceFrontMm: 50 }, // Horizon: shield lens curves back about 47 mm
  "model-16": { faceFrontMm: 27 }, // Atlas: rims curve back about 24 mm
};

// "/models/model-7/model_7_gold.glb?v=2" -> "model-7"
export function modelFolder(url) {
  if (typeof url !== "string") return "";
  return url.split("?")[0].split("/").slice(-2, -1)[0] ?? "";
}

// Fit settings for an upright model folder, or null for any other folder.
export function uprightPreset(folder) {
  const entry = Object.hasOwn(UPRIGHT, folder) ? UPRIGHT[folder] : null;
  if (!entry) return null;
  return {
    widthMm: entry.widthMm ?? DEFAULT_WIDTH_MM,
    faceFrontMm: entry.faceFrontMm ?? DEFAULT_FACE_FRONT_MM,
  };
}
