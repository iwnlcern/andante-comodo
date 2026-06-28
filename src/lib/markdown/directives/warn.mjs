export const directiveWarn = (file, msg) => {
  const path = (file && (file.path || (file.history && file.history[0]))) || 'unknown';
  console.warn(`[rehype-directives] ${path}: ${msg}`);
};
