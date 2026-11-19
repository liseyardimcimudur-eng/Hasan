import JSZip from 'jszip';
import type { CmsState } from '../data/defaultCmsState';
import { generateWordPressThemeFiles } from './wpThemeGenerator';

const EXCLUDED_TOP_SEGMENTS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.playwright-cli',
  '.aistudio',
]);

const EXCLUDED_EXACT_PATHS = new Set([
  '.env',
  '.env.local',
  '.env.production',
  'bun.lock',
  'package-lock.json',
]);

export function shouldIncludeProjectPath(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized) return false;

  const segments = normalized.split('/');
  if (EXCLUDED_TOP_SEGMENTS.has(segments[0])) {
    return false;
  }
  if (EXCLUDED_EXACT_PATHS.has(normalized)) {
    return false;
  }
  if (segments.some((seg) => seg === '.DS_Store')) {
    return false;
  }
  return true;
}

export async function buildWordPressThemeZip(cms: CmsState): Promise<JSZip> {
  const zip = new JSZip();
  const themeFolder = zip.folder('anb-plastik');
  const files = generateWordPressThemeFiles(cms);

  for (const file of files) {
    themeFolder?.file(file.filename, file.content);
  }
  themeFolder?.file('cms-yedek.json', JSON.stringify(cms, null, 2));

  return zip;
}

export async function buildWordPressThemeZipBlob(cms: CmsState): Promise<Blob> {
  const zip = await buildWordPressThemeZip(cms);
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}
