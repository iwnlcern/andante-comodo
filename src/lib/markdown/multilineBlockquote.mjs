
// GitLab-style fenced multiline blockquotes: `>>> [!TYPE]` … `>>>` → a standard `>` blockquote,
// rewritten on the raw source before parse (CommonMark mangles `>>>` past recovery otherwise).
const MLBQ_OPEN = /^>>>[ \t]*(.*)$/;
const MLBQ_CLOSE = /^>>>[ \t]*$/;
const CODE_FENCE = /^(```|~~~)/;

export const rewriteMultilineBlockquotes = (src) => {
  const lines = String(src).split('\n');
  const out = [];
  let inCode = false;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (CODE_FENCE.test(line)) {
      inCode = !inCode;
      out.push(line);
      i += 1;
      continue;
    }

    if (!inCode) {
      const open = line.match(MLBQ_OPEN);
      if (open) {
        let j = i + 1;
        let codeInside = false;
        while (j < lines.length) {
          if (CODE_FENCE.test(lines[j])) codeInside = !codeInside;
          else if (!codeInside && MLBQ_CLOSE.test(lines[j])) break;
          j += 1;
        }
        if (j < lines.length) {
          const header = open[1].trim();
          if (header) out.push(`> ${header}`);
          for (const body of lines.slice(i + 1, j)) out.push(body === '' ? '>' : `> ${body}`);
          i = j + 1;
          continue;
        }
        // no close fence: leave the opener as-is and fall through
      }
    }

    out.push(line);
    i += 1;
  }

  return out.join('\n');
};

export function remarkMultilineBlockquote() {
  const original = this.parser;
  if (typeof original !== 'function') return;
  this.parser = (doc, file) => original(rewriteMultilineBlockquotes(doc), file);
}
