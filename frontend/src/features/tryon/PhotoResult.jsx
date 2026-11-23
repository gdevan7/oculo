import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, X } from "lucide-react";
import { TURNED_HEAD_DEGREES } from "../../lib/photoInput.js";

// Preview of the photo with the frame on it. Download saves a PNG; Mirror flips it like a selfie preview.
// Rendered into document.body so it sits above the try-on window whatever its overflow or stacking is.
export default function PhotoResult({ photo, onClose }) {
  const [mirror, setMirror] = useState(photo.mirror);
  const [saving, setSaving] = useState(false);
  const image = useRef(null);
  const primary = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    primary.current?.focus();
    // Escape closes only this preview, not the try-on window behind it (capture phase runs first).
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      closeRef.current();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, []);

  async function save() {
    setSaving(true);
    let temporaryUrl = "";
    try {
      let href = photo.url;
      if (mirror) {
        const canvas = Object.assign(document.createElement("canvas"), { width: photo.width, height: photo.height });
        const ctx = canvas.getContext("2d");
        ctx.translate(photo.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(image.current, 0, 0, photo.width, photo.height);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
        if (!blob) return;
        href = temporaryUrl = URL.createObjectURL(blob);
      }
      const link = document.createElement("a");
      link.href = href;
      link.download = `oculo-photo-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      if (temporaryUrl) setTimeout(() => URL.revokeObjectURL(temporaryUrl), 4000);
      setSaving(false);
    }
  }

  return createPortal(
    <div
      className="photo-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Your photo with the frame"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="photo-card">
        <div className="photo-frame">
          <img
            ref={image}
            src={photo.url}
            width={photo.width}
            height={photo.height}
            alt="Your photo wearing the selected frame"
            className={mirror ? "is-mirrored" : ""}
          />
        </div>
        {photo.yaw > TURNED_HEAD_DEGREES && (
          <p className="photo-hint">Your head is turned a lot. The frame fits best when you face the camera straight on.</p>
        )}
        <div className="photo-actions">
          <button ref={primary} className="photo-btn photo-btn-primary" onClick={save} disabled={saving}>
            <Download size={17} />
            {saving ? "Saving…" : "Download"}
          </button>
          <button className="photo-btn" onClick={() => setMirror(!mirror)} aria-pressed={mirror}>
            Mirror: {mirror ? "on" : "off"}
          </button>
          <button className="photo-btn" onClick={onClose}>
            <X size={16} />
            Close
          </button>
        </div>
        <p className="photo-note">Your picture stays on this device. It was never uploaded.</p>
      </div>
    </div>,
    document.body
  );
}
