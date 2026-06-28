import { isTag, classList } from '../ast.mjs';
import { directiveWarn } from './warn.mjs';

// Returns true if applied, false if recognized-but-inapplicable.
export function applyColumns(target, opts, file) {
  if (isTag(target, 'ol')) {
    directiveWarn(file, 'columns on an ordered list is ignored');
    return false;
  }
  if (!isTag(target, 'ul')) {
    directiveWarn(file, 'columns directive target is not a list; ignored');
    return false;
  }
  const n = Number(opts.primary);
  if (!Number.isInteger(n) || n < 2) {
    directiveWarn(file, `columns count must be an integer >= 2 (got "${opts.primary ?? ''}"); ignored`);
    return false;
  }
  target.properties ||= {};
  const cls = classList(target);
  cls.push('multicol');
  target.properties.className = cls;
  target.properties.style = [target.properties.style, `--cols:${n}`].filter(Boolean).join(';');
  return true;
}
