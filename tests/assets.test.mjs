// Asset sanity: favicon presence/reference and local image resolution.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  DIST,
  walkDist,
  urlPathOf,
  resolveDistPath,
  metaContent,
} from './helpers.mjs';

const pages = walkDist().map((file) => ({
  file,
  urlPath: urlPathOf(file),
  html: readFileSync(file, 'utf8'),
}));

test('favicon.svg exists in dist and is referenced from every page', () => {
  assert.ok(
    existsSync(path.join(DIST, 'favicon.svg')),
    'dist/favicon.svg must exist'
  );
  for (const page of pages) {
    const iconLink = page.html.match(
      /<link\s+[^>]*rel\s*=\s*["'][^"']*icon[^"']*["'][^>]*>/i
    )?.[0];
    assert.ok(iconLink, `${page.urlPath}: expected a <link rel="icon">`);
    const href = iconLink.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    assert.equal(href, '/favicon.svg', `${page.urlPath}: icon href`);
  }
});

test('every local <img src> resolves to a file in dist', () => {
  const failures = [];

  for (const page of pages) {
    for (const tag of page.html.match(/<img\s[^>]*>/gi) ?? []) {
      const src = tag.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i)?.[1];
      // Empty src (JS-populated, e.g. lightbox), data URIs and remote
      // images are out of scope for a static file check.
      if (!src || src.startsWith('data:') || /^(?:https?:)?\/\//i.test(src)) {
        continue;
      }
      const pathname = src.startsWith('/')
        ? src
        : new URL(src, `https://x.test${page.urlPath}`).pathname;
      if (!resolveDistPath(pathname)) {
        failures.push(`${page.urlPath}: <img src="${src}"> missing in dist`);
      }
    }
  }

  assert.deepEqual(failures, []);
});

test('og:image on every page resolves to a file in dist', () => {
  for (const page of pages) {
    const ogImage = metaContent(page.html, 'og:image');
    assert.ok(ogImage, `${page.urlPath}: expected og:image meta tag`);

    // og:image is an absolute URL on the site's own origin; check the
    // referenced path exists in the build output. Skip truly remote hosts.
    const canonicalHref = page.html
      .match(/<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*>/i)?.[0]
      ?.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    const siteOrigin =
      canonicalHref && /^https?:\/\//.test(canonicalHref)
        ? new URL(canonicalHref).origin
        : null;

    let pathname;
    if (ogImage.startsWith('/')) {
      pathname = ogImage;
    } else {
      const url = new URL(ogImage);
      if (siteOrigin && url.origin !== siteOrigin) continue; // remote image
      pathname = url.pathname;
    }
    assert.ok(
      resolveDistPath(pathname),
      `${page.urlPath}: og:image "${ogImage}" does not resolve in dist`
    );
  }
});
