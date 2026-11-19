import {
  buildDriveMultipartBody,
  buildDriveQuery,
  DRIVE_FOLDER_MIME,
  getDriveMimeInfo,
  type DriveCategoryFilter,
  type DriveFileSummary,
} from '../utils/drive';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

export class DriveAuthExpiredError extends Error {
  constructor(message = 'Google Drive oturum süresi doldu. Lütfen tekrar giriş yapın.') {
    super(message);
    this.name = 'DriveAuthExpiredError';
  }
}

async function handleDriveResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    throw new DriveAuthExpiredError();
  }
  if (!res.ok) {
    let errorMessage = `Google Drive API hatası (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error?.message) {
        errorMessage = data.error.message;
      }
    } catch {
      // ignore parse failures
    }
    throw new Error(errorMessage);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export async function listDriveFiles(
  accessToken: string,
  options: {
    parentId?: string;
    search?: string;
    category?: DriveCategoryFilter;
    pageSize?: number;
  } = {},
): Promise<DriveFileSummary[]> {
  const q = buildDriveQuery({
    parentId: options.parentId || 'root',
    search: options.search,
    category: options.category,
  });

  const params = new URLSearchParams({
    q,
    pageSize: String(options.pageSize || 50),
    orderBy: 'folder,modifiedTime desc',
    fields: 'files(id,name,mimeType,size,modifiedTime,parents,webViewLink,trashed)',
  });

  const res = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await handleDriveResponse<{ files?: DriveFileSummary[] }>(res);
  return data.files || [];
}

export async function createDriveFolder(
  accessToken: string,
  name: string,
  parentId = 'root',
): Promise<DriveFileSummary> {
  const res = await fetch(
    `${DRIVE_API_BASE}/files?fields=id,name,mimeType,size,modifiedTime,parents,webViewLink`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
        mimeType: DRIVE_FOLDER_MIME,
        parents: [parentId],
      }),
    },
  );

  return handleDriveResponse<DriveFileSummary>(res);
}

export async function uploadTextFileToDrive(
  accessToken: string,
  options: {
    name: string;
    content: string;
    mimeType?: string;
    parentId?: string;
  },
): Promise<DriveFileSummary> {
  const mimeType = options.mimeType || 'application/json';
  const { body, contentTypeHeader } = buildDriveMultipartBody(
    {
      name: options.name,
      mimeType,
      parents: [options.parentId || 'root'],
    },
    options.content,
    mimeType,
  );

  const res = await fetch(
    `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,parents,webViewLink`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': contentTypeHeader,
      },
      body,
    },
  );

  return handleDriveResponse<DriveFileSummary>(res);
}

export async function uploadBinaryFileToDrive(
  accessToken: string,
  file: File,
  parentId = 'root',
): Promise<DriveFileSummary> {
  const metadata = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    parents: [parentId],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const res = await fetch(
    `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,parents,webViewLink`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    },
  );

  return handleDriveResponse<DriveFileSummary>(res);
}

export async function updateDriveFileContent(
  accessToken: string,
  fileId: string,
  content: string,
  mimeType = 'text/plain; charset=UTF-8',
): Promise<DriveFileSummary> {
  const res = await fetch(
    `${DRIVE_UPLOAD_BASE}/files/${encodeURIComponent(fileId)}?uploadType=media&fields=id,name,mimeType,size,modifiedTime,parents,webViewLink`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': mimeType,
      },
      body: content,
    },
  );

  return handleDriveResponse<DriveFileSummary>(res);
}

export async function renameDriveFile(
  accessToken: string,
  fileId: string,
  newName: string,
): Promise<DriveFileSummary> {
  const res = await fetch(
    `${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,size,modifiedTime,parents,webViewLink`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName.trim() }),
    },
  );

  return handleDriveResponse<DriveFileSummary>(res);
}

export async function trashDriveFile(
  accessToken: string,
  fileId: string,
): Promise<DriveFileSummary> {
  const res = await fetch(
    `${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}?fields=id,name,trashed`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trashed: true }),
    },
  );

  return handleDriveResponse<DriveFileSummary>(res);
}

export async function deleteDriveFilePermanently(
  accessToken: string,
  fileId: string,
): Promise<void> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  await handleDriveResponse<void>(res);
}

export async function readDriveFileText(
  accessToken: string,
  file: DriveFileSummary,
): Promise<string> {
  const info = getDriveMimeInfo(file.mimeType);
  const url = info.googleExportMime
    ? `${DRIVE_API_BASE}/files/${encodeURIComponent(file.id)}/export?mimeType=${encodeURIComponent(info.googleExportMime)}`
    : `${DRIVE_API_BASE}/files/${encodeURIComponent(file.id)}?alt=media`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401) {
    throw new DriveAuthExpiredError();
  }
  if (!res.ok) {
    throw new Error(`Dosya içeriği okunamadı (${res.status})`);
  }
  return res.text();
}

export async function downloadDriveFileBlob(
  accessToken: string,
  file: DriveFileSummary,
): Promise<Blob> {
  const info = getDriveMimeInfo(file.mimeType);
  const url = info.googleExportMime
    ? `${DRIVE_API_BASE}/files/${encodeURIComponent(file.id)}/export?mimeType=${encodeURIComponent(info.googleExportMime)}`
    : `${DRIVE_API_BASE}/files/${encodeURIComponent(file.id)}?alt=media`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401) {
    throw new DriveAuthExpiredError();
  }
  if (!res.ok) {
    throw new Error(`Dosya indirilemedi (${res.status})`);
  }
  return res.blob();
}
