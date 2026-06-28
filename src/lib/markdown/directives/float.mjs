import { isTag, classList } from '../ast.mjs';
import { directiveWarn } from './warn.mjs';

const WIDTH_RE = /^\d+(?:\.\d+)?(?:%|px)$/;
const appendStyle = (props, decl) => {
  props.style = [props.style, decl].filter(Boolean).join(';');
};

// Returns true if the directive was applied, false if it was a recognized-but-
// inapplicable no-op (so dispatch can leave the marker visible).
export function applyFloat(target, opts, file) {
  if (!isTag(target, 'figure')) {
    directiveWarn(file, 'float directive target is not a figure; ignored');
    return false;
  }
  const side = opts.primary;
  if (side !== 'left' && side !== 'right') {
    directiveWarn(file, `float side must be "left" or "right" (got "${side ?? ''}"); ignored`);
    return false;
  }
  target.properties ||= {};
  const cls = classList(target);
  cls.push(`float-${side}`);
  target.properties.className = cls;

  if (opts.width) {
    // CSS custom property (not raw `width`) so the mobile @media rule can override to 100%.
    if (WIDTH_RE.test(opts.width)) appendStyle(target.properties, `--float-width:${opts.width}`);
    else directiveWarn(file, `invalid float width "${opts.width}"; using default`);
  }
  if (opts.clear) {
    if (['left', 'right', 'both'].includes(opts.clear)) appendStyle(target.properties, `clear:${opts.clear}`);
    else directiveWarn(file, `invalid clear "${opts.clear}"; ignored`);
  }
  return true;
}
