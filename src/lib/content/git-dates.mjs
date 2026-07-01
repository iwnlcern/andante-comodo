import { execFileSync } from 'node:child_process';

const BLOG_DIR = 'src/content/blog';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T/;

/**
 * Parse `git log --format=%cI --name-only -- src/content/blog` output into a
 * newest-wins map of repo-relative file path -> commit Date. Git lists commits
 * newest-first, so the first date seen for a path is its last-modified.
 * @param {string} stdout
 * @returns {Map<string, Date>}
 */
export function parseGitLog(stdout) {
  const map = new Map();
  let currentDate = null;
  for (const raw of String(stdout).split('\n')) {
    const line = raw.trim();
    if (line === '') continue;
    if (ISO_DATE.test(line)) {
      currentDate = new Date(line);
      continue;
    }
    if (currentDate && !map.has(line)) map.set(line, currentDate);
  }
  return map;
}

/**
 * @param {Map<string, Date> | null} map
 * @param {{ filePath?: string, id?: string }} entry
 * @returns {Date | null}
 */
export function lookupDate(map, entry) {
  if (!map) return null;
  const candidates = [];
  if (entry?.filePath) candidates.push(entry.filePath);
  if (entry?.id) candidates.push(`${BLOG_DIR}/${entry.id}.md`, `${BLOG_DIR}/${entry.id}.mdx`);
  for (const candidate of candidates) {
    if (map.has(candidate)) return map.get(candidate);
  }
  return null;
}

let cached;

function defaultRun() {
  return execFileSync('git', ['log', '--format=%cI', '--name-only', '--', BLOG_DIR], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    maxBuffer: 64 * 1024 * 1024,
  });
}

function loadMap(run = defaultRun) {
  if (cached !== undefined) return cached;
  try {
    const stdout = run();
    const map = parseGitLog(stdout);
    if (map.size === 0) {
      console.warn(
        '[git-dates] no git history for src/content/blog; auto "Updated" dates disabled (manual `updated:` still works)',
      );
    }
    cached = map;
  } catch {
    console.warn('[git-dates] git unavailable at build time; auto "Updated" dates disabled (manual `updated:` still works)');
    cached = null;
  }
  return cached;
}

export function __resetCache() {
  cached = undefined;
}

/**
 * Last git commit date for a blog entry, or null when unavailable.
 * @param {{ filePath?: string, id?: string }} entry
 * @param {() => string} run
 * @returns {Date | null}
 */
export function gitLastModified(entry, run = defaultRun) {
  return lookupDate(loadMap(run), entry);
}
