import { Glasses, ShieldCheck } from "lucide-react";

export default function Footer({ onHome }) {
  return (
      <footer className="catalog-footer">
        <button className="catalog-brand footer-home-link" onClick={onHome}><span className="catalog-brand-icon"><Glasses size={20}/></span><span>frame<span>studio</span></span></button>
        <span>VIRTUAL GLASSES TRY-ON · MVP</span>
        <span><ShieldCheck size={14}/> Camera processing stays in your browser</span>
      </footer>
  );
}
