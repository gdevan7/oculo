import { useEffect, useState } from "react";
import { ArrowRight, Check, ChevronDown, Glasses, Heart, HelpCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import CameraStage from "./components/CameraStage.jsx";
import ProductModelPreview from "./components/ProductModelPreview.jsx";
import { getGlasses } from "./services/api.js";

const fallback = [
  {
    id: "white", name: "Cloud", subtitle: "Everyday Essential",
    description: "A clean, lightweight frame for an effortless everyday look.",
    frame_color: "#F2F0E9", style: "classic", color_id: "white",
    model_url: "/models/model-0/model_0_white.glb", price: "Try-on ready",
    colors: [
      { id: "white", name: "White", hex: "#E8E3D9", model_url: "/models/model-0/model_0_white.glb" },
      { id: "dusty-rose", name: "Dusty Rose", hex: "#B98286", model_url: "/models/model-0/model_0_dusty_rose.glb" },
      { id: "sage-green", name: "Sage Green", hex: "#899B83", model_url: "/models/model-0/model_0_sage_green.glb" },
      { id: "slate-blue-grey", name: "Slate Blue Grey", hex: "#71818C", model_url: "/models/model-0/model_0_slate_blue_grey.glb" }
    ]
  },
  {
    id: "tortoiseshell", name: "Frankie", subtitle: "Modern Tortoise",
    description: "Warm tortoiseshell details with a timeless silhouette.",
    frame_color: "#70452F", style: "tortoise", color_id: "tortoiseshell",
    model_url: "/models/model-1/model_1_tortoiseshell.glb", price: "Try-on ready",
    colors: [
      { id: "tortoiseshell", name: "Tortoiseshell", hex: "#70452F", model_url: "/models/model-1/model_1_tortoiseshell.glb" },
      { id: "honey-amber", name: "Honey Amber", hex: "#C28A43", model_url: "/models/model-1/model_1_honey_amber.glb" },
      { id: "taupe-grey", name: "Taupe Grey", hex: "#8D8279", model_url: "/models/model-1/model_1_taupe_grey.glb" },
      { id: "burgundy-wine", name: "Burgundy Wine", hex: "#632D42", model_url: "/models/model-1/model_1_burgundy_wine.glb" }
    ]
  },
  {
    id: "black", name: "Monroe", subtitle: "Classic Black",
    description: "A confident black frame that goes with just about everything.",
    frame_color: "#171717", style: "black", color_id: "black",
    model_url: "/models/model-2/model_2_black.glb", price: "Try-on ready",
    colors: [
      { id: "black", name: "Matte Black", hex: "#17191D", model_url: "/models/model-2/model_2_black.glb" },
      { id: "gold", name: "Gold", hex: "#C6A15B", model_url: "/models/model-2/model_2_gold.glb" },
      { id: "rose-gold", name: "Rose Gold", hex: "#B98278", model_url: "/models/model-2/model_2_rose_gold.glb" },
      { id: "silver", name: "Silver", hex: "#AEB5BC", model_url: "/models/model-2/model_2_silver.glb" }
    ]
  },
{
    id: "model-3", name: "Noir", subtitle: "Contemporary Acetate",
    description: "A versatile silhouette with four distinctive finishes.",
    frame_color: "#17191D", style: "classic", color_id: "black-lens",
    model_url: "/models/model-3/model_3_black_lens.glb", price: "Try-on ready",
    colors: [
      { id: "black-lens", name: "Black Lens", hex: "#24272B", model_url: "/models/model-3/model_3_black_lens.glb" },
      { id: "burgundy-wine", name: "Burgundy Wine", hex: "#713747", model_url: "/models/model-3/model_3_burgundy_wine.glb" },
      { id: "havana-brown", name: "Havana Brown", hex: "#80563A", model_url: "/models/model-3/model_3_havana_brown.glb" },
      { id: "ivory-cream", name: "Ivory Cream", hex: "#D9CDB7", model_url: "/models/model-3/model_3_ivory_cream.glb" }
    ]
  },
  {
    id: "model-4", name: "Browline", subtitle: "Refined Browline",
    description: "A defined browline profile with contrasting metal details.",
    frame_color: "#59402F", style: "tortoise", color_id: "browline-merged",
    model_url: "/models/model-4/model_4_browline_merged.glb", price: "Try-on ready",
    colors: [
      { id: "browline-merged", name: "Classic Browline", hex: "#4D4037", model_url: "/models/model-4/model_4_browline_merged.glb" },
      { id: "brown-gold", name: "Brown Gold", hex: "#87603C", model_url: "/models/model-4/model_4_brown_gold.glb" },
      { id: "burgundy-rose-gold", name: "Burgundy Rose Gold", hex: "#783E50", model_url: "/models/model-4/model_4_burgundy_rose_gold.glb" },
      { id: "navy-silver", name: "Navy Silver", hex: "#34465D", model_url: "/models/model-4/model_4_navy_silver.glb" }
    ]
  },
  {
    id: "model-5", name: "Heritage", subtitle: "Modern Browline",
    description: "A second browline design with a distinct frame construction.",
    frame_color: "#5B4638", style: "tortoise", color_id: "browline",
    model_url: "/models/model-5/model_5_browline.glb", price: "Try-on ready",
    colors: [
      { id: "browline", name: "Browline", hex: "#4B3B30", model_url: "/models/model-5/model_5_browline.glb" },
      { id: "brown-gold", name: "Brown Gold", hex: "#87603C", model_url: "/models/model-5/model_5_brown_gold.glb" },
      { id: "burgundy-rose-gold", name: "Burgundy Rose Gold", hex: "#783E50", model_url: "/models/model-5/model_5_burgundy_rose_gold.glb" },
      { id: "navy-silver", name: "Navy Silver", hex: "#34465D", model_url: "/models/model-5/model_5_navy_silver.glb" }
    ]
  },
  {
    id: "model-6", name: "Evergreen", subtitle: "Everyday Metal",
    description: "A clean everyday frame in understated natural tones.",
    frame_color: "#202326", style: "classic", color_id: "black",
    model_url: "/models/model-6/model_6_black.glb", price: "Try-on ready",
    colors: [
      { id: "black", name: "Black", hex: "#202326", model_url: "/models/model-6/model_6_black.glb" },
      { id: "forest-green", name: "Forest Green", hex: "#435B4A", model_url: "/models/model-6/model_6_forest_green.glb" },
      { id: "gunmetal-grey", name: "Gunmetal Grey", hex: "#697178", model_url: "/models/model-6/model_6_gunmetal_grey.glb" },
      { id: "havana-brown", name: "Havana Brown", hex: "#806044", model_url: "/models/model-6/model_6_havana_brown.glb" }
    ]
  }
];

function TryOnModal({ product, onClose, onSelect }) {
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
        <button className="modal-close" onClick={onClose} aria-label="Close try-on"><X size={21}/></button>
        <div className="modal-camera-column">
          <div className="modal-camera-heading"><span className="modal-live-dot"/> LIVE VIRTUAL TRY-ON <span className="modal-camera-private"><ShieldCheck size={13}/> Private camera</span></div>
          <CameraStage glasses={product}/>
          <p className="modal-camera-footnote">Allow camera access when your browser asks. Your video is processed locally.</p>
        </div>
        <aside className="modal-details">
          <div className="modal-product-heading"><span className="eyebrow">YOUR FITTING ROOM</span><h2>{product.name}</h2><p>{product.subtitle}</p></div>
          <div className="custom-option">
            <div className="custom-option-title"><strong>Frame color</strong><span>{product.colors?.length || 0} colors</span></div>
            <div className="modal-style-list">
              {(product.colors || []).map((color) => (
                <button
                  key={color.id}
                  className={"modal-style-chip " + ((product.color_id || product.colors?.[0]?.id) === color.id ? "active" : "")}
                  onClick={() => onSelect({ ...product, model_url: color.model_url, color_id: color.id, color_name: color.name, frame_color: color.hex })}
                  aria-label={"Choose " + color.name}
                  aria-pressed={(product.color_id || product.colors?.[0]?.id) === color.id}
                >
                  <span className="style-swatch" style={{ backgroundColor: color.hex }} />
                  {color.name}
                  {(product.color_id || product.colors?.[0]?.id) === color.id && <Check size={14}/>}
                </button>
              ))}
            </div>
          </div>
          <div className="custom-option">
            <div className="custom-option-title"><strong>Frame size</strong><span className="size-pill">M · Medium</span></div>
            <p className="option-description">A balanced fit designed for everyday comfort.</p>
          </div>
          <div className="custom-option">
            <div className="custom-option-title"><strong>Lens tint</strong><span className="lens-pill"><span/> Smoke</span></div>
            <p className="option-description">Preview the supplied 3D model and its original lens finish.</p>
          </div>
          <div className="modal-bottom">
            <div className="modal-price"><span>FRAME STATUS</span><strong>{product.price}</strong></div>
            <button className="modal-done-button" onClick={onClose}>Done <ArrowRight size={16}/></button>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default function App() {
  const [catalog, setCatalog] = useState(fallback);
  const [activeProduct, setActiveProduct] = useState(null);

  useEffect(() => {
    let live = true;
    getGlasses().then((data) => {
      if (!live || !Array.isArray(data)) return;
      setCatalog(fallback.map((item) => ({ ...item, ...(data.find((row) => row.id === item.id) || {}), model_url: item.model_url, price: item.price, subtitle: item.subtitle })));
    }).catch(() => {});
    return () => { live = false; };
  }, []);

  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <a className="catalog-brand" href="#" aria-label="Frame Studio home"><span className="catalog-brand-icon"><Glasses size={23}/></span><span>frame<span>studio</span></span></a>
        <nav className="catalog-nav"><a className="nav-active" href="#collection">Sunglasses</a><a href="#how-it-works">Virtual try-on</a><a href="#about">About</a></nav>
        <button className="header-help" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}><HelpCircle size={19}/><span>How it works</span></button>
      </header>

      <section className="catalog-hero">
        <div className="catalog-hero-copy"><span className="eyebrow"><Sparkles size={14}/> THE VIRTUAL EYEWEAR STUDIO</span><h1>Find the frame<br/>that feels like <em>you.</em></h1><p>Explore the collection, then see how your favorite frames look on you. A better fit starts with a try.</p><a className="hero-link" href="#collection">Explore the collection <ArrowRight size={16}/></a></div>
        <div className="catalog-hero-visual"><div className="hero-visual-glow"/><div className="hero-visual-label"><span>THE EVERYDAY EDIT</span><strong>Seven frames. Your point of view.</strong></div><div className="hero-visual-glasses"><Glasses size={180} strokeWidth={1.05}/></div><span className="hero-visual-index">01 / 07</span></div>
      </section>

      <section className="catalog-section" id="collection">
        <div className="catalog-section-heading"><div><span className="eyebrow">CURATED FOR YOU</span><h2>The frame collection</h2><p>Seven signature frames. Find the one that fits your look.</p></div><span className="catalog-count">01 — 07 <ChevronDown size={14}/></span></div>
        <div className="product-grid">
          {catalog.map((item, index) => (
            <article className="product-card" key={item.id}>
              <div className={"product-image product-image-" + item.id}><span className="product-index">0{index + 1}</span><button className="product-favorite" aria-label={"Save " + item.name}><Heart size={19}/></button><ProductModelPreview item={item}/><span className="product-image-caption">FRAME STUDIO · {item.subtitle.toUpperCase()}</span></div>
              <div className="product-card-info"><div><span className="product-category">SUNGLASSES</span><h3>{item.name}</h3><p>{item.description}</p></div><strong className="product-price">{item.price}</strong></div>
              <div className="product-card-bottom"><div className="product-swatches" aria-label={(item.colors?.length || 0) + " available colors"}>{(item.colors || []).map((color) => <span key={color.id} className="style-swatch" title={color.name} style={{ backgroundColor: color.hex }}/>)}</div><button className="tryon-button" onClick={() => setActiveProduct(item)}>Try on <ArrowRight size={15}/></button></div>
            </article>
          ))}
        </div>
      </section>

      <section className="how-section" id="how-it-works"><div className="how-icon"><Sparkles size={22}/></div><div><span className="eyebrow">A FITTING ROOM, ANYWHERE</span><h2>See it before you choose it.</h2><p>Select a frame, open the virtual fitting room, and let the camera place the 3D glasses on your face in real time.</p></div><div className="how-steps"><span><b>01</b> Choose a frame</span><span><b>02</b> Open Try-on</span><span><b>03</b> Find your fit</span></div></section>

      <footer className="catalog-footer" id="about"><a className="catalog-brand" href="#"><span className="catalog-brand-icon"><Glasses size={20}/></span><span>frame<span>studio</span></span></a><span>VIRTUAL GLASSES TRY-ON · MVP</span><span><ShieldCheck size={14}/> Camera processing stays in your browser</span></footer>
      {activeProduct && <TryOnModal product={activeProduct} onSelect={setActiveProduct} onClose={() => setActiveProduct(null)}/>}
    </main>
  );
}
