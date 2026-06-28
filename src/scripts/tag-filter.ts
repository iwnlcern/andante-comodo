function initTagFilter() {
  const norm = (t: string) => t.trim().toLowerCase();

  document.querySelectorAll<HTMLElement>('[data-tag-filter-scope]').forEach((scope) => {
    if (scope.dataset.tagFilterBound === 'true') return;
    scope.dataset.tagFilterBound = 'true';

    const status = scope.querySelector<HTMLElement>('[data-tag-filter-status]');
    const label = scope.querySelector<HTMLElement>('[data-tag-filter-label]');
    let active: string | null = null;

    const update = () => {
      scope.querySelectorAll<HTMLElement>('[data-filter-tags]').forEach((item) => {
        const tags = (item.dataset.filterTags || '').split(',').map(norm).filter(Boolean);
        item.classList.toggle('is-filtered', !!active && !tags.includes(active));
      });

      scope.querySelectorAll<HTMLElement>('.tag-filter').forEach((btn) => {
        const on = !!active && norm(btn.dataset.tag || '') === active;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });

      if (status) status.hidden = !active;
      if (label) label.textContent = active ? `#${active}` : '';
    };

    scope.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;

      if (t.closest('[data-tag-filter-clear]')) {
        e.preventDefault();
        active = null;
        update();
        return;
      }

      const btn = t.closest<HTMLElement>('.tag-filter');
      if (!btn) return;

      e.preventDefault();
      const tag = norm(btn.dataset.tag || '');
      active = active === tag ? null : tag;
      update();
    });

    update();
  });
}

initTagFilter();
document.addEventListener('astro:after-swap', initTagFilter);
