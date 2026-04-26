import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('home page wires all primary sections', async () => {
  const page = await read('src/pages/index.astro');

  for (const component of [
    'HeroSection',
    'AboutSection',
    'DevOpsCard',
    'FirePhenixCard',
    'HomeserverCard',
    'ContactSection',
  ]) {
    assert.match(page, new RegExp(`<${component}`));
  }
});

test('layout keeps required document metadata', async () => {
  const layout = await read('src/layouts/Layout.astro');

  assert.match(layout, /<meta name="viewport"/);
  assert.match(layout, /<meta name="description" content=\{description\}/);
  assert.match(layout, /<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg"/);
});

test('FirePhenix project advertises both application repositories and CI/CD', async () => {
  const projects = await read('src/data/projects.ts');

  assert.match(projects, /id: 'firephenix'/);
  assert.match(projects, /https:\/\/github\.com\/dev-lukas\/firephenix-backend/);
  assert.match(projects, /https:\/\/github\.com\/dev-lukas\/firephenix-website/);
  assert.match(projects, /GitHub Actions CI\/CD/);
});
