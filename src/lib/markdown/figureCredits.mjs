import { textContent, classList } from './ast.mjs';

const CREDIT_STOPWORDS = new Set(['the', 'a', 'an', 'that', 'of', 'all', 'way', 'to', 'and']);
const IMG_EXT_RE = /\.(svg|jpe?g|png|webp|gif|avif)$/i;

export const creditSlug = (src) => {
  let base = (src || '').split('/').pop() || '';
  base = base.replace(IMG_EXT_RE, '').replace(IMG_EXT_RE, '');
  return base;
};

export const creditTokens = (str) =>
  (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter((token) => token && !CREDIT_STOPWORDS.has(token));

export const creditScore = (a, b) => {
  let score = 0;
  for (const x of a) {
    for (const y of b) {
      if (x === y) {
        score += 2;
        break;
      }
      if (x.length >= 4 && (x.startsWith(y) || y.startsWith(x))) {
        score += 1;
        break;
      }
    }
  }
  return score;
};

const imageCreditsList = (tree) => {
  let seen = false;
  for (const node of tree.children || []) {
    if (node.type !== 'element') continue;
    if (node.tagName === 'h2' && /\bimage credits\b/i.test(textContent(node))) {
      seen = true;
      continue;
    }
    if (seen) {
      if (node.tagName === 'ul') return node;
      if (node.tagName === 'h2') return null;
    }
  }
  return null;
};

const collectFigures = (node, out) => {
  if (node.type === 'element' && node.tagName === 'figure') {
    const classes = classList(node);
    if (classes.includes('post-figure')) out.push(node);
  }
  (node.children || []).forEach((child) => collectFigures(child, out));
};

const firstImage = (node) => {
  if (node.type === 'element' && node.tagName === 'img') return node;
  for (const child of node.children || []) {
    const found = firstImage(child);
    if (found) return found;
  }
  return null;
};

export function rehypeFigureCredits() {
  return (tree, file) => {
    const list = imageCreditsList(tree);
    if (!list) return;

    const credits = [];
    let n = 0;
    for (const item of list.children) {
      if (item.type !== 'element' || item.tagName !== 'li') continue;
      const strongNode = (item.children || []).find((c) => c.type === 'element' && c.tagName === 'strong');
      const id = `img-credit-${n}`;
      item.properties ||= {};
      item.properties.id ||= id;
      credits.push({ id, tokens: creditTokens(strongNode ? textContent(strongNode) : '') });
      n += 1;
    }
    if (!credits.length) return;

    const figures = [];
    collectFigures(tree, figures);
    for (const fig of figures) {
      const image = firstImage(fig);
      if (!image) continue;
      const figTokens = creditTokens(creditSlug(String(image.properties?.src || '')));
      let best = null;
      let bestScore = 0;
      for (const credit of credits) {
        const score = creditScore(figTokens, credit.tokens);
        if (score > bestScore) {
          bestScore = score;
          best = credit;
        }
      }
      if (best && bestScore > 0) {
        fig.properties ||= {};
        fig.properties.dataCreditRef = best.id;
      }
    }
  };
}
