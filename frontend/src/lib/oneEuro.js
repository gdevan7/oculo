// One Euro filter (Casiez et al., CHI 2012): heavy smoothing while the value is nearly still
// (this is what removes jitter) and lighter smoothing as it speeds up (so fast head turns
// do not lag). minCutoff (Hz) sets the smoothing at rest; beta how quickly it opens up with speed.
const alpha = (cutoffHz, dt) => {
  const tau = 1 / (2 * Math.PI * cutoffHz);
  return 1 - Math.exp(-dt / tau);
};

export class OneEuro {
  constructor(minCutoff, beta, dCutoff = 1) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.reset();
  }

  reset() {
    this.x = 0;
    this.dx = 0;
    this.t = 0;
    this.has = false;
  }

  // Returns the filtered value for a sample taken at timeMs.
  filter(value, timeMs) {
    if (!this.has) {
      this.x = value;
      this.t = timeMs;
      this.has = true;
      return value;
    }
    const dt = (timeMs - this.t) / 1000;
    if (!(dt > 0)) return this.x;
    const rawSpeed = (value - this.x) / dt;
    this.dx += (rawSpeed - this.dx) * alpha(this.dCutoff, dt);
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    this.x += (value - this.x) * alpha(cutoff, dt);
    this.t = timeMs;
    return this.x;
  }
}

// Add ?nofilter to the page URL to switch the jitter filter off for an A/B comparison.
export function isFilterEnabled(search = "") {
  return !new URLSearchParams(search).has("nofilter");
}
