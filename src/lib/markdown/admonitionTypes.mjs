export const ADMONITION_TYPES = {
  note: { type: 'note', label: 'Note', icon: 'mask', src: '/img/info.svg' },
  tip: { type: 'tip', label: 'Tip', icon: 'img', src: '/img/lightbulb.svg' },
  caution: { type: 'caution', label: 'Caution', icon: 'bend', bends: 1 },
  danger: { type: 'danger', label: 'Danger', icon: 'bend', bends: 2 },
};

export const ADMONITION_RE = /^\[!(NOTE|TIP|CAUTION|DANGER)\][^\S\n]*\n?/i;

export const admonitionIconNodes = (cfg) => {
  if (cfg.icon === 'mask') {
    return [
      {
        type: 'element',
        tagName: 'span',
        properties: { className: ['adm-icon-mask'], style: `--mask-src:url('${cfg.src}')` },
        children: [],
      },
    ];
  }
  if (cfg.icon === 'img') {
    return [
      {
        type: 'element',
        tagName: 'img',
        properties: { className: ['adm-icon-img'], src: cfg.src, alt: '' },
        children: [],
      },
    ];
  }
  return Array.from({ length: cfg.bends }, () => ({
    type: 'element',
    tagName: 'img',
    properties: { className: ['bend-sign'], src: '/img/dangerous-bend.svg', alt: '' },
    children: [],
  }));
};
