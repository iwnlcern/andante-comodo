import { isWhitespace, onlyMeaningful, textContent, hashGlyph, slugBase, uniqueSlug } from './ast.mjs';
import { imageDimensions } from './imageDimensions.mjs';

const imageInParagraph = (node) => {
  if (!node || node.type !== 'element' || node.tagName !== 'p') return null;
  const children = onlyMeaningful(node);
  return children.length === 1 && children[0].type === 'element' && children[0].tagName === 'img'
    ? children[0]
    : null;
};

const italicParagraph = (node) => {
  if (!node || node.type !== 'element' || node.tagName !== 'p') return null;
  const children = onlyMeaningful(node);
  return children.length === 1 && children[0].type === 'element' && children[0].tagName === 'em'
    ? children[0]
    : null;
};

export function rehypeFigures() {
  return (tree, file) => {
    const figCounts = new Map();

    const walk = (node) => {
      if (!node.children || node.children.length === 0) return;

      const nextChildren = [];
      let index = 0;

      while (index < node.children.length) {
        const child = node.children[index];
        const image = imageInParagraph(child);

        if (!image) {
          walk(child);
          nextChildren.push(child);
          index += 1;
          continue;
        }

        let captionIndex = index + 1;
        while (captionIndex < node.children.length && isWhitespace(node.children[captionIndex])) {
          captionIndex += 1;
        }

        const promotedCaption = italicParagraph(node.children[captionIndex]);
        let captionChildren = null;
        let consumeThrough = index;

        if (promotedCaption) {
          captionChildren = [promotedCaption];
          consumeThrough = captionIndex;
        } else {
          const alt = image.properties && image.properties.alt;
          if (alt && String(alt).trim()) {
            captionChildren = [{ type: 'text', value: String(alt) }];
          }
        }

        const src = String((image.properties && image.properties.src) || '');
        image.properties ||= {};
        image.properties.loading ||= 'lazy';
        image.properties.decoding ||= 'async';
        const dimensions = imageDimensions(src);
        if (dimensions) {
          image.properties.width ||= dimensions.width;
          image.properties.height ||= dimensions.height;
        }

        const figureChildren = [image];

        if (captionChildren) {
          figureChildren.push({
            type: 'element',
            tagName: 'figcaption',
            properties: {},
            children: captionChildren,
          });
        }

        const figSlug = slugBase(
          textContent({ children: captionChildren || [] }) || String((image.properties && image.properties.alt) || ''),
        );
        const figureNode = {
          type: 'element',
          tagName: 'figure',
          properties: {
            className: ['post-figure', src.toLowerCase().endsWith('.svg') ? 'is-diagram' : 'is-photo'],
          },
          children: figureChildren,
        };

        if (figSlug) {
          const figId = `fig-${uniqueSlug(figSlug, figCounts)}`;
          figureNode.properties.id = figId;
          const figcaption = figureChildren.find((c) => c.type === 'element' && c.tagName === 'figcaption');
          if (figcaption) figcaption.children.push(hashGlyph(figId));
        }

        nextChildren.push(figureNode);

        index = consumeThrough + 1;
      }

      node.children = nextChildren;
    };

    walk(tree);
  };
}
