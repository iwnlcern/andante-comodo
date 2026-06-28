export function rehypeTableQuotes() {
  // Astro's default smartypants turns a straight quote at the START of a table-cell text
  // node into a CLOSING curly quote (there's no preceding space to mark it as an opener),
  // so `| "Done" |` renders as `”Done”`. A cell never legitimately begins with a closing
  // double-quote, so flip a leading U+201D (”) at the start of any th/td to an opening U+201C (“).
  return (tree) => {
    const firstTextNode = (node) => {
      if (node.type === 'text') return node.value.trim() === '' ? null : node;
      if (!node.children) return null;
      for (const child of node.children) {
        const found = firstTextNode(child);
        if (found) return found;
      }
      return null;
    };

    const walk = (node) => {
      if (!node.children) return;
      for (const child of node.children) {
        if (child.type === 'element' && (child.tagName === 'td' || child.tagName === 'th')) {
          const text = firstTextNode(child);
          if (text) text.value = text.value.replace(/^(\s*)”/, '$1“');
        }
        walk(child);
      }
    };

    walk(tree);
  };
}
