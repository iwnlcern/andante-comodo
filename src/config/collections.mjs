/**
 * Collection roster. Keep ids stable; change labels, descriptions, slugs,
 * ordering, and visibility to fit your site.
 */
export const collections = [
  {
    id: 'blog',
    label: 'Writing',
    description: 'Essays, programme notes, and markdown examples.',
    slug: '/blog',
    enabled: true,
    inNav: true,
    home: { show: true, limit: 3 },
    inFeed: true,
    accent: 'technical',
    taxonomy: {
      technical: { label: 'Technical', accent: 'technical' },
      'slice-of-life': { label: 'Notebook', accent: 'slice-of-life' },
      rants: { label: 'Opinion', accent: 'rants' },
    },
  },
  {
    id: 'garden',
    label: 'Notebook',
    description: 'Fragments, rehearsal notes, and resources.',
    slug: '/garden',
    enabled: true,
    inNav: true,
    home: { show: true, limit: 3 },
    inFeed: true,
    accent: 'slice-of-life',
    taxonomy: {
      til: { label: 'Today I Learned' },
      resource: { label: 'Resource' },
      note: { label: 'Note' },
    },
  },
  {
    id: 'projects',
    label: 'Premieres',
    description: 'Premieres, engagements, and public milestones.',
    slug: '/projects',
    enabled: true,
    inNav: true,
    home: { show: true, limit: 2 },
    inFeed: false,
    accent: 'project',
  },
  {
    id: 'works',
    label: 'Compositions',
    description: 'Scores and recordings for the demo archive.',
    slug: '/works',
    enabled: true,
    inNav: true,
    home: { show: true, limit: 2 },
    inFeed: false,
    accent: 'work',
  },
  {
    id: 'reading',
    label: 'Scores & Books',
    description: 'Books, scores, and articles to replace with your own lists.',
    slug: '/reading',
    enabled: true,
    inNav: true,
    home: { show: true, limit: 3 },
    inFeed: false,
    accent: 'rants',
    taxonomy: {
      reading: { label: 'Currently Reading' },
      read: { label: 'Read' },
      'want-to-read': { label: 'Want to Read' },
    },
  },
];

export const standalonePages = [
  { label: 'About', href: '/about' },
  { label: 'Resume', href: '/resume' },
];
