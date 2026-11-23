// Rules for the still-photo try-on that need no browser APIs, so they can be unit tested.

// Largest side (px) of the photo that is tracked and rendered. A phone picture can be 4000+ px wide;
// shrinking it keeps the WebGL drawing buffer and memory small, and landmarks are normalised so the
// face is found just as well.
export const MAX_PHOTO_SIDE = 2048;
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

// An error whose message is safe to show to the person using the app.
export class PhotoError extends Error {
  constructor(message) {
    super(message);
    this.name = "PhotoError";
  }
}

export const photoErrorMessage = (error) =>
  error instanceof PhotoError ? error.message : "The photo could not be created. Please try another picture.";

// Shrinks (never enlarges) width x height so the longest side is at most `max`.
export function fitWithin(width, height, max = MAX_PHOTO_SIDE) {
  const longest = Math.max(width, height);
  if (!(longest > 0)) return { width: 0, height: 0 };
  const scale = longest > max ? max / longest : 1;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

// `file` is anything with a MIME type and a size in bytes (a File from an <input type="file">).
export function validateImageFile(file) {
  if (!file || typeof file.type !== "string" || !file.type.startsWith("image/")) {
    throw new PhotoError("Please choose an image file (JPG, PNG or WebP).");
  }
  if (!(file.size > 0)) throw new PhotoError("That file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new PhotoError("That picture is too large. Please choose one under 25 MB.");
}

// Shown next to the result when the head is turned far from the camera; the fit is best face-on.
export const TURNED_HEAD_DEGREES = 35;
