// Readable message for a failed camera start (getUserMedia, video.play or tracker setup).
export function cameraErrorMessage(error) {
  return error?.name === "NotAllowedError"
    ? "Camera permission denied. Allow access in browser settings."
    : error?.message || "Could not start camera.";
}
