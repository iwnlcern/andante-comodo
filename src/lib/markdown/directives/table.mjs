import { isTag, classList } from '../ast.mjs';
import { directiveWarn } from './warn.mjs';

const VALID = new Set(['num', 'text', 'date', 'auto']);

const headerCells = (table) => {
  const thead = (table.children || []).find((c) => isTag(c, 'thead'));
  const row = thead && (thead.children || []).find((c) => isTag(c, 'tr'));
  return row ? (row.children || []).filter((c) => isTag(c, 'th')) : [];
};

// Returns true if applied, false if recognized-but-inapplicable.
export function applyTable(target, opts, file) {
  if (opts.primary !== 'sortable') {
    directiveWarn(file, `unknown table mode "${opts.primary ?? ''}"; ignored`);
    return false;
  }
  if (!isTag(target, 'table')) {
    directiveWarn(file, 'table directive target is not a table; ignored');
    return false;
  }
  target.properties ||= {};
  const cls = classList(target);
  cls.push('sortable');
  target.properties.className = cls;

  const ths = headerCells(target);
  const types = opts.cols ? opts.cols.split(',').map((s) => s.trim()) : [];
  if (types.length > ths.length) {
    directiveWarn(file, `cols: lists ${types.length} types but table has ${ths.length} columns; extra ignored`);
  }
  ths.forEach((thNode, k) => {
    let type = types[k] || 'auto';
    if (!VALID.has(type)) {
      directiveWarn(file, `unknown column type "${type}"; using auto`);
      type = 'auto';
    }
    thNode.properties ||= {};
    thNode.properties.dataSortType = type;
  });
  return true;
}
