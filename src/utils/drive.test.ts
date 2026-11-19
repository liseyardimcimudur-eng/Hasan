import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDriveConfirmationCopy,
  buildDriveMultipartBody,
  buildDriveQuery,
  escapeDriveQueryValue,
  formatDriveFileSize,
  getDriveMimeInfo,
} from './drive';

test('escapeDriveQueryValue escapes single quotes and backslashes safely', () => {
  assert.equal(escapeDriveQueryValue("O'zbek\\Test"), "O\\'zbek\\\\Test");
});

test('buildDriveQuery builds parent-scoped and search-scoped queries accurately', () => {
  const rootQuery = buildDriveQuery({ parentId: 'root', category: 'all' });
  assert.equal(rootQuery, "trashed = false and 'root' in parents");

  const folderSearchQuery = buildDriveQuery({
    parentId: 'root',
    search: "YYPE '2026",
    category: 'folders',
  });
  assert.equal(
    folderSearchQuery,
    "trashed = false and name contains 'YYPE \\'2026' and mimeType = 'application/vnd.google-apps.folder'",
  );
});

test('formatDriveFileSize handles empty, bytes, KB, and MB cleanly', () => {
  assert.equal(formatDriveFileSize(undefined), '—');
  assert.equal(formatDriveFileSize('512'), '512 B');
  assert.equal(formatDriveFileSize('2048'), '2.0 KB');
  assert.equal(formatDriveFileSize(1024 * 1024 * 3.5), '3.5 MB');
});

test('getDriveMimeInfo maps folders, Google Docs, Sheets, and JSON files', () => {
  assert.deepEqual(getDriveMimeInfo('application/vnd.google-apps.folder'), {
    label: 'Klasör',
    isFolder: true,
    isTextReadable: false,
  });

  const doc = getDriveMimeInfo('application/vnd.google-apps.document');
  assert.equal(doc.isTextReadable, true);
  assert.equal(doc.googleExportMime, 'text/plain');

  const json = getDriveMimeInfo('application/json');
  assert.equal(json.label, 'JSON Verisi');
  assert.equal(json.isTextReadable, true);
});

test('buildDriveMultipartBody creates valid RFC-2387 multipart payload', () => {
  const { body, contentTypeHeader } = buildDriveMultipartBody(
    { name: 'anb-backup.json', parents: ['root'] },
    '{"ok":true}',
    'application/json',
    'test_boundary',
  );

  assert.equal(contentTypeHeader, 'multipart/related; boundary=test_boundary');
  assert.ok(body.includes('--test_boundary\r\nContent-Type: application/json; charset=UTF-8'));
  assert.ok(body.includes('"name":"anb-backup.json"'));
  assert.ok(body.includes('{"ok":true}'));
  assert.ok(body.endsWith('--test_boundary--'));
});

test('buildDriveConfirmationCopy produces explicit destructive and rename confirmation copy', () => {
  const del = buildDriveConfirmationCopy({ kind: 'delete', targetNames: ['katalog.pdf', 'teklif.json'] });
  assert.equal(del.isDestructive, true);
  assert.ok(del.title.includes('2 Dosya'));
  assert.ok(del.description.includes('geri alınamaz'));

  const rename = buildDriveConfirmationCopy({ kind: 'rename', targetNames: ['eski.json'] }, 'yeni.json');
  assert.equal(rename.isDestructive, false);
  assert.ok(rename.description.includes('eski.json'));
  assert.ok(rename.description.includes('yeni.json'));
});
