# listmonk newsletter automation (RSS + subscribe)

This reference covers two separate newsletter flows: the RSS-to-campaign
automation and the on-site subscribe form.

## RSS automation

This repo includes an RSS-to-listmonk campaign sync script:

- `tools/rss-to-listmonk.mjs`
- `.github/workflows/rss-to-listmonk.yml`

The workflow runs on pushes to `main` that touch `src/content/blog/**/*.md` or
`src/content/blog/**/*.mdx`, and can also be run manually with
`workflow_dispatch`.

### What it does

1. Fetches your RSS feed. If `RSS_FEED_URL` is unset, the script falls back to
   `siteUrl('/rss-blog.xml')`.
2. Selects the first **primary-feed** item. The primary feed is the first
   `inFeed` collection in `collections.mjs` (blog today), and the script
   derives the post path through `POST_PREFIX`.
3. Prevents duplicates by tagging campaign names with a deterministic hash.
4. Creates a draft listmonk campaign using the listmonk API.
5. Leaves the campaign as a draft for review and send from Listmonk.

### Required GitHub Secrets

Set these in GitHub repo settings -> Secrets and variables -> Actions:

- `LISTMONK_BASE_URL` (for example `https://listmonk.example.com`; local runs
  also honor `LISTMONK_BASE`)
- `LISTMONK_USER` (listmonk API username)
- `LISTMONK_TOKEN` (listmonk API token/password)
- `LISTMONK_FROM_EMAIL` (for example `Your Name <news@example.com>`)

Set one of:

- `LISTMONK_LIST_ID` (numeric listmonk list ID)
- `LISTMONK_LIST_UUID` (script resolves UUID to numeric ID)

Optional:

- `RSS_FEED_URL` (optional; defaults to your site's `/rss-blog.xml`)
- `LISTMONK_TEMPLATE_ID`
- `LISTMONK_CAMPAIGN_TAG_PREFIX` (default `rss-auto`)

### Running locally

```bash
npm run rss:sync
```

It reads from local environment variables (see `.env.example`).

### Notes

- The workflow serializes runs with a `rss-to-listmonk` concurrency group and
  does not cancel an in-progress run.
- The script scans up to 50 pages of campaigns and skips if the same RSS item
  already has the deterministic tag or a campaign-name substring match.
- The campaign body uses your dark theme and includes a white CTA button.
- The script always creates a draft campaign; it never sends the campaign.

## On-site subscribe form

The newsletter form posts to `/api/newsletter-subscribe` (`/api/subscribe` is an
alias). It is a separate flow from the RSS automation and uses different config.

### Environment

| Var | Purpose |
| --- | ------- |
| `PUBLIC_RECAPTCHA_SITE_KEY` | Client reCAPTCHA v3 site key (build-inlined via the `PUBLIC_` prefix). |
| `RECAPTCHA_SECRET_KEY` | Server reCAPTCHA secret (true secret). |
| `RECAPTCHA_MIN_SCORE` | v3 score threshold (default `0.5`). |
| `RECAPTCHA_REQUIRED` | `true`/`false` override. Unset = required in production builds. |
| `LISTMONK_BASE_URL` | listmonk public API base (reused from the RSS config). |
| `LISTMONK_LIST_UUIDS` / `LIST_UUID` | Public list UUID(s) to subscribe into. |

### Behavior (fail-closed)

The endpoint posts to listmonk `/api/public/subscription` with `list_uuids`.
It returns **503** if listmonk base URL or list UUIDs are missing, or if
reCAPTCHA is required but the site key/secret is missing. A honeypot field
silently accepts bots; a reCAPTCHA score below the threshold or an action
mismatch returns **400**. Source: `src/pages/api/newsletter-subscribe.ts`,
`src/config/newsletter.ts`.

> **Two flows, two configs:** the RSS automation uses `LISTMONK_USER` /
> `LISTMONK_TOKEN` (Basic auth) + `LISTMONK_LIST_ID`/`LISTMONK_LIST_UUID`; the
> subscribe form uses `LISTMONK_BASE_URL` + `LISTMONK_LIST_UUIDS`/`LIST_UUID` +
> reCAPTCHA, with no user/token.
