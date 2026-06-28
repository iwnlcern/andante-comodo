import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { site } from '../src/config/site.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const publicDir = path.join(root, 'public');

function routeExists(route) {
  const clean = route.replace(/^\/+|\/+$/g, '');
  if (clean === '') return existsSync(path.join(dist, 'index.html'));
  return (
    existsSync(path.join(dist, clean, 'index.html')) ||
    existsSync(path.join(dist, `${clean}.html`))
  );
}

function publicAssetExists(assetPath) {
  assert.match(assetPath, /^\//, `${assetPath} should be root-relative`);
  assert.equal(assetPath.includes('..'), false, `${assetPath} should not escape public/`);
  assert.equal(existsSync(path.join(publicDir, assetPath.slice(1))), true, `${assetPath} missing under public/`);
}

function workAssetPaths() {
  const worksDir = path.join(root, 'src/content/works');
  const paths = [];

  for (const file of readdirSync(worksDir)) {
    if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue;
    const text = readFileSync(path.join(worksDir, file), 'utf8');
    for (const key of ['audio', 'score']) {
      const match = text.match(new RegExp(`^${key}:\\s+[\"']([^\"']+)[\"']`, 'm'));
      if (match) paths.push(match[1]);
    }
  }

  return paths;
}

test('expected static routes and generated indexes exist', () => {
  for (const route of ['/', '/about', '/resume', '/blog', '/garden', '/projects', '/works', '/reading']) {
    assert.equal(routeExists(route), true, `${route} should be built`);
  }

  assert.equal(existsSync(path.join(dist, 'tags')), true, 'tag directory should be built');
  assert.equal(routeExists('/tags/mahler'), true, 'sample tag detail route should be built');

  for (const file of ['rss.xml', 'rss-blog.xml', 'sitemap-index.xml']) {
    assert.equal(existsSync(path.join(dist, file)), true, `${file} should be built`);
  }

  assert.equal(existsSync(path.join(dist, 'pagefind')), true, 'pagefind index should be built');
});

test('combined RSS feed contains at least one item', () => {
  const rss = readFileSync(path.join(dist, 'rss.xml'), 'utf8');
  assert.match(rss, /<item>[\s\S]*<\/item>/, 'rss.xml should contain at least one item');
});

test('configured demo identity renders on the homepage', () => {
  const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
  assert.match(html, new RegExp(site.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(html, /\/portrait\.jpg/);
});

test('configured public asset paths resolve', () => {
  publicAssetExists(site.hero.portrait.src);
  publicAssetExists(site.meta.ogImage);
  publicAssetExists('/favicon.svg');
  publicAssetExists('/favicon.png');

  for (const assetPath of workAssetPaths()) {
    publicAssetExists(assetPath);
  }
});

test('draft blog fixture is absent from a flagless production build', () => {
  assert.equal(routeExists('/blog/draft-rehearsal-note'), false, 'draft route should not be built');
});
