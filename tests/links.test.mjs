// Link and anchor integrity across every built HTML page in dist/.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  walkDist,
  readDist,
  urlPathOf,
  resolveDistPath,
  attrValues,
  idsIn,
} from './helpers.mjs';

const pages = walkDist().map((file) => ({
  file,
  urlPath: urlPathOf(file),
  html: readFileSync(file, 'utf8'),
}));

const isExternal = (href) =>
  /^(?:https?:)?\/\//i.test(href) ||
  /^(?:mailto|tel|data|javascript):/i.test(href);

test('dist contains built HTML pages', () => {
  assert.ok(pages.length > 0, 'expected at least one .html file in dist/');
});

test('every internal href on every page resolves to a built file', () => {
  const failures = [];

  for (const page of pages) {
    for (const href of attrValues(page.html, 'href')) {
      if (!href || isExternal(href) || href.startsWith('#')) continue;

      // Resolve relative hrefs against the page's own URL path.
      const target = href.startsWith('/')
        ? href
        : new URL(href, `https://x.test${page.urlPath}`).pathname +
          (href.includes('#') ? '#' + href.split('#')[1] : '');

      const pathOnly = target.split('#')[0].split('?')[0];
      if (pathOnly && !resolveDistPath(pathOnly)) {
        failures.push(`${page.urlPath}: href="${href}" has no file in dist`);
      }
    }
  }

  assert.deepEqual(failures, []);
});

test('every fragment link points at an existing id (same-page and cross-page)', () => {
  const failures = [];
  const idCache = new Map();
  const idsOf = (file) => {
    if (!idCache.has(file)) idCache.set(file, idsIn(readFileSync(file, 'utf8')));
    return idCache.get(file);
  };

  for (const page of pages) {
    for (const href of attrValues(page.html, 'href')) {
      if (!href || isExternal(href) || !href.includes('#')) continue;

      const [rawPath, fragment] = href.split('#');
      if (!fragment) continue; // bare "#" means top-of-page; nothing to resolve

      let targetFile = page.file;
      if (rawPath) {
        const pathname = rawPath.startsWith('/')
          ? rawPath
          : new URL(rawPath, `https://x.test${page.urlPath}`).pathname;
        targetFile = resolveDistPath(pathname);
        if (!targetFile) continue; // reported by the href-resolution test
      }

      if (!idsOf(targetFile).has(decodeURIComponent(fragment))) {
        failures.push(
          `${page.urlPath}: href="${href}" -> no id="${fragment}" in target page`
        );
      }
    }
  }

  assert.deepEqual(failures, []);
});

test('homepage exposes the expected contact links', () => {
  const home = readDist('/index.html');
  const hrefs = attrValues(home, 'href');

  assert.ok(
    hrefs.some((h) => /^https:\/\/github\.com\/dev-lukas\/?$/.test(h)),
    'expected a GitHub profile link'
  );
  assert.ok(
    hrefs.some((h) => h.includes('linkedin.com/in/lukas-roth-dev')),
    'expected a LinkedIn profile link'
  );
  assert.ok(
    hrefs.some((h) => h.startsWith('mailto:')),
    'expected a mailto: contact link'
  );
});
