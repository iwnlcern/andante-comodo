import { textContent, chevronSvg, classList } from './ast.mjs';
import { ADMONITION_TYPES, ADMONITION_RE, admonitionIconNodes } from './admonitionTypes.mjs';

const SIDENOTE_LONG_THRESHOLD = 220;

const isBackref = (node) =>
  node.type === 'element' &&
  node.tagName === 'a' &&
  (node.properties?.dataFootnoteBackref !== undefined ||
    String(node.properties?.className || '').includes('data-footnote-backref'));

const phrasingFromFootnote = (li) => {
  const paragraphs = (li.children || []).filter((c) => c.type === 'element' && c.tagName === 'p');
  const out = [];
  paragraphs.forEach((para, i) => {
    if (i > 0) out.push({ type: 'element', tagName: 'br', properties: {}, children: [] });
    for (const node of para.children) {
      if (isBackref(node)) continue;
      out.push(structuredClone(node));
    }
  });

  while (out.length && out.at(-1).type === 'text' && !out.at(-1).value.trim()) out.pop();
  return out;
};

// A footnote whose body starts with [!TYPE] becomes a typed sidenote. Strips the marker in place,
// labels the source <li> for the mobile footnote, and memoizes so repeat refs resolve identically.
// Depends on admonition metadata imported from ./admonitionTypes.mjs.
const footnoteAdmonitionType = (li) => {
  if (li._admType !== undefined) return li._admType;
  const para = (li.children || []).find((c) => c.type === 'element' && c.tagName === 'p');
  const firstText = para && (para.children || [])[0];
  if (!firstText || firstText.type !== 'text') {
    li._admType = null;
    return null;
  }
  const match = firstText.value.match(ADMONITION_RE);
  if (!match) {
    li._admType = null;
    return null;
  }
  const type = match[1].toLowerCase();
  firstText.value = firstText.value.slice(match[0].length);
  para.children.unshift(
    {
      type: 'element',
      tagName: 'strong',
      properties: { className: ['fn-type', `type-${type}`] },
      children: [{ type: 'text', value: ADMONITION_TYPES[type].label }],
    },
    { type: 'text', value: ' ' },
  );
  li._admType = type;
  return type;
};

export function rehypeSidenotes() {
  return (tree, file) => {
    const notes = new Map();
    const indexNotes = (node) => {
      if (
        node.type === 'element' &&
        node.tagName === 'li' &&
        String(node.properties?.id || '').startsWith('user-content-fn-')
      ) {
        notes.set(node.properties.id, node);
      }
      (node.children || []).forEach(indexNotes);
    };
    indexNotes(tree);
    if (!notes.size) return;

    let counter = 0;
    const walk = (node) => {
      if (!node.children) return;
      const next = [];

      for (const child of node.children) {
        next.push(child);
        const ref =
          child.type === 'element' && child.tagName === 'sup'
            ? (child.children || []).find(
                (c) => c.tagName === 'a' && c.properties?.dataFootnoteRef !== undefined,
              )
            : null;

        if (ref) {
          const targetId = String(ref.properties.href || '').replace(/^#/, '');
          const li = notes.get(targetId);
          if (li) {
            const admType = footnoteAdmonitionType(li);
            let body = phrasingFromFootnote(li);
            if (admType) {
              body = body.filter(
                (n) => !(n.type === 'element' && classList(n).includes('fn-type')),
              );
              while (body.length && body[0].type === 'text' && !body[0].value.trim()) body.shift();
              body.unshift({
                type: 'element',
                tagName: 'span',
                properties: { className: ['sn-icon'], ariaHidden: 'true' },
                children: admonitionIconNodes(ADMONITION_TYPES[admType]),
              });
            }
            const long = textContent({ children: body }).trim().length > SIDENOTE_LONG_THRESHOLD;
            const num = textContent(ref);
            const className = long ? ['sidenote', 'is-long'] : ['sidenote'];
            if (admType) className.push('is-typed', `type-${admType}`);
            const children = [];
            const toggleId = `sn-toggle-${counter}`;

            if (long) {
              children.push({
                type: 'element',
                tagName: 'input',
                properties: { type: 'checkbox', className: ['sidenote-toggle'], id: toggleId },
                children: [],
              });
            }
            children.push({
              type: 'element',
              tagName: 'a',
              properties: { className: ['sn-num'], href: `#${ref.properties.id}` },
              children: [{ type: 'text', value: num }],
            });
            children.push({
              type: 'element',
              tagName: 'span',
              properties: { className: ['sn-body'] },
              children: body,
            });
            if (long) {
              children.push({
                type: 'element',
                tagName: 'label',
                properties: { className: ['sn-chevron'], htmlFor: toggleId, ariaLabel: 'Expand note' },
                children: [chevronSvg()],
              });
            }
            next.push({
              type: 'element',
              tagName: 'span',
              properties: { className, dataSidenoteFor: targetId },
              children,
            });
            counter += 1;
          }
        } else {
          walk(child);
        }
      }

      node.children = next;
    };
    walk(tree);
  };
}
