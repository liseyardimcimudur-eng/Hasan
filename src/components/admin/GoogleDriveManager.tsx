import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import type { User } from 'firebase/auth';
import {
  AlertCircle,
  ArrowUp,
  CheckCircle2,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderPlus,
  HardDrive,
  Image as ImageIcon,
  LogOut,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { CmsState } from '../../data/defaultCmsState';
import {
  clearCachedAccessToken,
  getAccessToken,
  googleLogout,
  googleSignIn,
  initAuth,
} from '../../services/googleAuth';
import {
  createDriveFolder,
  deleteDriveFilePermanently,
  downloadDriveFileBlob,
  DriveAuthExpiredError,
  listDriveFiles,
  readDriveFileText,
  renameDriveFile,
  trashDriveFile,
  updateDriveFileContent,
  uploadBinaryFileToDrive,
  uploadTextFileToDrive,
} from '../../services/googleDrive';
import {
  formatDriveFileSize,
  getDriveMimeInfo,
  type DriveActionDescriptor,
  type DriveCategoryFilter,
  type DriveFileSummary,
} from '../../utils/drive';
import { generateWordPressThemeFiles } from '../../utils/wpThemeGenerator';
import { ConfirmDriveActionModal } from '../ConfirmDriveActionModal';
import { GoogleSignInButton } from '../GoogleSignInButton';

interface GoogleDriveManagerProps {
  cms: CmsState;
  mode?: 'admin' | 'portal';
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

type PendingMutation =
  | {
      descriptor: DriveActionDescriptor;
      action: 'trash';
      files: DriveFileSummary[];
    }
  | {
      descriptor: DriveActionDescriptor;
      action: 'delete';
      files: DriveFileSummary[];
    }
  | {
      descriptor: DriveActionDescriptor;
      action: 'rename';
      file: DriveFileSummary;
      newName: string;
    }
  | {
      descriptor: DriveActionDescriptor;
      action: 'overwrite';
      file: DriveFileSummary;
      content: string;
    };

export function GoogleDriveManager({ cms, mode = 'admin' }: GoogleDriveManagerProps) {
  const [needsAuth, setNeedsAuth] = useState<boolean>(() => !getAccessToken());
  const [accessToken, setAccessToken] = useState<string | null>(() => getAccessToken());
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [files, setFiles] = useState<DriveFileSummary[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: 'root', name: 'Drive Ana Klasör' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DriveCategoryFilter>('all');

  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [renameTarget, setRenameTarget] = useState<DriveFileSummary | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  const [previewFile, setPreviewFile] = useState<DriveFileSummary | null>(null);
  const [previewContent, setPreviewContent] = useState('');
  const [previewOriginalContent, setPreviewOriginalContent] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [pendingMutation, setPendingMutation] = useState<PendingMutation | null>(null);
  const [mutating, setMutating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentFolderId = breadcrumbs[breadcrumbs.length - 1]?.id || 'root';

  const loadFiles = useCallback(
    async (tokenOverride?: string) => {
      const tokenToUse = tokenOverride || accessToken || getAccessToken();
      if (!tokenToUse) {
        setNeedsAuth(true);
        return;
      }

      setLoadingFiles(true);
      setErrorMsg('');
      try {
        const result = await listDriveFiles(tokenToUse, {
          parentId: currentFolderId,
          search: searchQuery,
          category: categoryFilter,
          pageSize: 50,
        });
        setFiles(result);
        setSelectedIds([]);
      } catch (err) {
        if (err instanceof DriveAuthExpiredError) {
          clearCachedAccessToken();
          setAccessToken(null);
          setNeedsAuth(true);
          setErrorMsg(err.message);
        } else {
          setErrorMsg(err instanceof Error ? err.message : 'Google Drive dosyaları alınamadı.');
        }
      } finally {
        setLoadingFiles(false);
      }
    },
    [accessToken, categoryFilter, currentFolderId, searchQuery],
  );

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        setNeedsAuth(false);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
        setNeedsAuth(true);
      },
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (accessToken && !needsAuth) {
      loadFiles(accessToken);
    }
  }, [accessToken, needsAuth, loadFiles]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg('');
    setStatusMsg('');
    try {
      const result = await googleSignIn();
      setGoogleUser(result.user);
      setAccessToken(result.accessToken);
      setNeedsAuth(false);
      setStatusMsg('Google Drive bağlantısı başarıyla kuruldu.');
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Google hesabıyla oturum açılamadı. Açılır pencere izinlerini kontrol edin.',
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await googleLogout();
    setGoogleUser(null);
    setAccessToken(null);
    setFiles([]);
    setSelectedIds([]);
    setNeedsAuth(true);
    setStatusMsg('');
    setErrorMsg('');
  };

  const handleCreateFolder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newFolderName.trim() || !accessToken) return;
    setCreatingFolder(true);
    setErrorMsg('');
    try {
      const created = await createDriveFolder(accessToken, newFolderName.trim(), currentFolderId);
      setNewFolderName('');
      setNewFolderOpen(false);
      setStatusMsg(`"${created.name}" klasörü Drive içinde oluşturuldu.`);
      await loadFiles(accessToken);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Klasör oluşturulamadı.');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleUploadLocalFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !accessToken) return;

    setUploading(true);
    setErrorMsg('');
    try {
      const uploaded = await uploadBinaryFileToDrive(accessToken, file, currentFolderId);
      setStatusMsg(`"${uploaded.name}" dosyası Google Drive'a yüklendi.`);
      await loadFiles(accessToken);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Dosya yüklenemedi.');
    } finally {
      setUploading(false);
    }
  };

  const handleBackupCmsSnapshot = async () => {
    if (!accessToken) return;
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `anb-plastik-cms-yedek-${stamp}.json`;
    const existing = files.find((f) => f.name === filename && !f.trashed);
    const jsonPayload = JSON.stringify(cms, null, 2);

    if (existing) {
      setPendingMutation({
        descriptor: { kind: 'overwrite', targetNames: [existing.name] },
        action: 'overwrite',
        file: existing,
        content: jsonPayload,
      });
      return;
    }

    setUploading(true);
    setErrorMsg('');
    try {
      const created = await uploadTextFileToDrive(accessToken, {
        name: filename,
        content: jsonPayload,
        mimeType: 'application/json',
        parentId: currentFolderId,
      });
      setStatusMsg(`CMS yedeği "${created.name}" adıyla Google Drive'a kaydedildi.`);
      await loadFiles(accessToken);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'CMS yedeği Drive üzerine kaydedilemedi.');
    } finally {
      setUploading(false);
    }
  };

  const handleExportThemeBundleToDrive = async () => {
    if (!accessToken) return;
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `anb-plastik-wp-tema-${stamp}.json`;
    const themeFiles = generateWordPressThemeFiles(cms);
    const bundleContent = JSON.stringify(
      {
        brand: cms.settings.brandName,
        domain: cms.settings.domain,
        exportedAt: new Date().toISOString(),
        files: themeFiles,
      },
      null,
      2,
    );

    const existing = files.find((f) => f.name === filename && !f.trashed);
    if (existing) {
      setPendingMutation({
        descriptor: { kind: 'overwrite', targetNames: [existing.name] },
        action: 'overwrite',
        file: existing,
        content: bundleContent,
      });
      return;
    }

    setUploading(true);
    setErrorMsg('');
    try {
      const created = await uploadTextFileToDrive(accessToken, {
        name: filename,
        content: bundleContent,
        mimeType: 'application/json',
        parentId: currentFolderId,
      });
      setStatusMsg(`WordPress tema paketi "${created.name}" olarak Drive'a aktarıldı.`);
      await loadFiles(accessToken);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'WordPress tema paketi yüklenemedi.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenFolder = (folder: DriveFileSummary) => {
    setSearchQuery('');
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setSearchQuery('');
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const handleOpenPreview = async (file: DriveFileSummary) => {
    if (!accessToken) return;
    const info = getDriveMimeInfo(file.mimeType);
    if (info.isFolder) {
      handleOpenFolder(file);
      return;
    }

    setPreviewFile(file);
    setPreviewContent('');
    setPreviewOriginalContent('');

    if (!info.isTextReadable) {
      return;
    }

    setLoadingPreview(true);
    try {
      const text = await readDriveFileText(accessToken, file);
      setPreviewContent(text);
      setPreviewOriginalContent(text);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Dosya içeriği okunamadı.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownloadFile = async (file: DriveFileSummary) => {
    if (!accessToken) return;
    try {
      const blob = await downloadDriveFileBlob(accessToken, file);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Dosya indirilemedi.');
    }
  };

  const handleRequestRename = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!renameTarget || !renameDraft.trim() || renameDraft.trim() === renameTarget.name) return;
    setPendingMutation({
      descriptor: { kind: 'rename', targetNames: [renameTarget.name] },
      action: 'rename',
      file: renameTarget,
      newName: renameDraft.trim(),
    });
  };

  const handleRequestSavePreview = () => {
    if (!previewFile) return;
    setPendingMutation({
      descriptor: { kind: 'overwrite', targetNames: [previewFile.name] },
      action: 'overwrite',
      file: previewFile,
      content: previewContent,
    });
  };

  const handleRequestTrash = (targets: DriveFileSummary[]) => {
    if (targets.length === 0) return;
    setPendingMutation({
      descriptor: { kind: 'trash', targetNames: targets.map((t) => t.name) },
      action: 'trash',
      files: targets,
    });
  };

  const handleRequestPermanentDelete = (targets: DriveFileSummary[]) => {
    if (targets.length === 0) return;
    setPendingMutation({
      descriptor: { kind: 'delete', targetNames: targets.map((t) => t.name) },
      action: 'delete',
      files: targets,
    });
  };

  const handleConfirmMutation = async () => {
    if (!pendingMutation || !accessToken) return;
    setMutating(true);
    setErrorMsg('');
    try {
      if (pendingMutation.action === 'rename') {
        await renameDriveFile(accessToken, pendingMutation.file.id, pendingMutation.newName);
        setStatusMsg(`"${pendingMutation.file.name}" dosyasının adı "${pendingMutation.newName}" olarak güncellendi.`);
        setRenameTarget(null);
      } else if (pendingMutation.action === 'overwrite') {
        const mimeType =
          pendingMutation.file.mimeType === 'application/json'
            ? 'application/json; charset=UTF-8'
            : 'text/plain; charset=UTF-8';
        await updateDriveFileContent(
          accessToken,
          pendingMutation.file.id,
          pendingMutation.content,
          mimeType,
        );
        setPreviewOriginalContent(pendingMutation.content);
        setStatusMsg(`"${pendingMutation.file.name}" içeriği Google Drive üzerinde güncellendi.`);
      } else if (pendingMutation.action === 'trash') {
        for (const f of pendingMutation.files) {
          await trashDriveFile(accessToken, f.id);
        }
        setStatusMsg(`${pendingMutation.files.length} öğe Google Drive çöp kutusuna taşındı.`);
        if (previewFile && pendingMutation.files.some((f) => f.id === previewFile.id)) {
          setPreviewFile(null);
        }
      } else if (pendingMutation.action === 'delete') {
        for (const f of pendingMutation.files) {
          await deleteDriveFilePermanently(accessToken, f.id);
        }
        setStatusMsg(`${pendingMutation.files.length} öğe Google Drive hesabınızdan kalıcı olarak silindi.`);
        if (previewFile && pendingMutation.files.some((f) => f.id === previewFile.id)) {
          setPreviewFile(null);
        }
      }
      setPendingMutation(null);
      await loadFiles(accessToken);
    } catch (err) {
      if (err instanceof DriveAuthExpiredError) {
        clearCachedAccessToken();
        setAccessToken(null);
        setNeedsAuth(true);
      }
      setErrorMsg(err instanceof Error ? err.message : 'Google Drive işlemi tamamlanamadı.');
      setPendingMutation(null);
    } finally {
      setMutating(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === files.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(files.map((f) => f.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const selectedFiles = files.filter((f) => selectedIds.includes(f.id));

  const renderFileIcon = (mimeType: string) => {
    const info = getDriveMimeInfo(mimeType);
    if (info.isFolder) return <Folder className="h-4 w-4 text-sky-700" aria-hidden="true" />;
    if (mimeType.includes('spreadsheet') || mimeType === 'text/csv') {
      return <FileSpreadsheet className="h-4 w-4 text-emerald-700" aria-hidden="true" />;
    }
    if (mimeType === 'application/json' || mimeType.includes('php')) {
      return <FileCode2 className="h-4 w-4 text-slate-700" aria-hidden="true" />;
    }
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4 text-amber-700" aria-hidden="true" />;
    }
    return <FileText className="h-4 w-4 text-slate-600" aria-hidden="true" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Google Drive Dosya ve Yedekleme Merkezi
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {mode === 'admin'
              ? 'ANB Plastik WordPress içerik yedeklerini, tema dosyalarını ve teknik belgeleri doğrudan Google Drive hesabınızda yönetin.'
              : 'ANB Plastik kurumsal Google Drive çalışma alanına bağlanarak dosya görüntüleme, yükleme ve klasör yönetimi yapabilirsiniz.'}
          </p>
        </div>

        {!needsAuth && googleUser && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs">
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 truncate">
                {googleUser.displayName || 'Google Kullanıcısı'}
              </p>
              <p className="font-mono text-slate-500 truncate">{googleUser.email}</p>
            </div>
            <button
              type="button"
              onClick={handleGoogleLogout}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Bağlantıyı Kes</span>
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1">{errorMsg}</span>
        </div>
      )}

      {statusMsg && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1">{statusMsg}</span>
        </div>
      )}

      {needsAuth ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
                <HardDrive className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Google Drive Hesabınızı Bağlayın
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Google hesabınızla oturum açtığınızda ANB Plastik teknik dökümanlarına, ürün
                kataloglarına ve WordPress CMS JSON / tema yedeklerine doğrudan tarayıcı içinden
                güvenli şekilde erişebilirsiniz. Erişim belirteciniz yalnızca aktif oturum boyunca
                tarayıcı belleğinde tutulur.
              </p>

              <ul className="grid grid-cols-1 gap-2 pt-1 text-sm text-slate-700 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-700" aria-hidden="true" />
                  <span>Drive klasör ve dosya arama</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-700" aria-hidden="true" />
                  <span>WordPress CMS & tema yedeği</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-700" aria-hidden="true" />
                  <span>Yeni klasör ve dosya yükleme</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-700" aria-hidden="true" />
                  <span>Onaylı ad değiştirme & silme</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-center rounded-lg border border-slate-200 bg-slate-50 p-6">
              <p className="mb-4 text-xs font-medium text-slate-600 lg:text-right">
                Devam etmek için Google hesabınızla izin verin:
              </p>
              <GoogleSignInButton
                onClick={handleGoogleLogin}
                loading={isLoggingIn}
                label="Sign in with Google"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center min-w-0">
                <div className="relative flex-1 min-w-0">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Google Drive içinde dosya veya klasör ara..."
                    aria-label="Google Drive dosyalarında ara"
                    className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-700"
                  />
                </div>

                <select
                  aria-label="Dosya türü filtresi"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as DriveCategoryFilter)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-700"
                >
                  <option value="all">Tüm Öğeler</option>
                  <option value="folders">Klasörler</option>
                  <option value="documents">Belgeler ve PDF</option>
                  <option value="spreadsheets">E-Tablolar</option>
                  <option value="json">JSON / PHP Yedekleri</option>
                  <option value="media">Görsel ve Video</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => loadFiles()}
                  disabled={loadingFiles}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Yenile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewFolderOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <FolderPlus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Yeni Klasör</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleUploadLocalFile}
                  aria-label="Google Drive için dosya seç"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{uploading ? 'Yükleniyor...' : 'Dosya Yükle'}</span>
                </button>
              </div>
            </div>

            {/* ANB Plastik CMS Quick Backup Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span>Konum:</span>
                {breadcrumbs.map((crumb, idx) => (
                  <span key={crumb.id} className="inline-flex items-center gap-1.5">
                    {idx > 0 && <span aria-hidden="true">/</span>}
                    <button
                      type="button"
                      onClick={() => handleBreadcrumbClick(idx)}
                      className={`font-medium ${
                        idx === breadcrumbs.length - 1
                          ? 'text-slate-900 font-semibold'
                          : 'text-sky-700 hover:underline'
                      }`}
                    >
                      {crumb.name}
                    </button>
                  </span>
                ))}
                {breadcrumbs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleBreadcrumbClick(breadcrumbs.length - 2)}
                    className="ml-2 inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <ArrowUp className="h-3 w-3" aria-hidden="true" />
                    <span>Üst Klasör</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleBackupCmsSnapshot}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-900 hover:bg-sky-100 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>CMS Yedeğini Drive&apos;a Kaydet</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportThemeBundleToDrive}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50"
                >
                  <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>WP Temasını Drive&apos;a Aktar</span>
                </button>
              </div>
            </div>

            {newFolderOpen && (
              <form
                onSubmit={handleCreateFolder}
                className="flex flex-col gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:items-center"
              >
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Yeni klasör adı (örn. ANB Teknik Kataloglar)"
                  aria-label="Yeni klasör adı"
                  className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-sky-700 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={creatingFolder || !newFolderName.trim()}
                    className="rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
                  >
                    {creatingFolder ? 'Oluşturuluyor...' : 'Klasör Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewFolderOpen(false);
                      setNewFolderName('');
                    }}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Vazgeç
                  </button>
                </div>
              </form>
            )}

            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs">
                <span className="font-semibold text-slate-900">
                  {selectedFiles.length} öğe seçildi
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRequestTrash(selectedFiles)}
                    className="inline-flex items-center gap-1 rounded border border-amber-300 bg-white px-2.5 py-1 font-semibold text-amber-900 hover:bg-amber-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Seçilenleri Çöpe Taşı</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRequestPermanentDelete(selectedFiles)}
                    className="inline-flex items-center gap-1 rounded border border-red-300 bg-white px-2.5 py-1 font-semibold text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Kalıcı Sil</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* File List Table */}
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            {loadingFiles ? (
              <div className="px-6 py-12 text-center text-sm text-slate-600" role="status">
                Google Drive dosyaları yükleniyor...
              </div>
            ) : files.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-medium text-slate-800">
                  Bu konumda veya aramada eşleşen Google Drive öğesi bulunamadı.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Yeni bir klasör oluşturabilir, dosya yükleyebilir veya CMS yedeğini doğrudan
                  Drive&apos;a kaydedebilirsiniz.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === files.length && files.length > 0}
                          onChange={toggleSelectAll}
                          aria-label="Tüm dosyaları seç"
                          className="h-4 w-4 rounded border-slate-300 text-sky-700"
                        />
                      </th>
                      <th className="px-4 py-3">Dosya / Klasör Adı</th>
                      <th className="hidden px-4 py-3 md:table-cell">Tür</th>
                      <th className="hidden px-4 py-3 sm:table-cell">Boyut</th>
                      <th className="hidden px-4 py-3 lg:table-cell">Son Güncelleme</th>
                      <th className="px-4 py-3 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {files.map((file) => {
                      const info = getDriveMimeInfo(file.mimeType);
                      const checked = selectedIds.includes(file.id);
                      return (
                        <tr key={file.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSelectOne(file.id)}
                              aria-label={`${file.name} dosyasını seç`}
                              className="h-4 w-4 rounded border-slate-300 text-sky-700"
                            />
                          </td>
                          <td className="max-w-xs px-4 py-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="shrink-0">{renderFileIcon(file.mimeType)}</span>
                              <button
                                type="button"
                                onClick={() => handleOpenPreview(file)}
                                className="truncate text-left font-medium text-slate-900 hover:text-sky-700 hover:underline"
                              >
                                {file.name}
                              </button>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 text-xs text-slate-600 md:table-cell">
                            {info.label}
                          </td>
                          <td className="hidden px-4 py-3 font-mono text-xs text-slate-600 tabular-nums sm:table-cell">
                            {formatDriveFileSize(file.size)}
                          </td>
                          <td className="hidden px-4 py-3 font-mono text-xs text-slate-500 tabular-nums lg:table-cell">
                            {file.modifiedTime
                              ? new Date(file.modifiedTime).toLocaleDateString('tr-TR')
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              {!info.isFolder && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPreview(file)}
                                    aria-label={`${file.name} önizle`}
                                    title="Önizle / Düzenle"
                                    className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadFile(file)}
                                    aria-label={`${file.name} indir`}
                                    title="İndir"
                                    className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setRenameTarget(file);
                                  setRenameDraft(file.name);
                                }}
                                aria-label={`${file.name} yeniden adlandır`}
                                title="Yeniden Adlandır"
                                className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRequestTrash([file])}
                                aria-label={`${file.name} çöp kutusuna taşı`}
                                title="Çöp Kutusuna Taşı"
                                className="rounded border border-slate-200 p-1.5 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drive-rename-title"
        >
          <form
            onSubmit={handleRequestRename}
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h2 id="drive-rename-title" className="font-display text-base font-bold text-slate-900">
                Öğe Adını Değiştir
              </h2>
              <button
                type="button"
                onClick={() => setRenameTarget(null)}
                aria-label="Kapat"
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <label htmlFor="drive-rename-input" className="mt-4 block text-xs font-medium text-slate-700">
              Yeni Ad
            </label>
            <input
              id="drive-rename-input"
              type="text"
              value={renameDraft}
              onChange={(e) => setRenameDraft(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-700 focus:outline-none"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenameTarget(null)}
                className="rounded-md border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={!renameDraft.trim() || renameDraft.trim() === renameTarget.name}
                className="rounded-md bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
              >
                Devam Et
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Preview / Text Edit Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drive-preview-title"
        >
          <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
              <div className="min-w-0">
                <h2 id="drive-preview-title" className="truncate font-display text-base font-bold text-slate-900">
                  {previewFile.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {getDriveMimeInfo(previewFile.mimeType).label} · {formatDriveFileSize(previewFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                aria-label="Önizlemeyi kapat"
                className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {getDriveMimeInfo(previewFile.mimeType).isTextReadable ? (
                loadingPreview ? (
                  <p className="text-sm text-slate-600">İçerik yükleniyor...</p>
                ) : (
                  <div className="space-y-3">
                    <label
                      htmlFor="drive-file-editor"
                      className="block text-xs font-medium text-slate-600"
                    >
                      Dosya İçeriği (düzenleyip Google Drive üzerinde güncelleyebilirsiniz)
                    </label>
                    <textarea
                      id="drive-file-editor"
                      rows={14}
                      value={previewContent}
                      onChange={(e) => setPreviewContent(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-xs text-slate-900 focus:border-sky-700 focus:bg-white focus:outline-none"
                    />
                  </div>
                )
              ) : (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
                  <p>Bu dosya türü doğrudan metin düzenleyici ile önizlenemiyor.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(previewFile)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-700"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Dosyayı İndir</span>
                    </button>
                    {previewFile.webViewLink && (
                      <a
                        href={previewFile.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                      >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Google Drive&apos;da Aç</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRequestTrash([previewFile])}
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Çöpe Taşı</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestPermanentDelete([previewFile])}
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-50"
                >
                  <span>Kalıcı Sil</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="rounded-md border border-slate-300 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Kapat
                </button>
                {getDriveMimeInfo(previewFile.mimeType).isTextReadable &&
                  previewFile.mimeType !== 'application/vnd.google-apps.document' &&
                  previewFile.mimeType !== 'application/vnd.google-apps.spreadsheet' && (
                    <button
                      type="button"
                      onClick={handleRequestSavePreview}
                      disabled={previewContent === previewOriginalContent || loadingPreview}
                      className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
                    >
                      <Save className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Drive&apos;da Güncelle</span>
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Explicit Confirmation Dialog */}
      <ConfirmDriveActionModal
        descriptor={pendingMutation?.descriptor || null}
        newName={pendingMutation?.action === 'rename' ? pendingMutation.newName : undefined}
        busy={mutating}
        onCancel={() => setPendingMutation(null)}
        onConfirm={handleConfirmMutation}
      />
    </div>
  );
}
