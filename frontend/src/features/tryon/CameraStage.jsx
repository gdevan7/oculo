import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Download, RotateCcw, Upload } from "lucide-react";
import GlassesScene from "./GlassesScene.jsx";
import PhotoResult from "./PhotoResult.jsx";
import { createFaceTracker } from "./faceTracker.js";
import { canvasFromFile, canvasFromVideo, createPhotoTryOn } from "./photoTryOn.js";
import { cameraErrorMessage } from "../../lib/cameraError.js";
import { PhotoError, photoErrorMessage } from "../../lib/photoInput.js";

const DEFAULT_AR = "16/10";
// Add ?debug to the page URL to show how long each face detection takes on this device.
const DEBUG = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug");

export default function CameraStage({ glasses }) {
  const video = useRef(null);
  const stream = useRef(null);
  const tracker = useRef(null);
  const raf = useRef(0);
  const last = useRef(-1);
  // Landmark + matriks pose disimpan di ref agar tidak memicu render React tiap frame.
  const track = useRef({ lm: null, matrix: null });
  const hasFace = useRef(false);
  const dbg = useRef(null);
  const stats = useRef({ ema: 0, n: 0, since: 0 });

  const [on, setOn] = useState(false);
  const [face, setFace] = useState(false);
  const [ar, setAr] = useState(DEFAULT_AR);
  const [status, setStatus] = useState("Camera is off");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // Still-photo try-on: `photo` is the result shown in the preview, `photoBusy` blocks a second request.
  const [photo, setPhoto] = useState(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const photoBusyRef = useRef(false);
  const mounted = useRef(true);
  const photoUrl = useRef("");
  const fileInput = useRef(null);

  const clearTrack = useCallback(() => {
    track.current = { lm: null, matrix: null };
    hasFace.current = false;
    setFace(false);
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
    clearTrack();
    setOn(false);
    setAr(DEFAULT_AR);
    setStatus("Camera is off");
  }, [clearTrack]);

  const tick = useCallback(() => {
    const v = video.current;
    if (v && tracker.current && v.readyState >= 2 && v.currentTime !== last.current) {
      last.current = v.currentTime;
      try {
        const t0 = performance.now();
        const r = tracker.current.detectForVideo(v, t0);
        if (DEBUG) {
          const t1 = performance.now(), st = stats.current;
          st.ema = st.ema ? st.ema * 0.9 + (t1 - t0) * 0.1 : t1 - t0;
          st.n++;
          if (!st.since) st.since = t1;
          if (t1 - st.since >= 1000 && dbg.current) {
            dbg.current.textContent = `detect ${st.ema.toFixed(0)} ms · ${((st.n * 1000) / (t1 - st.since)).toFixed(0)} Hz`;
            st.n = 0; st.since = t1;
          }
        }
        if (r.faceLandmarks?.length) {
          track.current = {
            lm: r.faceLandmarks[0],
            matrix: r.facialTransformationMatrixes?.[0]?.data ?? null,
            videoWidth: v.videoWidth,
            videoHeight: v.videoHeight,
            t: t0, // when this frame was picked up for detection; used to compensate latency
          };
          if (!hasFace.current) {
            hasFace.current = true;
            setFace(true);
            setStatus("Face detected · tracking active");
          }
        } else {
          track.current = { lm: null, matrix: null };
          if (hasFace.current) {
            hasFace.current = false;
            setFace(false);
            setStatus("Move into camera view");
          }
        }
      } catch {
        setStatus("Tracking frame skipped");
      }
    }
    raf.current = requestAnimationFrame(tick);
  }, []);

  async function start() {
    setError("");
    setBusy(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw Error("Camera needs a modern browser on localhost or HTTPS.");
      }
      setStatus("Requesting camera permission…");
      stream.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (!tracker.current) {
        setStatus("Loading face tracking model…");
        tracker.current = await createFaceTracker();
      }
      video.current.srcObject = stream.current;
      await video.current.play();
      // Samakan rasio stage dengan video asli: tidak perlu hitungan crop object-fit.
      const { videoWidth: vw, videoHeight: vh } = video.current;
      if (vw && vh) setAr(`${vw}/${vh}`);
      setOn(true);
      setStatus("Camera active · looking for face");
      last.current = -1;
      raf.current = requestAnimationFrame(tick);
    } catch (e) {
      stream.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
      setOn(false);
      setError(cameraErrorMessage(e));
      setStatus("Camera could not start");
    } finally {
      setBusy(false);
    }
  }

  function screenshot() {
    const v = video.current;
    if (!v || v.readyState < 2) {
      setError("Start the camera before saving a screenshot.");
      return;
    }
    const c = document.createElement("canvas");
    c.width = v.videoWidth || 1280;
    c.height = v.videoHeight || 720;
    const ctx = c.getContext("2d");
    // Video dan overlay sama-sama dicerminkan di preview, jadi cerminkan keduanya.
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const gl = document.querySelector(".glasses-scene canvas");
    if (gl) ctx.drawImage(gl, 0, 0, c.width, c.height);
    const a = document.createElement("a");
    a.download = `frame-studio-${Date.now()}.png`;
    a.href = c.toDataURL();
    a.click();
  }

  function closePhoto() {
    setPhoto(null);
    if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
    photoUrl.current = "";
  }

  // Builds a photo with the frame on it. `getSource` returns the picture (a canvas) and runs right away,
  // so a camera photo is the exact frame that was on screen when the button was pressed.
  async function runPhoto(getSource, mirror) {
    if (photoBusyRef.current) return;
    photoBusyRef.current = true;
    setPhotoBusy(true);
    setError("");
    setStatus("Creating your photo…");
    // The tracker switches to still-image mode for a moment, so live detection pauses meanwhile.
    cancelAnimationFrame(raf.current);
    try {
      const source = await getSource();
      if (!tracker.current) {
        try {
          tracker.current = await createFaceTracker();
        } catch {
          throw new PhotoError("The face tracking model could not be loaded. Check your connection and try again.");
        }
      }
      const result = await createPhotoTryOn({ tracker: tracker.current, source, modelUrl: glasses?.model_url });
      if (!mounted.current) return; // the try-on window was closed while the photo was being made
      if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
      photoUrl.current = URL.createObjectURL(result.blob);
      setPhoto({ url: photoUrl.current, width: result.width, height: result.height, yaw: result.yaw, mirror });
    } catch (e) {
      if (!(e instanceof PhotoError)) console.error("[Photo try-on]", e);
      setError(photoErrorMessage(e));
    } finally {
      photoBusyRef.current = false;
      // After the window is closed there is nothing to resume: the cleanup already stopped camera and tracker.
      if (mounted.current) {
        setPhotoBusy(false);
        if (stream.current) {
          last.current = -1;
          raf.current = requestAnimationFrame(tick);
          setStatus(hasFace.current ? "Face detected · tracking active" : "Camera active · looking for face");
        } else {
          setStatus("Camera is off");
        }
      }
    }
  }

  function takePhoto() {
    const v = video.current;
    if (!v || v.readyState < 2) {
      setError("Start the camera before taking a photo.");
      return;
    }
    // A camera photo is shown mirrored first, like the live preview the person was looking at.
    runPhoto(() => canvasFromVideo(v), true);
  }

  function onPhotoFile(event) {
    const file = event.target.files?.[0];
    event.target.value = ""; // lets the same file be chosen again
    if (file) runPhoto(() => canvasFromFile(file), false);
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelAnimationFrame(raf.current);
      stream.current?.getTracks().forEach((t) => t.stop());
      tracker.current?.close();
      if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
    };
  }, []);

  return (
    <section className="tryon-card">
      <div className="stage-toolbar">
        <div>
          <span className={`live-dot ${on ? "active" : ""}`} />
          {status}
        </div>
        <button className="icon-button" onClick={screenshot} aria-label="Save screenshot" title="Save screenshot">
          <Download size={17} />
        </button>
      </div>
      <div className="camera-stage" style={{ aspectRatio: ar }}>
        <video
          ref={video}
          className="camera-video"
          autoPlay
          playsInline
          muted
          style={{ display: on ? "block" : "none" }}
        />
        <div className={`camera-placeholder ${on ? "hidden" : ""}`}>
          <div className="placeholder-icon">
            <Camera size={28} />
          </div>
          <h3>Your virtual fitting room</h3>
          <p>Start your camera to preview a 3D frame on your face.</p>
          <span className="privacy-note">Your camera stays on this device.</span>
        </div>
        <div className="overlay-mirror">
          <GlassesScene glasses={glasses} trackRef={track} enabled={on} />
        </div>
        {on && !face && <div className="tracking-hint">Center your face in the frame</div>}
        {DEBUG && on && (
          <div
            ref={dbg}
            style={{
              position: "absolute", left: 8, bottom: 8, zIndex: 5, pointerEvents: "none",
              font: "11px/1.4 monospace", color: "#fff", background: "rgba(0,0,0,.6)",
              padding: "2px 6px", borderRadius: 4,
            }}
          />
        )}
      </div>
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}
      <div className="stage-actions">
        {!on ? (
          <button className="primary-button" disabled={busy} onClick={start}>
            <Camera size={17} />
            {busy ? "Starting…" : "Start camera"}
          </button>
        ) : (
          <button className="secondary-button" onClick={stop}>
            <CameraOff size={17} />
            Stop camera
          </button>
        )}
        {on && (
          <button className="secondary-button" onClick={takePhoto} disabled={photoBusy}>
            <Camera size={17} />
            {photoBusy ? "Working…" : "Take photo"}
          </button>
        )}
        <button className="text-button" onClick={() => fileInput.current?.click()} disabled={photoBusy}>
          <Upload size={15} />
          Upload photo
        </button>
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={onPhotoFile} />
        <button
          className="text-button"
          onClick={() => {
            setError("");
            clearTrack();
            setStatus(on ? "Looking for face…" : "Camera is off");
          }}
        >
          <RotateCcw size={15} />
          Reset fit
        </button>
      </div>
      {photo && <PhotoResult photo={photo} onClose={closePhoto} />}
    </section>
  );
}
