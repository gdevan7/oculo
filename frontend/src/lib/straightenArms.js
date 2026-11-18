// Evergreen (model-6) has temple arms that flare outward by ~12 mm towards the ear, so in the
// catalog's straight-on view they stick out sideways instead of lining up with the frame.
// This removes that outward drift: behind the hinge, each slice of the arm (by depth) is moved
// sideways so its inner edge matches the inner edge at the hinge. Only x changes.
//
// points: array of {x, y, z} in model space with the frame front at frontZ and the arms
// running towards -z. unit: model units per millimetre. Returns the new x for every point.
export const HINGE_BEHIND_FRONT_MM = 12;
export const SLICE_MM = 5;

export function straightenedX(points, frontZ, unit = 1) {
  const hingeZ = frontZ - HINGE_BEHIND_FRONT_MM * unit;
  const slice = SLICE_MM * unit;
  const xs = points.map((p) => p.x);
  for (const side of [1, -1]) {
    const inner = new Map(); // slice index -> smallest |x| on this side
    points.forEach((p) => {
      if (side * p.x <= 0 || p.z >= hingeZ) return;
      const k = Math.floor((p.z - hingeZ) / slice);
      const ax = side * p.x;
      if (!inner.has(k) || ax < inner.get(k)) inner.set(k, ax);
    });
    if (!inner.size) continue;
    const ref = inner.get(Math.max(...inner.keys())); // slice nearest the hinge
    points.forEach((p, i) => {
      if (side * p.x <= 0 || p.z >= hingeZ) return;
      xs[i] = p.x - side * (inner.get(Math.floor((p.z - hingeZ) / slice)) - ref);
    });
  }
  return xs;
}
