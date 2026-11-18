// Geometry of CSS `object-fit: cover`: the source video is scaled until it fills the stage
// (w x h) and the overflow is cropped equally on both sides. Used to map landmark
// coordinates (0..1 of the video) onto stage pixels.
export function coverCrop(sourceW, sourceH, w, h) {
  const coverScale = Math.max(w / sourceW, h / sourceH);
  const renderedW = sourceW * coverScale;
  const renderedH = sourceH * coverScale;
  return {
    coverScale,
    renderedW,
    renderedH,
    cropX: (renderedW - w) / 2,
    cropY: (renderedH - h) / 2,
  };
}
