export function ogImagePath(pathname) {
  const slug = pathname.replace(/^\/+|\/+$/g, '') || 'home';
  return `/og/${slug}.png`;
}
