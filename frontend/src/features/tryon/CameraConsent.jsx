import { useEffect } from "react";
import { ArrowRight, CheckCircle2, Glasses, ShieldCheck, X } from "lucide-react";

export default function CameraConsent({ onAgree, onDisagree }) {
  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && onDisagree();
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onDisagree]);

  return (
    <div className="consent-backdrop">
      <section className="consent-dialog" role="dialog" aria-modal="true" aria-labelledby="consent-title">
        <button className="consent-close" onClick={onDisagree} aria-label="Close consent"><X size={19}/></button>
        <div className="consent-visual">
          <div className="consent-illustration">
            <div className="consent-phone">
              <span className="consent-camera-dot"/>
              <Glasses size={57} strokeWidth={1.25}/>
              <span className="consent-face-line"/>
            </div>
            <div className="consent-frame-stack"><Glasses size={38}/><Glasses size={38}/><Glasses size={38}/></div>
          </div>
          <p>Before entering your virtual fitting room, please review how the camera is used.</p>
          <span className="consent-brand">FRAME STUDIO · VIRTUAL TRY-ON</span>
        </div>
        <div className="consent-copy">
          <div>
            <span className="eyebrow">CAMERA & PRIVACY</span>
            <h2 id="consent-title">Your camera, your choice.</h2>
            <p className="consent-intro">We use your camera to position the selected 3D glasses on your face in real time.</p>
            <div className="consent-points">
              <div><CheckCircle2/><span><strong>Face tracking only</strong><small>Face landmarks are processed in your browser to align the virtual frame. The app does not identify who you are.</small></span></div>
              <div><CheckCircle2/><span><strong>No camera-frame upload in the try-on flow</strong><small>The live camera stream is used on this device and is not uploaded or stored by this app.</small></span></div>
              <div><ShieldCheck/><span><strong>Permission is requested separately</strong><small>After you agree, press “Start camera”. Your browser will then ask for camera access, which you can deny at any time.</small></span></div>
            </div>
            <p className="consent-note">Your choice is remembered on this browser. You can revoke camera access later in your browser settings. Agreeing here does not itself turn on the camera.</p>
          </div>
          <div className="consent-actions">
            <button className="consent-disagree" onClick={onDisagree}>I disagree</button>
            <button className="consent-agree" onClick={onAgree}>I agree <ArrowRight size={17}/></button>
          </div>
        </div>
      </section>
    </div>
  );
}
