export function initPrintPage(root: ParentNode = document) {
  for (const button of root.querySelectorAll<HTMLElement>('[data-print-page]')) {
    if (button.dataset.printPageBound === 'true') continue;
    button.dataset.printPageBound = 'true';
    button.addEventListener('click', () => window.print());
  }
}
