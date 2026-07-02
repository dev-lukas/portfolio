// Blog behavior: index listing, post pages, draft exclusion, date ordering.
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  readDist,
  resolveDistPath,
  attrValues,
  blogPosts,
} from './helpers.mjs';

const blogIndex = readDist('/blog/index.html');
const posts = blogPosts();
const published = posts.filter((p) => !p.draft);
const drafts = posts.filter((p) => p.draft);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const linksTo = (html, slug) =>
  new RegExp(`href=["']/blog/${escapeRe(slug)}/?["']`).test(html);

test('blog index lists the published C10 post with a working link', () => {
  const slug = 'reaching-c10-on-a-fanless-server';
  assert.ok(
    published.some((p) => p.slug === slug),
    `expected ${slug} to exist as a published post in src/content/blog`
  );
  assert.ok(linksTo(blogIndex, slug), `blog index must link to /blog/${slug}`);
  assert.ok(
    resolveDistPath(`/blog/${slug}`),
    `link target /blog/${slug} must exist in dist`
  );
});

test('every published post is linked from the blog index and built', () => {
  for (const post of published) {
    assert.ok(
      linksTo(blogIndex, post.slug),
      `blog index must link to published post /blog/${post.slug}`
    );
    const file = resolveDistPath(`/blog/${post.slug}`);
    assert.ok(file, `published post /blog/${post.slug} must be built in dist`);
  }
});

test('each published post page contains its frontmatter title', () => {
  for (const post of published) {
    assert.ok(post.title, `post ${post.slug} must have a frontmatter title`);
    const html = readDist(`/blog/${post.slug}/index.html`);
    assert.ok(
      html.includes(post.title),
      `built page for ${post.slug} must contain its title "${post.title}"`
    );
  }
});

test('draft posts do not appear in the built blog index', () => {
  // Generic: passes trivially while no drafts exist, guards the day one is added.
  for (const post of drafts) {
    assert.ok(
      !linksTo(blogIndex, post.slug),
      `draft post ${post.slug} must not be linked from the blog index`
    );
    assert.ok(
      !blogIndex.includes(post.title),
      `draft post title "${post.title}" must not appear in the blog index`
    );
  }
});

test('blog index lists posts in descending date order', () => {
  // Order of first link occurrence in the built HTML must match date desc.
  const listed = published
    .map((post) => {
      const m = new RegExp(`href=["']/blog/${escapeRe(post.slug)}/?["']`).exec(
        blogIndex
      );
      return m ? { ...post, index: m.index } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  assert.equal(
    listed.length,
    published.length,
    'every published post must appear in the blog index'
  );

  for (let i = 1; i < listed.length; i++) {
    const prev = listed[i - 1];
    const cur = listed[i];
    assert.ok(prev.date instanceof Date && !Number.isNaN(+prev.date));
    assert.ok(cur.date instanceof Date && !Number.isNaN(+cur.date));
    assert.ok(
      +prev.date >= +cur.date,
      `blog index order broken: "${prev.slug}" (${prev.date.toISOString()}) ` +
        `listed before "${cur.slug}" (${cur.date.toISOString()}) but is older`
    );
  }
});
