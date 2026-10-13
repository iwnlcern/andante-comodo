#!/usr/bin/env node
// Prebuild step: deepen a shallow git clone so content "Updated" dates can be derived.
//
// Cloudflare Pages (like most CI) clones depth-1. src/lib/content/git-dates.mjs refuses to
// read dates from a shallow clone, because every file would look modified at clone time, so
// production silently drops the auto "Updated" line that local builds show. Fetching the
// history first fixes that. A blob-less filter keeps it cheap: `git log --name-only` needs
// commits and trees, not file contents. This never fails the build: no git, a full clone, or
// an unreachable remote all fall through and git-dates keeps its existing fallback.
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

function defaultExec(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}

/**
 * @param {{ exec?: (args: string[]) => string, log?: (msg: string) => void }} [deps]
 * @returns {'no-git' | 'full' | 'unshallowed' | 'failed'}
 */
export function unshallow({ exec = defaultExec, log = console.warn } = {}) {
  let shallow;
  try {
    shallow = exec(['rev-parse', '--is-shallow-repository']).trim() === 'true';
  } catch {
    return 'no-git';
  }
  if (!shallow) return 'full';

  const attempts = [
    ['fetch', '--quiet', '--unshallow', '--filter=blob:none', 'origin'],
    ['fetch', '--quiet', '--unshallow', 'origin'],
  ];
  for (const args of attempts) {
    try {
      exec(args);
      log('[git-unshallow] shallow clone deepened; git-based "Updated" dates enabled');
      return 'unshallowed';
    } catch {
      // try the next, less restrictive fetch
    }
  }
  log('[git-unshallow] could not deepen the shallow clone; auto "Updated" dates stay disabled (manual `updated:` still works)');
  return 'failed';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  unshallow();
}
