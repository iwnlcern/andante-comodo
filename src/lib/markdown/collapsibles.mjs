import { textContent, isTag, chevronSvg, classList } from './ast.mjs';

const COLLAPSIBLE_RE = /\b(references|bibliography|image credits|credits|acknowledge?ments|sources|further reading)\b/i;

const stripHeadingAnchors = (heading) => {
  const next = [];
  for (const child of heading.children || []) {
    if (child.type === 'element' && child.tagName === 'a') {
      const classes = classList(child);
      if (classes.includes('hash')) continue;
      if (classes.includes('head-link')) {
        next.push(...(child.children || []));
        continue;
      }
    }
    next.push(child);
  }
  heading.children = next;
  return heading;
};

const collapseDetails = (heading, content) => ({
  type: 'element',
  tagName: 'details',
  properties: { className: ['collapse-section'] },
  children: [
    {
      type: 'element',
      tagName: 'summary',
      properties: { className: ['collapse-summary'] },
      children: [
        stripHeadingAnchors(heading),
        {
          type: 'element',
          tagName: 'span',
          properties: { className: ['collapse-chevron'], ariaHidden: 'true' },
          children: [chevronSvg()],
        },
      ],
    },
    { type: 'element', tagName: 'div', properties: { className: ['collapse-content'] }, children: content },
  ],
});

export function rehypeCollapsibles() {
  return (tree, file) => {
    const kids = tree.children || [];
    const out = [];
    let i = 0;

    while (i < kids.length) {
      const node = kids[i];
      if (isTag(node, 'h2') && COLLAPSIBLE_RE.test(textContent(node))) {
        let j = i + 1;
        const section = [];
        while (j < kids.length && !isTag(kids[j], 'h2')) {
          section.push(kids[j]);
          j += 1;
        }

        if (section.some((n) => isTag(n, 'h3'))) {
          out.push(node);
          let k = 0;
          while (k < section.length && !isTag(section[k], 'h3')) {
            out.push(section[k]);
            k += 1;
          }
          while (k < section.length) {
            const heading = section[k];
            k += 1;
            const content = [];
            while (k < section.length && !isTag(section[k], 'h3')) {
              content.push(section[k]);
              k += 1;
            }
            out.push(collapseDetails(heading, content));
          }
        } else {
          out.push(collapseDetails(node, section));
        }

        i = j;
        continue;
      }
      out.push(node);
      i += 1;
    }

    tree.children = out;
  };
}
