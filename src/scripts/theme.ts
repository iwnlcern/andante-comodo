import { THEME_STORAGE_KEY } from '#scripts/theme-key.mjs';

declare global {
  interface Window {
    __themeInit?: boolean;
  }
}

export function initTheme(): void {
  const storageKey = THEME_STORAGE_KEY;
  const root = document.documentElement;

  const getTheme = () => {
    try {
      const storedTheme = localStorage.getItem(storageKey);
      if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
    } catch {}

    const activeTheme = root.dataset.theme;
    return activeTheme === 'light' || activeTheme === 'dark' ? activeTheme : 'dark';
  };

  const syncControls = (theme: string) => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    const nextLabel = nextTheme === 'light' ? 'Light' : 'Dark';
    const nextIcon = nextTheme === 'light' ? '◐' : '◑';

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;
      button.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
      button.setAttribute('title', `Switch to ${nextTheme} mode`);

      const label = button.querySelector('[data-theme-toggle-label]');
      if (label) label.textContent = nextLabel;

      const icon = button.querySelector('[data-theme-toggle-icon]');
      if (icon) icon.textContent = nextIcon;
    });
  };

  const applyTheme = (theme: string) => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    syncControls(theme);
  };

  applyTheme(getTheme());

  if (window.__themeInit === true) return;
  window.__themeInit = true;

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const toggle = target.closest('[data-theme-toggle]');
    if (!(toggle instanceof HTMLButtonElement)) return;

    const nextTheme = getTheme() === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);

    try {
      localStorage.setItem(storageKey, nextTheme);
    } catch {}
  });

  document.addEventListener('astro:after-swap', initTheme);
}
