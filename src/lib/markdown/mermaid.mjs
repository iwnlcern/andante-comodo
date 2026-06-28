import { textContent } from './ast.mjs';

const mermaidCodeInPre = (node) => {
  if (!node || node.type !== 'element' || node.tagName !== 'pre') return null;

  const code = (node.children || []).find((child) => child.type === 'element' && child.tagName === 'code');
  if (!code) return null;

  const classes = (code.properties && code.properties.className) || [];
  return classes.includes('language-mermaid') ? code : null;
};

export function rehypeMermaid() {
  return (tree, file) => {
    const visit = (node) => {
      if (!node.children) return;

      for (let i = 0; i < node.children.length; i += 1) {
        const child = node.children[i];
        const code = mermaidCodeInPre(child);

        if (code) {
          const src = textContent(code).replace(/\n$/, '');
          node.children[i] = {
            type: 'element',
            tagName: 'pre',
            properties: { className: ['mermaid'], dataMermaidSrc: src },
            children: [{ type: 'text', value: src }],
          };
        } else {
          visit(child);
        }
      }
    };

    visit(tree);
  };
}
