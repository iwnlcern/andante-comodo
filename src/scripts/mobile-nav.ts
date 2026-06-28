declare global {
  interface Window {
    __mobileNavAfterSwapBound?: boolean;
  }
}

export function initMobileNav(): void {
  const button = document.getElementById('mobile-nav-toggle');
  const panel = document.getElementById('mobile-nav-panel');

  if (button instanceof HTMLButtonElement && panel instanceof HTMLElement && button.dataset.initialized !== 'true') {
    button.dataset.initialized = 'true';

    const setOpen = (open: boolean) => {
      panel.classList.toggle('hidden', !open);
      button.setAttribute('aria-expanded', String(open));
    };

    setOpen(false);

    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      setOpen(!isOpen);
    });

    panel.addEventListener('click', (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('a')) setOpen(false);
    });
  }

  if (window.__mobileNavAfterSwapBound === true) return;
  window.__mobileNavAfterSwapBound = true;
  document.addEventListener('astro:after-swap', initMobileNav);
}
