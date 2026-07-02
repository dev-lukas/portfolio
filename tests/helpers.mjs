// Shared helpers for testing the BUILT site output in dist/.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const DIST = path.join(ROOT, 'dist');
export const BLOG_CONTENT_DIR = path.join(ROOT, 'src', 'content', 'blog');

/** Recursively collect all .html files under dist/. Returns absolute paths. */
export function walkDist(dir = DIST) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkDist(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/** Read a file from dist/ by URL-style path (e.g. '/blog/index.html'). */
export function readDist(urlPath) {
  return readFileSync(path.join(DIST, ...urlPath.split('/').filter(Boolean)), 'utf8');
}

/** URL path (e.g. '/blog/') of a built HTML file, given its absolute path. */
export function urlPathOf(htmlFile) {
  let rel = '/' + path.relative(DIST, htmlFile).split(path.sep).join('/');
  if (rel.endsWith('/index.html')) rel = rel.slice(0, -'index.html'.length);
  return rel;
}

/**
 * Resolve an absolute URL path (no fragment/query) to a file inside dist/,
 * accounting for Astro's directory-style URLs. Returns the absolute file
 * path or null if nothing matches.
 */
export function resolveDistPath(urlPath) {
  const clean = decodeURIComponent(urlPath).split(/[?#]/)[0];
  const rel = clean.split('/').filter(Boolean);
  const candidates = [
    path.join(DIST, ...rel), // exact file, e.g. /favicon.svg
    path.join(DIST, ...rel, 'index.html'), // directory-style, e.g. /blog/ or /blog
    path.join(DIST, ...rel) + '.html', // file-style fallback
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/** Extract all values of an attribute (e.g. 'href', 'src') from an HTML string. */
export function attrValues(html, attr) {
  const values = [];
  const re = new RegExp(`\\b${attr}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'gi');
  for (const m of html.matchAll(re)) values.push(m[2] ?? m[3]);
  return values;
}

/** All element ids declared in an HTML string. */
export function idsIn(html) {
  return new Set(attrValues(html, 'id'));
}

/** Get the first <meta ...> tag content for a given name= or property=. */
export function metaContent(html, key) {
  const re = new RegExp(
    `<meta\\s+[^>]*(?:name|property)\\s*=\\s*["']${key}["'][^>]*>`,
    'i'
  );
  const tag = html.match(re)?.[0];
  if (!tag) return null;
  return tag.match(/\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)')/i)?.[1] ?? null;
}

/**
 * Parse the YAML frontmatter of a markdown file into a flat object of
 * top-level scalar keys (enough for title/date/draft checks).
 */
export function parseFrontmatter(mdSource) {
  const m = mdSource.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[kv[1]] = value;
  }
  return data;
}

/** All blog posts from src/content/blog: { slug, title, date, draft }. */
export function blogPosts() {
  return readdirSync(BLOG_CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const fm = parseFrontmatter(
        readFileSync(path.join(BLOG_CONTENT_DIR, file), 'utf8')
      );
      return {
        slug: file.replace(/\.md$/, ''),
        title: fm.title ?? '',
        date: fm.date ? new Date(fm.date) : null,
        draft: fm.draft === 'true',
      };
    });
}
