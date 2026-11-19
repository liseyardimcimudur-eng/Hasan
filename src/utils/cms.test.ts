import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CMS_STATE } from '../data/defaultCmsState';
import { generateWordPressThemeFiles } from './wpThemeGenerator';

test('DEFAULT_CMS_STATE includes all 5 core WordPress pages and 7 polymer grades', () => {
  assert.equal(DEFAULT_CMS_STATE.pages.length, 5);
  assert.deepEqual(
    DEFAULT_CMS_STATE.pages.map((p) => p.slug),
    ['/', '/hakkimizda', '/urunlerimiz', '/referanslarimiz', '/iletisim'],
  );
  assert.equal(DEFAULT_CMS_STATE.grades.length, 7);
});

test('generateWordPressThemeFiles outputs complete PHP template set reflecting CMS edits', () => {
  const modified = {
    ...DEFAULT_CMS_STATE,
    settings: {
      ...DEFAULT_CMS_STATE.settings,
      brandName: 'ANB Plastik Güncel',
      slogan: 'Polietilende Kalite',
    },
  };

  const files = generateWordPressThemeFiles(modified);
  assert.equal(files.length, 7);
  const index = files.find((f) => f.filename === 'index.php');
  const style = files.find((f) => f.filename === 'style.css');
  const functions = files.find((f) => f.filename === 'functions.php');
  const frontPage = files.find((f) => f.filename === 'front-page.php');

  assert.ok(index?.content.includes('front-page.php'));
  assert.ok(style?.content.includes('Theme Name: ANB Plastik Güncel Kurumsal Tema'));
  assert.ok(functions?.content.includes("register_post_type('polimer_urun'"));
  assert.ok(functions?.content.includes("wp_enqueue_style"));
  assert.ok(frontPage?.content.includes('Polietilende Kalite'));
});
