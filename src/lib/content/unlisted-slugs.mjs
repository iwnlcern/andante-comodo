// Sitemap-exclusion scanner. astro.config.mjs cannot use getCollection at
// config time, so this reads blog frontmatter directly, parsed with the
// `yaml` package (direct dependency) so every YAML spelling Astro accepts is
// understood. It is deliberately fail-closed: any ambiguity throws and breaks
// the build, because the failure mode of guessing is an unlisted URL silently
// leaking into the sitemap.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const CONTENT_EXTENSIONS = ['.md', '.mdx'];
const SLUG_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function contentFiles(dir, prefix = '') {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      out.push(...contentFiles(join(dir, entry.name), rel));
    } else if (CONTENT_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      out.push(rel);
    }
  }
  return out;
}

function frontmatterOf(raw, file) {
  const lines = raw.replace(/^\uFEFF/, '').replaceAll('\r\n', '\n').split('\n');
  if (lines[0]?.trimEnd() !== '---') {
    throw new Error(`${file}: missing frontmatter fence; cannot determine unlisted state`);
  }
  const close = lines.findIndex((line, index) => index > 0 && line.trimEnd() === '---');
  if (close === -1) {
    throw new Error(`${file}: unterminated frontmatter fence; cannot determine unlisted state`);
  }
  return lines.slice(1, close).join('\n');
}

function frontmatterDataOf(raw, file) {
  const frontmatter = frontmatterOf(raw, file);
  try {
    // yaml's parse is strict by default: malformed YAML and duplicate keys throw.
    return parse(frontmatter) ?? {};
  } catch (cause) {
    throw new Error(
      `${file}: unparseable frontmatter - refusing to guess unlisted state (${cause.message})`
    );
  }
}

/** Entry IDs of unlisted blog posts, mirroring Astro glob-loader ID rules. */
export function unlistedBlogSlugs(dir = 'src/content/blog') {
  const slugs = [];
  for (const rel of contentFiles(dir)) {
    const data = frontmatterDataOf(readFileSync(join(dir, rel), 'utf8'), rel);

    if (data.unlisted === undefined || data.unlisted === false) continue;
    if (data.unlisted !== true) {
      throw new Error(
        `${rel}: unlisted must be a plain boolean, got ${JSON.stringify(data.unlisted)}`
      );
    }

    if (data.slug !== undefined) {
      if (typeof data.slug !== 'string' || data.slug === '') {
        throw new Error(`${rel}: slug override must be a non-empty string`);
      }
      slugs.push(data.slug);
      continue;
    }

    const id = rel.replace(/\.(md|mdx)$/, '');
    for (const segment of id.split('/')) {
      if (!SLUG_SEGMENT.test(segment)) {
        throw new Error(
          `${rel}: path segment ${JSON.stringify(segment)} is not in slug form ` +
            `(lowercase letters, digits, hyphens). Astro would slugify this path and the ` +
            `sitemap exclusion would miss the built route. Add an explicit slug to the ` +
            `frontmatter or rename the file.`
        );
      }
    }
    slugs.push(id);
  }
  return slugs;
}
