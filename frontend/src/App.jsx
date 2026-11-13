import { useEffect, useState } from "react";
import { ArrowRight, Check, ChevronDown, Glasses, Heart, HelpCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import CameraStage from "./components/CameraStage.jsx";
import { getGlasses } from "./services/api.js";

const fallback = [
  { id: "white", name: "Cloud", subtitle: "Everyday Essential", description: "A clean, lightweight frame for an effortless everyday look.", frame_color: "#F2F0E9", style: "classic", model_url: "/models/model_0_white.glb", price: "Try-on ready" },
  { id: "tortoiseshell", name: "Frankie", subtitle: "Modern Tortoise", description: "Warm tortoiseshell details with a timeless silhouette.", frame_color: "#70452F", style: "tortoise", model_url: "/models/model_1_tortoiseshell.glb", price: "Try-on ready" },
  { id: "black", name: "Monroe", subtitle: "Classic Black", description: "A confident black frame that goes with just about everything.", frame_color: "#171717", style: "black", model_url: "/models/model_2_black.glb", price: "Try-on ready" }
];

function ProductArtwork({ item }) {
  const tortoise = item.id === "tortoiseshell";
  const white = item.id === "white";
  const frame = white ? "#E8E3D9" : tortoise ? "#65402D" : "#17191D";
  const accent = white ? "#B8B1A4" : tortoise ? "#B77B45" : "#45484E";
  return (
    <svg className="product-artwork" viewBox="0 0 520 330" role="img" aria-label={item.name + " glasses product image"}>
      <defs>
        <linearGradient id={"lens-" + item.id} x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={white ? "#B7C8D0" : "#343B43"} stopOpacity=".78" />
          <stop offset="1" stopColor={white ? "#687D88" : "#111820"} stopOpacity=".96" />
        </linearGradient>
        <filter id={"shadow-" + item.id} x="-20%" y="-30%" width="140%" height="170%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <ellipse cx="260" cy="251" rx="170" ry="15" fill="#172033" opacity=".12" filter={"url(#shadow-" + item.id + ")"} />
      <g transform={tortoise ? "rotate(-2 260 165)" : "rotate(1 260 165)"} strokeLinecap="round" strokeLinejoin="round">
        <path d="M44 113 Q91 83 147 102 L174 113 L166 136 Q154 158 132 177 L101 187 Q69 185 56 163 Q44 142 44 113Z" fill={"url(#lens-" + item.id + ")"} stroke={frame} strokeWidth="13"/>
        <path d="M476 113 Q429 83 373 102 L346 113 L354 136 Q366 158 388 177 L419 187 Q451 185 464 163 Q476 142 476 113Z" fill={"url(#lens-" + item.id + ")"} stroke={frame} strokeWidth="13"/>
        <path d="M174 119 Q260 98 346 119" fill="none" stroke={frame} strokeWidth="12"/>
        <path d="M44 119 Q20 104 9 116" fill="none" stroke={frame} strokeWidth="12"/>
        <path d="M476 119 Q500 104 511 116" fill="none" stroke={frame} strokeWidth="12"/>
        <path d="M61 111 Q104 91 147 107" fill="none" stroke={accent} strokeWidth="3" opacity=".75"/>
        <path d="M373 107 Q416 91 459 111" fill="none" stroke={accent} strokeWidth="3" opacity=".75"/>
        {tortoise && <g fill="#C18A53" opacity=".8"><circle cx="75" cy="105" r="4"/><circle cx="98" cy="178" r="3"/><circle cx="438" cy="104" r="4"/><circle cx="414" cy="178" r="3"/></g>}
        <path d="M180 120 Q260 108 340 120" fill="none" stroke={accent} strokeWidth="2" opacity=".65"/>
      </g>
    </svg>
  );
}

function TryOnModal({ product, catalog, onClose, onSelect }) {
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
            <div className="custom-option-title"><strong>Frame style</strong><span>3 styles</span></div>
            <div className="modal-style-list">
              {catalog.map((item) => (
                <button key={item.id} className={"modal-style-chip " + (item.id === product.id ? "active" : "")} onClick={() => onSelect(item)} aria-label={"Try " + item.name} aria-pressed={item.id === product.id}>
                  <span className={"style-swatch swatch-" + item.id}/>{item.name}{item.id === product.id && <Check size={14}/>}
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
        <div className="catalog-hero-visual"><div className="hero-visual-glow"/><div className="hero-visual-label"><span>THE EVERYDAY EDIT</span><strong>Three frames. Your point of view.</strong></div><div className="hero-visual-glasses"><Glasses size={180} strokeWidth={1.05}/></div><span className="hero-visual-index">01 / 03</span></div>
      </section>

      <section className="catalog-section" id="collection">
        <div className="catalog-section-heading"><div><span className="eyebrow">CURATED FOR YOU</span><h2>The frame collection</h2><p>Three signature styles. Find the one that fits your look.</p></div><span className="catalog-count">01 — 03 <ChevronDown size={14}/></span></div>
        <div className="product-grid">
          {catalog.map((item, index) => (
            <article className="product-card" key={item.id}>
              <div className={"product-image product-image-" + item.id}><span className="product-index">0{index + 1}</span><button className="product-favorite" aria-label={"Save " + item.name}><Heart size={19}/></button><ProductArtwork item={item}/><span className="product-image-caption">FRAME STUDIO · {item.subtitle.toUpperCase()}</span></div>
              <div className="product-card-info"><div><span className="product-category">SUNGLASSES</span><h3>{item.name}</h3><p>{item.description}</p></div><strong className="product-price">{item.price}</strong></div>
              <div className="product-card-bottom"><div className="product-swatches"><span className={"style-swatch swatch-" + item.id}/><span className="swatch-muted"/><span className="swatch-muted light"/></div><button className="tryon-button" onClick={() => setActiveProduct(item)}>Try on <ArrowRight size={15}/></button></div>
            </article>
          ))}
        </div>
      </section>

      <section className="how-section" id="how-it-works"><div className="how-icon"><Sparkles size={22}/></div><div><span className="eyebrow">A FITTING ROOM, ANYWHERE</span><h2>See it before you choose it.</h2><p>Select a frame, open the virtual fitting room, and let the camera place the 3D glasses on your face in real time.</p></div><div className="how-steps"><span><b>01</b> Choose a frame</span><span><b>02</b> Open Try-on</span><span><b>03</b> Find your fit</span></div></section>

      <footer className="catalog-footer" id="about"><a className="catalog-brand" href="#"><span className="catalog-brand-icon"><Glasses size={20}/></span><span>frame<span>studio</span></span></a><span>VIRTUAL GLASSES TRY-ON · MVP</span><span><ShieldCheck size={14}/> Camera processing stays in your browser</span></footer>
      {activeProduct && <TryOnModal product={activeProduct} catalog={catalog} onSelect={setActiveProduct} onClose={() => setActiveProduct(null)}/>}
    </main>
  );
}
