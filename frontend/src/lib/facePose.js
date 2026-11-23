import { coverCrop } from "./coverCrop.js";

// Pose of the glasses computed from MediaPipe face landmarks. Pure math (no React / Three.js)
// so it can be unit tested and shared by the live camera view and the still-photo try-on.

// Real distance (mm) between the two eye landmarks used to scale the frame.
export const EYE_MM = 90;

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lengthOf = (a) => Math.hypot(a[0], a[1], a[2]);
const normalize = (a) => {
  const length = lengthOf(a);
  return length > 0 ? [a[0] / length, a[1] / length, a[2] / length] : [0, 0, 0];
};

// lm: MediaPipe landmarks (x, y, z normalised to the source image/video).
// sourceW/sourceH: pixel size of that source. viewW/viewH: pixel size of the surface the glasses are
// drawn on; the source is fitted to it with `object-fit: cover` (pass the same size for a still photo).
// Returns null when a needed landmark is missing. Otherwise:
//   x, y     eye midpoint in view pixels, relative to the view centre, y pointing up
//   scale    view pixels per mm of the glasses model
//   right, up, forward   orthonormal face axes in source-pixel space (when basisValid)
export function facePose(lm, { sourceW, sourceH, viewW, viewH }) {
  const left = lm?.[33], right = lm?.[263], top = lm?.[10], chin = lm?.[152];
  if (!left || !right || !top || !chin) return null;

  // Landmarks are in the unmirrored source. Convert them to source-pixel 3D coordinates (including the
  // landmark z) and build the axes from the eye line and the face's vertical axis, so the frame turns
  // with the head instead of relying on a yaw angle taken from the transformation matrix.
  const toPoint = (p) => [p.x * sourceW, -p.y * sourceH, -p.z * sourceW];
  const eyeLeft = toPoint(left), eyeRight = toPoint(right);

  const rightAxis = normalize(sub(eyeRight, eyeLeft));
  let upAxis = sub(toPoint(top), toPoint(chin));
  const along = dot(upAxis, rightAxis);
  upAxis = normalize([upAxis[0] - rightAxis[0] * along, upAxis[1] - rightAxis[1] * along, upAxis[2] - rightAxis[2] * along]);
  const forwardAxis = normalize(cross(rightAxis, upAxis));

  // Incomplete or degenerate landmark geometry (for example during a fast turn) gives a zero axis.
  const basisValid = [rightAxis, upAxis, forwardAxis].every((axis) => dot(axis, axis) > 0.5);

  const { coverScale, renderedW, renderedH, cropX, cropY } = coverCrop(sourceW, sourceH, viewW, viewH);
  const midX = ((left.x + right.x) / 2) * renderedW - cropX;
  const midY = ((left.y + right.y) / 2) * renderedH - cropY;
  return {
    x: midX - viewW / 2,
    y: viewH / 2 - midY,
    scale: (lengthOf(sub(eyeRight, eyeLeft)) * coverScale) / EYE_MM,
    right: rightAxis,
    up: upAxis,
    forward: forwardAxis,
    basisValid,
  };
}

// How far the head is turned left/right, in degrees (0 = facing the camera).
export function headYawDegrees(pose) {
  if (!pose?.basisValid) return 0;
  return Math.abs((Math.atan2(pose.forward[0], pose.forward[2]) * 180) / Math.PI);
}
