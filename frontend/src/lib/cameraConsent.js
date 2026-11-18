// Remembers that the visitor agreed to the camera explanation. Bump the version in the key
// when the wording or purpose changes so everyone is asked again. Storage can be missing or
// throw (private windows, blocked site data), so every access is guarded.
export const CAMERA_CONSENT_KEY = "frame-studio-camera-consent-v1";
const ACCEPTED = "accepted";

export function browserStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function hasCameraConsent(storage = browserStorage()) {
  try {
    return storage?.getItem(CAMERA_CONSENT_KEY) === ACCEPTED;
  } catch {
    return false;
  }
}

// Returns true when the choice could be stored. The caller continues either way.
export function grantCameraConsent(storage = browserStorage()) {
  try {
    if (!storage) return false;
    storage.setItem(CAMERA_CONSENT_KEY, ACCEPTED);
    return true;
  } catch {
    return false;
  }
}
