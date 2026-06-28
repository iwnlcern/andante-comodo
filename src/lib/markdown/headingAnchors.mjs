import { textContent, slugBase, uniqueSlug, hashGlyph, containsAnchor } from './ast.mjs';

export function rehypeHeadingAnchors() {
  return (tree, file) => {
    const slugCounts = new Map();

    const visit = (node) => {
      if (!node.children) return;

      for (const child of node.children) {
        if (
          child.type === 'element' &&
          (child.tagName === 'h2' || child.tagName === 'h3' || child.tagName === 'h4')
        ) {
          child.properties ||= {};
          let id = child.properties.id;
          if (!id) {
            id = uniqueSlug(slugBase(textContent(child)), slugCounts);
            child.properties.id = id;
          }

          if (id && id !== 'footnote-label') {
            if (!child.children.some(containsAnchor)) {
              child.children = [
                {
                  type: 'element',
                  tagName: 'a',
                  properties: { className: ['head-link'], href: `#${id}` },
                  children: child.children,
                },
              ];
            }
            child.children.push(hashGlyph(id));
          }
        }

        visit(child);
      }
    };

    visit(tree);
  };
}
