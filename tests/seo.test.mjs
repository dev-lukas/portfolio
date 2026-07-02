// SEO/metadata assertions against the built homepage (dist/index.html).
import assert from 'node:assert/strict';
import test from 'node:test';

import { readDist, metaContent } from './helpers.mjs';

const home = readDist('/index.html');

test('homepage has a non-empty <title>', () => {
  const title = home.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
  assert.ok(title, 'expected a <title> element with text');
});

test('homepage has a non-empty meta description', () => {
  const description = metaContent(home, 'description');
  assert.ok(description, 'expected <meta name="description"> with content');
});

test('homepage declares a canonical URL', () => {
  const canonical = home.match(
    /<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*>/i
  )?.[0];
  assert.ok(canonical, 'expected <link rel="canonical">');
  const href = canonical.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
  assert.ok(href, 'canonical link must have an href');
  assert.match(href, /^https?:\/\//, 'canonical URL must be absolute');
});

test('homepage has Open Graph tags', () => {
  for (const key of ['og:title', 'og:description', 'og:image', 'og:url']) {
    assert.ok(metaContent(home, key), `expected <meta property="${key}">`);
  }
});

test('homepage has a Twitter card', () => {
  const card = metaContent(home, 'twitter:card');
  assert.ok(card, 'expected <meta name="twitter:card">');
});

test('homepage has exactly one <h1>', () => {
  const count = (home.match(/<h1[\s>]/g) ?? []).length;
  assert.equal(count, 1, `expected exactly one <h1>, found ${count}`);
});

test('html element declares a lang attribute', () => {
  const lang = home.match(/<html\s+[^>]*\blang\s*=\s*["']([^"']+)["']/i)?.[1];
  assert.ok(lang, 'expected <html lang="...">');
});

test('JSON-LD parses as valid JSON with @type Person', () => {
  const blocks = [
    ...home.matchAll(
      /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ),
  ].map((m) => m[1]);
  assert.ok(blocks.length > 0, 'expected at least one JSON-LD script');

  const parsed = blocks.map((raw) => JSON.parse(raw)); // throws on invalid JSON
  const flat = parsed.flatMap((doc) => (Array.isArray(doc) ? doc : [doc]));
  assert.ok(
    flat.some((doc) => doc['@type'] === 'Person'),
    'expected a JSON-LD document with "@type": "Person"'
  );
});
