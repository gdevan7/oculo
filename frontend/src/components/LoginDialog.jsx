import { UserRound, X } from "lucide-react";

export default function LoginDialog({ onClose }) {
  return (
    <div className="login-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose}>
      <section className="login-dialog" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button className="login-close" onClick={onClose} aria-label="Close login"><X size={19}/></button>
        <span className="catalog-brand-icon login-icon"><UserRound size={22}/></span>
        <span className="eyebrow">YOUR FRAME STUDIO ACCOUNT</span>
        <h2 id="login-title">Welcome back.</h2>
        <p>Sign-in will be available when account authentication is connected.</p>
        <label>Email address<input type="email" placeholder="you@example.com" disabled/></label>
        <label>Password<input type="password" placeholder="Enter your password" disabled/></label>
        <button className="login-submit" disabled>Login · Coming soon</button>
        <small>This is a visual login placeholder. No account data is collected.</small>
      </section>
    </div>
  );
}
