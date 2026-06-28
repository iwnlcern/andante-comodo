export const isWhitespace = (node) => node.type === 'text' && node.value.trim() === '';

export const onlyMeaningful = (node) => (node.children || []).filter((child) => !isWhitespace(child));

export const textContent = (node) => {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  return (node.children || []).map(textContent).join('');
};

export const containsAnchor = (node) =>
  (node.type === 'element' && node.tagName === 'a') ||
  (node.children || []).some(containsAnchor);

export const hashGlyph = (id) => ({
  type: 'element',
  tagName: 'a',
  properties: { className: ['hash'], href: `#${id}`, ariaHidden: 'true', tabIndex: -1 },
  children: [{ type: 'text', value: '#' }],
});

export const slugBase = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s/g, '-')
    .replace(/[^\w-]/g, '');

export const uniqueSlug = (base, counts) => {
  const count = counts.get(base) || 0;
  counts.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
};

export const chevronSvg = () => ({
  type: 'element',
  tagName: 'svg',
  properties: { viewBox: '0 0 24 24', ariaHidden: 'true' },
  children: [{ type: 'element', tagName: 'path', properties: { d: 'M6 9l6 6 6-6' }, children: [] }],
});

export const isTag = (node, tag) => node.type === 'element' && node.tagName === tag;

export const classList = (node) => [].concat(node.properties?.className || []);
