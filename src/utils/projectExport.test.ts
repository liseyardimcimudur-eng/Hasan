import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { DEFAULT_CMS_STATE } from '../data/defaultCmsState';
import { buildWordPressThemeZip, shouldIncludeProjectPath } from './projectExport';

test('shouldIncludeProjectPath includes source/config files and excludes secrets and build artifacts', () => {
  assert.equal(shouldIncludeProjectPath('src/App.tsx'), true);
  assert.equal(shouldIncludeProjectPath('server.ts'), true);
  assert.equal(shouldIncludeProjectPath('src/assets/images/hero.jpg'), true);
  assert.equal(shouldIncludeProjectPath('.env.example'), true);

  assert.equal(shouldIncludeProjectPath('.env'), false);
  assert.equal(shouldIncludeProjectPath('.env.local'), false);
  assert.equal(shouldIncludeProjectPath('node_modules/react/index.js'), false);
  assert.equal(shouldIncludeProjectPath('dist/index.html'), false);
  assert.equal(shouldIncludeProjectPath('.playwright-cli/r1.png'), false);
  assert.equal(shouldIncludeProjectPath('.git/config'), false);
  assert.equal(shouldIncludeProjectPath('bun.lock'), false);
});

test('buildWordPressThemeZip packages valid WordPress PHP templates and CMS backup', async () => {
  const zip = await buildWordPressThemeZip(DEFAULT_CMS_STATE);
  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  const loaded = await JSZip.loadAsync(buffer);
  const entryNames = Object.keys(loaded.files);

  assert.ok(entryNames.includes('anb-plastik/index.php'));
  assert.ok(entryNames.includes('anb-plastik/style.css'));
  assert.ok(entryNames.includes('anb-plastik/functions.php'));
  assert.ok(entryNames.includes('anb-plastik/header.php'));
  assert.ok(entryNames.includes('anb-plastik/front-page.php'));
  assert.ok(entryNames.includes('anb-plastik/page.php'));
  assert.ok(entryNames.includes('anb-plastik/footer.php'));
  assert.ok(entryNames.includes('anb-plastik/cms-yedek.json'));

  const styleCss = await loaded.file('anb-plastik/style.css')?.async('string');
  assert.ok(styleCss?.includes('Theme Name: ANB Plastik Kurumsal Tema'));
});
