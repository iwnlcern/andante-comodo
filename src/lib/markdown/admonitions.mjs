import { onlyMeaningful } from './ast.mjs';
import { ADMONITION_TYPES, ADMONITION_RE, admonitionIconNodes } from './admonitionTypes.mjs';

const admonitionFromBlockquote = (bq) => {
  const meaningful = onlyMeaningful(bq);
  const firstP = meaningful[0];
  if (!firstP || firstP.type !== 'element' || firstP.tagName !== 'p') return null;
  const firstText = (firstP.children || [])[0];
  if (!firstText || firstText.type !== 'text') return null;
  const match = firstText.value.match(ADMONITION_RE);
  if (!match) return null;

  const cfg = ADMONITION_TYPES[match[1].toLowerCase()];
  firstText.value = firstText.value.slice(match[0].length);
  const firstPEmpty = onlyMeaningful(firstP).length === 0;

  const title = {
    type: 'element',
    tagName: 'div',
    properties: { className: ['admonition-title'] },
    children: [
      {
        type: 'element',
        tagName: 'span',
        properties: { className: ['admonition-icon'], ariaHidden: 'true' },
        children: admonitionIconNodes(cfg),
      },
      { type: 'element', tagName: 'p', properties: {}, children: [{ type: 'text', value: cfg.label }] },
    ],
  };

  const body = bq.children.filter((child) => !(child === firstP && firstPEmpty));
  return {
    type: 'element',
    tagName: 'div',
    properties: { className: ['admonition', cfg.type] },
    children: [title, ...body],
  };
};

export function rehypeAdmonitions() {
  return (tree, file) => {
    const visit = (node) => {
      if (!node.children) return;
      for (let i = 0; i < node.children.length; i += 1) {
        const child = node.children[i];
        if (child.type === 'element' && child.tagName === 'blockquote') {
          const admonition = admonitionFromBlockquote(child);
          if (admonition) {
            node.children[i] = admonition;
            continue;
          }
        }
        visit(child);
      }
    };

    visit(tree);
  };
}
