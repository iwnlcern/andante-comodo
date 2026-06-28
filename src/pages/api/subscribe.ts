// Intentional public alias of /api/newsletter-subscribe: re-exports the same POST
// handler and returns 405 for GET. Kept for external/legacy callers; do not remove
// without an operator decision (DSN-D-LOCK-001 Q4).
import type { APIRoute } from 'astro';

export { prerender, POST } from './newsletter-subscribe';

export const GET: APIRoute = async () =>
  new Response('Method Not Allowed', {
    status: 405,
    headers: {
      Allow: 'POST',
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
