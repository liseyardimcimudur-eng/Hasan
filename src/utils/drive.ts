export type DriveCategoryFilter = 'all' | 'folders' | 'documents' | 'spreadsheets' | 'json' | 'media';

export interface DriveFileSummary {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  parents?: string[];
  webViewLink?: string;
  trashed?: boolean;
}

export interface DriveActionDescriptor {
  kind: 'rename' | 'trash' | 'delete' | 'overwrite';
  targetNames: string[];
}

export const DRIVE_FOLDER_MIME = 'application/vnd.google-apps.folder';
export const GOOGLE_DOC_MIME = 'application/vnd.google-apps.document';
export const GOOGLE_SHEET_MIME = 'application/vnd.google-apps.spreadsheet';
export const GOOGLE_SLIDE_MIME = 'application/vnd.google-apps.presentation';

export function escapeDriveQueryValue(input: string): string {
  return input.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export function buildDriveQuery(options: {
  parentId?: string;
  search?: string;
  category?: DriveCategoryFilter;
  includeTrashed?: boolean;
}): string {
  const clauses: string[] = [];

  if (!options.includeTrashed) {
    clauses.push('trashed = false');
  }

  const trimmedSearch = options.search?.trim();
  if (trimmedSearch) {
    clauses.push(`name contains '${escapeDriveQueryValue(trimmedSearch)}'`);
  } else if (options.parentId) {
    clauses.push(`'${escapeDriveQueryValue(options.parentId)}' in parents`);
  }

  switch (options.category) {
    case 'folders':
      clauses.push(`mimeType = '${DRIVE_FOLDER_MIME}'`);
      break;
    case 'documents':
      clauses.push(
        `(mimeType = '${GOOGLE_DOC_MIME}' or mimeType = 'application/pdf' or mimeType = 'text/plain')`,
      );
      break;
    case 'spreadsheets':
      clauses.push(
        `(mimeType = '${GOOGLE_SHEET_MIME}' or mimeType = 'text/csv' or mimeType contains 'spreadsheet')`,
      );
      break;
    case 'json':
      clauses.push(`(mimeType = 'application/json' or name contains '.json' or name contains '.php')`);
      break;
    case 'media':
      clauses.push(`(mimeType contains 'image/' or mimeType contains 'video/')`);
      break;
    default:
      break;
  }

  return clauses.join(' and ');
}

export function formatDriveFileSize(sizeBytes?: string | number): string {
  if (sizeBytes === undefined || sizeBytes === null || sizeBytes === '') {
    return '—';
  }
  const bytes = typeof sizeBytes === 'number' ? sizeBytes : Number(sizeBytes);
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '—';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function getDriveMimeInfo(mimeType: string): {
  label: string;
  isFolder: boolean;
  isTextReadable: boolean;
  googleExportMime?: string;
} {
  if (mimeType === DRIVE_FOLDER_MIME) {
    return { label: 'Klasör', isFolder: true, isTextReadable: false };
  }
  if (mimeType === GOOGLE_DOC_MIME) {
    return {
      label: 'Google Doküman',
      isFolder: false,
      isTextReadable: true,
      googleExportMime: 'text/plain',
    };
  }
  if (mimeType === GOOGLE_SHEET_MIME) {
    return {
      label: 'Google E-Tablo',
      isFolder: false,
      isTextReadable: true,
      googleExportMime: 'text/csv',
    };
  }
  if (mimeType === GOOGLE_SLIDE_MIME) {
    return {
      label: 'Google Sunu',
      isFolder: false,
      isTextReadable: false,
    };
  }
  if (mimeType === 'application/json') {
    return { label: 'JSON Verisi', isFolder: false, isTextReadable: true };
  }
  if (mimeType === 'application/pdf') {
    return { label: 'PDF Belgesi', isFolder: false, isTextReadable: false };
  }
  if (mimeType.startsWith('text/') || mimeType === 'application/x-httpd-php') {
    return { label: 'Metin / Kod', isFolder: false, isTextReadable: true };
  }
  if (mimeType.startsWith('image/')) {
    return { label: 'Görsel', isFolder: false, isTextReadable: false };
  }
  return { label: 'Dosya', isFolder: false, isTextReadable: false };
}

export function buildDriveMultipartBody(
  metadata: Record<string, unknown>,
  content: string,
  contentType: string,
  boundary = 'anb_plastik_drive_boundary',
): { body: string; contentTypeHeader: string } {
  const delimiter = `--${boundary}`;
  const closeDelimiter = `--${boundary}--`;
  const body = [
    delimiter,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    delimiter,
    `Content-Type: ${contentType}`,
    '',
    content,
    closeDelimiter,
  ].join('\r\n');

  return {
    body,
    contentTypeHeader: `multipart/related; boundary=${boundary}`,
  };
}

export function buildDriveConfirmationCopy(
  descriptor: DriveActionDescriptor,
  newName?: string,
): {
  title: string;
  description: string;
  confirmLabel: string;
  isDestructive: boolean;
} {
  const count = descriptor.targetNames.length;
  const first = descriptor.targetNames[0] || 'Seçili dosya';

  switch (descriptor.kind) {
    case 'rename':
      return {
        title: 'Dosya Adını Güncelle',
        description: `"${first}" öğesinin Google Drive üzerindeki adı "${newName || ''}" olarak değiştirilecek. Devam etmek istiyor musunuz?`,
        confirmLabel: 'Adı Güncelle',
        isDestructive: false,
      };
    case 'overwrite':
      return {
        title: 'Mevcut Drive Dosyasını Güncelle',
        description: `"${first}" dosyasının Google Drive üzerindeki içeriği yeni verilerle değiştirilecek.`,
        confirmLabel: 'İçeriği Güncelle',
        isDestructive: false,
      };
    case 'trash':
      return {
        title: count > 1 ? `${count} Dosyayı Çöp Kutusuna Taşı` : 'Dosyayı Çöp Kutusuna Taşı',
        description:
          count > 1
            ? `${count} öğe Google Drive çöp kutusuna taşınacak.`
            : `"${first}" öğesi Google Drive çöp kutusuna taşınacak.`,
        confirmLabel: 'Çöp Kutusuna Taşı',
        isDestructive: true,
      };
    case 'delete':
      return {
        title: count > 1 ? `${count} Dosyayı Kalıcı Olarak Sil` : 'Dosyayı Kalıcı Olarak Sil',
        description:
          count > 1
            ? `${count} öğe Google Drive hesabınızdan kalıcı olarak silinecek. Bu işlem geri alınamaz.`
            : `"${first}" öğesi Google Drive hesabınızdan kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
        confirmLabel: 'Kalıcı Olarak Sil',
        isDestructive: true,
      };
  }
}
