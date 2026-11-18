import { useEffect, useState } from "react";
import { Check, Heart, X } from "lucide-react";
import CameraStage from "./CameraStage.jsx";

export default function TryOnModal({ product, onClose, onSelect }) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="tryon-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="tryon-modal" role="dialog" aria-modal="true" aria-label={"Virtual try-on: " + product.name}>
        <div className="tryon-viewer">
          <button className={"tryon-favorite " + (favorite ? "is-favorite" : "")} onClick={() => setFavorite(!favorite)} aria-label="Toggle favorite" aria-pressed={favorite}><Heart size={25} fill={favorite ? "currentColor" : "none"}/></button>
          <button className="modal-close" onClick={onClose} aria-label="Close try-on"><X size={27}/></button>
          <div className="modal-camera-column">
            <CameraStage glasses={product}/>
          </div>
        </div>
        <aside className="modal-details">
          <div className="color-options-heading"><strong>Frame color</strong><span>{product.colors?.length || 0} colors</span></div>
          <div className="modal-style-list">
            {(product.colors || []).map((color) => (
              <button key={color.id} className={"modal-style-chip " + ((product.color_id || product.colors?.[0]?.id) === color.id ? "active" : "")}
                onClick={() => onSelect({ ...product, model_url: color.model_url, color_id: color.id, color_name: color.name, frame_color: color.hex })}
                aria-label={"Choose " + color.name} aria-pressed={(product.color_id || product.colors?.[0]?.id) === color.id}>
                <span className="style-swatch" style={{ backgroundColor: color.hex }}/>{color.name}
                {(product.color_id || product.colors?.[0]?.id) === color.id && <Check size={14}/>}
              </button>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
