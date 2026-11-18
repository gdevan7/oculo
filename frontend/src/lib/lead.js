// Latency compensation for one tracked value (a position, a scale or an angle).
//
// Face detection runs on the main thread, so every pose is already a few frames old when
// it is drawn. A Lead keeps a smoothed velocity and returns the value slightly ahead along
// it. The lead is capped, and a dead band keeps a still head still.

export const PREDICT_EXTRA_S = 0.02; // vsync/compositing delay that JS cannot see
export const MAX_HORIZON_S = 0.25; // never look further ahead than this
export const STALE_GAP_S = 0.25; // a longer gap between samples restarts the velocity estimate
export const MIN_DT_S = 0.004; // samples closer than this carry no usable velocity

// Add ?nopredict to the page URL to switch prediction off for an A/B comparison.
export function isPredictionEnabled(search = "") {
  return !new URLSearchParams(search).has("nopredict");
}

export class Lead {
  // dead: speed (units/s) below which no lead is applied; cap: largest lead (units).
  constructor(dead, cap, enabled = true) {
    this.dead = dead;
    this.cap = cap;
    this.enabled = enabled;
    this.reset();
  }

  reset() {
    this.v = 0;
    this.t = 0;
    this.vel = 0;
    this.has = false;
  }

  // value measured at timeMs (performance.now() scale).
  push(value, timeMs) {
    if (this.has) {
      const dt = (timeMs - this.t) / 1000;
      if (dt > STALE_GAP_S) this.vel = 0;
      else if (dt > MIN_DT_S) {
        const raw = (value - this.v) / dt;
        // Follow speed-ups slowly (less noise) but let go of the velocity faster when slowing down.
        const tc = Math.abs(raw) >= Math.abs(this.vel) ? 0.12 : 0.05;
        this.vel += (raw - this.vel) * (1 - Math.exp(-dt / tc));
      }
    }
    this.v = value;
    this.t = timeMs;
    this.has = true;
  }

  // Predicted value at nowMs; tau is the extra smoothing delay (s) the caller adds afterwards.
  at(nowMs, tau) {
    if (!this.enabled) return this.v;
    const h = Math.min((nowMs - this.t) / 1000 + PREDICT_EXTRA_S + tau, MAX_HORIZON_S);
    const mag = Math.max(0, Math.abs(this.vel) - this.dead);
    return this.v + Math.max(-this.cap, Math.min(this.cap, Math.sign(this.vel) * mag * h));
  }
}
