/**
 * Edit this file first when adapting the template. Keep the key names stable;
 * pages and feeds read these values directly.
 */
export const site = {
  name: 'Gustav Mahler',
  email: 'mahler@example.com',
  url: 'https://example.com',
  meta: {
    description: 'Composer and conductor, presented as a replaceable demo identity for this Astro template.',
    ogImage: '/og-image.png',
  },
  hero: {
    eyebrow: 'Composer | Conductor | Opera Director',
    headline: 'Gustav Mahler',
    bio: 'A template demo for a long-form personal site, populated with public-domain and openly licensed Mahler material.',
    portrait: {
      src: '/portrait.jpg',
      alt: 'Portrait of Gustav Mahler',
      credit: 'Public domain photograph by Moritz Naehr. See public/CREDITS.md.',
    },
    ctas: [
      { label: 'Resume', href: '/resume' },
      { label: 'Compositions', href: '/works' },
      { label: 'Writing', href: '/blog' },
    ],
    bioLink: { label: 'About the demo', href: '/about' },
  },
  social: {
    github: 'https://github.com/your-handle',
    linkedin: 'https://www.linkedin.com/in/your-handle',
    rss: '/rss.xml',
  },
  feeds: {
    title: "Mahler's Notebook",
    description: 'Essays, notes, scores, and recordings from the demo archive.',
    blogDescription: 'Essays and programme notes.',
  },
};
