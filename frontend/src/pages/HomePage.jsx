import { ArrowRight, Glasses, ShieldCheck, Sparkles } from "lucide-react";

export default function HomePage({ onOpenCatalog, onExploreCatalog }) {
  return (
    <>
        <section className="catalog-hero home-hero">
          <div className="catalog-hero-copy">
            <span className="eyebrow"><Sparkles size={14}/> THE VIRTUAL EYEWEAR STUDIO</span>
            <h1>Find the frame<br/>that feels like <em>you.</em></h1>
            <p>Explore the collection, then see how your favorite frames look on you. A better fit starts with a try.</p>
            <button className="home-try-button" onClick={onOpenCatalog}>Try on <ArrowRight size={17}/></button>
          </div>
          <div className="catalog-hero-visual"><img className="catalog-hero-person" src="/images/catalog-hero-portrait.jpg" alt="Person wearing eyeglasses in the Frame Studio collection"/></div>
        </section>

        <section className="home-intro" id="how-it-works">
          <span className="eyebrow">A FITTING ROOM, ANYWHERE</span>
          <h2>Find your fit before you decide.</h2>
          <p>Browse the collection, choose a frame, and see how it looks on you with our real-time virtual try-on experience.</p>
          <button className="home-secondary-button" onClick={onExploreCatalog}>Explore the catalog <ArrowRight size={16}/></button>
        </section>

        <section className="about-section" id="about">
          <div className="about-copy">
            <span className="eyebrow">ABOUT FRAME STUDIO</span>
            <h2>Eyewear should feel like you.</h2>
            <p>Frame Studio brings a curated collection of eyewear and an interactive fitting room into one simple experience. Choose a style, explore its colors, and preview the frame using your camera.</p>
          </div>
          <div className="about-points">
            <div><Glasses size={21}/><span><strong>Signature frames</strong><small>A focused collection with color options for every model.</small></span></div>
            <div><Sparkles size={21}/><span><strong>Virtual try-on</strong><small>Preview your selected 3D frame in real time.</small></span></div>
            <div><ShieldCheck size={21}/><span><strong>Privacy-conscious camera</strong><small>Camera access starts only after your consent.</small></span></div>
          </div>
        </section>
    </>
  );
}
