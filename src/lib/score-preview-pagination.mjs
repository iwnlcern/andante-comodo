// Pure pagination math for the ScorePreview two-page spread viewer.
// Page 1 is a lone cover; spreads then run 2-3, 4-5, ...
export function maxSpreadStart(totalPages) {
  if (totalPages <= 1) return 1;
  return totalPages % 2 === 0 ? totalPages : totalPages - 1;
}

export function normalizeSpreadStart(pageNumber, totalPages) {
  if (totalPages <= 1) return 1;
  if (pageNumber <= 1) return 1;
  let normalized = pageNumber % 2 === 0 ? pageNumber : pageNumber - 1;
  if (normalized < 2) normalized = 2;
  const max = maxSpreadStart(totalPages);
  if (normalized > max) normalized = max;
  return normalized;
}

export function nextSpreadStart(current) {
  return current === 1 ? 2 : current + 2;
}

export function prevSpreadStart(current) {
  return current <= 2 ? 1 : current - 2;
}

export function spreadIndicator(current, totalPages) {
  const showSpread = current !== 1 && current + 1 <= totalPages;
  const right = showSpread ? current + 1 : null;
  return { left: current, right, total: totalPages };
}

export function computeFitScale(wrapWidth, wrapHeight, left, right, zoom, gap = 16) {
  const totalWidth = right ? left.width + right.width + gap : left.width;
  const maxHeight = right ? Math.max(left.height, right.height) : left.height;
  return Math.min(wrapWidth / totalWidth, wrapHeight / maxHeight) * zoom;
}

export function zoomStep(zoom, delta, min, max) {
  return Math.min(max, Math.max(min, Math.round((zoom + delta) * 100) / 100));
}
