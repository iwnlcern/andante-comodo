import { isTag, onlyMeaningful, isWhitespace } from './ast.mjs';
import { applyFloat } from './directives/float.mjs';
import { applyTable } from './directives/table.mjs';
import { applyColumns } from './directives/columns.mjs';
import { directiveWarn } from './directives/warn.mjs';

const HANDLERS = { float: applyFloat, table: applyTable, columns: applyColumns };

// Parse a leading `::: <feature> [primary] [key:val | flag]...` paragraph.
// Returns { feature, opts } or null when `node` is not such a paragraph.
export function parseDirective(node) {
  if (!isTag(node, 'p')) return null;
  // The marker must be a paragraph of ONLY the sigil text. A paragraph that also
  // contains other nodes (e.g. a missing blank line merged the sigil with an
  // image) is NOT a marker; returning null prevents consuming that content.
  const kids = onlyMeaningful(node);
  if (kids.length !== 1 || kids[0].type !== 'text') return null;
  const raw = (kids[0].value || '').trim();
  if (!raw.startsWith(':::')) return null;
  const tokens = raw.slice(3).trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;

  const feature = tokens[0];
  const opts = {};
  let i = 1;
  if (tokens[1] && !tokens[1].includes(':')) {
    opts.primary = tokens[1];
    i = 2;
  }
  for (; i < tokens.length; i += 1) {
    const t = tokens[i];
    const c = t.indexOf(':');
    if (c === -1) opts[t] = true;
    else opts[t.slice(0, c)] = t.slice(c + 1);
  }
  return { feature, opts };
}

export function rehypeDirectives() {
  return (tree, file) => {
    const walk = (node) => {
      if (!node.children || node.children.length === 0) return;

      const out = [];
      for (let i = 0; i < node.children.length; i += 1) {
        const child = node.children[i];
        const dir = parseDirective(child);
        if (!dir) {
          walk(child);
          out.push(child);
          continue;
        }

        let j = i + 1;
        while (j < node.children.length && isWhitespace(node.children[j])) j += 1;
        const target = node.children[j] || null;

        const handler = HANDLERS[dir.feature];
        if (!handler) {
          directiveWarn(file, `unknown directive feature "${dir.feature}"; left as-is`);
          out.push(child);
          continue;
        }
        if (!target) {
          directiveWarn(file, `"${dir.feature}" directive has no target block; left as-is`);
          out.push(child);
          continue;
        }
        const applied = handler(target, dir.opts, file);
        if (!applied) {
          out.push(child);
        }
      }
      node.children = out;
    };

    walk(tree);
  };
}
