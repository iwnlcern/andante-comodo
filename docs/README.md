---
title: "Content Types"
---

# Content Types

This site uses Astro content collections. Each post type lives in a dedicated folder under `src/content/` and has required frontmatter fields defined in `src/content.config.ts`.

## Blog

Location: `src/content/blog/`

Purpose: Long-form writing and essays.

Required frontmatter:
- `title` (string)
- `description` (string)
- `date` (YYYY-MM-DD)
- `category` (technical | slice-of-life | rants)

Optional frontmatter:
- `tags` (string[])
- `draft` (boolean)
- `unlisted` (boolean)
- `updated` (optional date) — manual override for the "Updated" date shown on a post. When omitted, the last git commit date for the file is used (best-effort; see below). Shown only when later than `date`.
- `epistemic` (optional string) — a one-line epistemic-status / assumed-audience note, rendered as a prominent italic line at the top of the post.
- `ai` (optional object) — AI-involvement disclosure: `level` (integer `0`–`5` on the colophon rubric; see `#how-i-use-ai`), optional `tools` (string[]) and `note` (string). Rendered as a 0–5 signal-strength indicator on the post's metadata line (hover for the exact level and rubric name; links to the colophon rubric). `level: 0` shows empty bars; absent → nothing.

### Drafts

Set `draft: true` on a blog post to keep it out of every listing, the homepage, tag
pages, and both RSS feeds while you work on it. Drafts stay hidden from those surfaces
in all builds. (`draft` exists only on `blog` and defaults to `false`.) A test-only
`INCLUDE_DRAFTS` build flag can surface drafts in non-production builds; production
builds always hide them.

Set `unlisted: true` on a blog post to build it at its normal URL while keeping
it out of every enumeration: the homepage, blog index, tag pages (its tags mint
no tag routes), both RSS feeds (so it never reaches newsletter automation), the
sitemap, and the on-site search index. The page also carries a `noindex` robots
meta tag. Unlike `draft`, the post IS built and anyone with the link can read
it — unlisted is obscurity, not access control. `unlisted` exists only on
`blog` and defaults to `false`. If both flags are set, `draft` wins in
production builds (the post is not built at all). One authoring constraint:
an unlisted post's URL must be derivable without guessing, so either keep its
filename in clean slug form (lowercase letters, digits, hyphens) or set an
explicit `slug` whose `/`-separated segments use that same slug form — anything
else fails the build rather than risk the URL leaking into the sitemap.

Example:
```md
---
title: "Hello World"
description: "My first blog post on this site."
date: 2026-02-04
category: technical
tags: ["meta", "announcement"]
draft: false
unlisted: false
---
```

## Projects

Location: `src/content/projects/`

Purpose: Portfolio entries for software/projects.

Required frontmatter:
- `title` (string)
- `description` (string)
- `date` (YYYY-MM-DD)

Optional frontmatter:
- `tags` (string[])
- `github` (URL)
- `live` (URL)

Example:
```md
---
title: "Example Project"
description: "A one-line summary of what the project does and the stack it uses."
date: 2026-02-05
tags: ["cli", "typescript", "open-source"]
github: "https://github.com/your-handle/example-project"
live: "https://example.com"
---
```

## Garden

Location: `src/content/garden/`

Purpose: Short notes, TILs, and curated resources.

Required frontmatter:
- `title` (string)
- `type` (til | resource | note)
- `date` (YYYY-MM-DD)

Optional frontmatter:
- `tags` (string[])
- `link` (URL)

Example:
```md
---
title: "First TIL"
type: til
date: 2026-02-05
tags: ["astro", "content-collections"]
---
```

## Works

Location: `src/content/works/`

Purpose: Musical compositions with optional audio and score links.

Required frontmatter:
- `title` (string)
- `year` (number | string)

Optional frontmatter:
- `status` (completed | in-progress) — optional, defaults to `completed`
- `audio` (string)
- `score` (string)
- `instrumentation` (string)
- `duration` (string)
- `description` (string)

Example:
```md
---
title: "Symphony No. 1"
year: 2025
instrumentation: "Orchestra"
duration: "12:30"
score: "/scores/symphony-no-1.pdf"
audio: "https://example.com/symphony-no-1.mp3"
---
```

## Reading

Location: `src/content/reading/`

Purpose: Reading list for books and articles.

Required frontmatter:
- `title` (string)
- `type` (book | article)
- `date` (YYYY-MM-DD)

Optional frontmatter:
- `tags` (string[])

Book-specific optional fields:
- `author` (string)
- `status` (read | reading | want-to-read)
- `rating` (number 1–6)

Article-specific fields:
- `link` (URL) — required for articles
- `note` (string)

> `reading` is a discriminated union on `type`. The schema forbids the wrong-variant fields:
> a `book` may not set `link`/`note`; an `article` may not set `author`/`status`/`rating`.
> Setting a forbidden field fails the content build (it is rejected, not ignored).

Example:
```md
---
title: "Structure and Interpretation of Computer Programs"
type: book
date: 2026-01-20
author: "Harold Abelson, Gerald Jay Sussman"
status: reading
rating: 6
tags: ["cs", "classic"]
---
```

## Pages

Location: `src/content/pages/` (`.md` / `.mdx`)

Purpose: standalone long-form pages (e.g. /about). Rendered directly by a
page route — not listed in any index, tag page, or feed.

Required frontmatter:
- `title` (string)
- `description` (string)

Optional frontmatter:
- `updated` (YYYY-MM-DD) — manual override for the "Updated" date; when omitted, the last git commit date for the file is used (best-effort). Pages have no `date`, so it is shown whenever available (no "later than published" gate).
- `epistemic` (optional string) — same as blog: a one-line epistemic-status note rendered as a prominent italic line at the top.
- `ai` (optional object) — same AI-involvement disclosure as blog (`level` `0`–`5`, optional `tools`/`note`), rendered as the 0–5 signal indicator on the page's metadata line.
