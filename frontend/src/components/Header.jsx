import { Glasses, UserRound } from "lucide-react";

export default function Header({ page, onHome, onCatalog, onAbout, onLogin }) {
  return (
      <header className="catalog-header">
        <button className="catalog-brand" onClick={onHome} aria-label="Frame Studio home">
          <span className="catalog-brand-icon"><Glasses size={23}/></span><span>frame<span>studio</span></span>
        </button>
        <nav className="catalog-nav" aria-label="Main navigation">
          <button className={page === "catalog" ? "nav-active" : ""} onClick={onCatalog}>Catalog</button>
          <button onClick={onAbout}>About</button>
        </nav>
        <button className="header-profile" onClick={onLogin} aria-label="Open login"><UserRound size={19}/></button>
      </header>
  );
}
