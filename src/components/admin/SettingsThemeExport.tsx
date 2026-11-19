import { useMemo, useState, type FormEvent } from 'react';
import { Archive, Check, Copy, Download, FileCode2, Globe } from 'lucide-react';
import type { CmsSiteSettings, CmsState } from '../../data/defaultCmsState';
import { buildWordPressThemeZipBlob } from '../../utils/projectExport';
import { generateWordPressThemeFiles } from '../../utils/wpThemeGenerator';

interface SettingsManagerProps {
  settings: CmsSiteSettings;
  token: string;
  onRefreshCms: () => Promise<void>;
}

export function SettingsManager({ settings, token, onRefreshCms }: SettingsManagerProps) {
  const [form, setForm] = useState<CmsSiteSettings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);
    try {
      const res = await fetch('/api/cms/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'err', msg: data.error || 'Ayarlar kaydedilemedi.' });
        return;
      }
      await onRefreshCms();
      setFeedback({ type: 'ok', msg: 'Genel site ayarları güncellendi.' });
    } catch {
      setFeedback({ type: 'err', msg: 'Sunucu bağlantı hatası.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Genel WordPress Ayarları
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Site başlığı, slogan, kurumsal iletişim bilgileri ve ana sayfa vitrin metinlerini
          güncelleyin.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-5 rounded-lg border border-slate-200 bg-white p-6"
      >
        {feedback && (
          <div
            className={`flex items-center gap-2 rounded-md border px-3.5 py-2.5 text-sm ${
              feedback.type === 'ok'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {feedback.type === 'ok' && <Check className="h-4 w-4 shrink-0" />}
            <span>{feedback.msg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="set-brand" className="block text-xs font-semibold text-slate-700">
              Site Başlığı (Marka)
            </label>
            <input
              id="set-brand"
              type="text"
              value={form.brandName}
              onChange={(e) => setForm((p) => ({ ...p, brandName: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="set-slogan" className="block text-xs font-semibold text-slate-700">
              Slogan
            </label>
            <input
              id="set-slogan"
              type="text"
              value={form.slogan}
              onChange={(e) => setForm((p) => ({ ...p, slogan: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="set-legal" className="block text-xs font-semibold text-slate-700">
              Ticari Unvan
            </label>
            <input
              id="set-legal"
              type="text"
              value={form.legalName}
              onChange={(e) => setForm((p) => ({ ...p, legalName: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="set-district" className="block text-xs font-semibold text-slate-700">
              İlçe / Şehir
            </label>
            <input
              id="set-district"
              type="text"
              value={form.district}
              onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="set-email" className="block text-xs font-semibold text-slate-700">
              Kurumsal E-Posta
            </label>
            <input
              id="set-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="set-hours" className="block text-xs font-semibold text-slate-700">
              Çalışma Saatleri
            </label>
            <input
              id="set-hours"
              type="text"
              value={form.workingHours}
              onChange={(e) => setForm((p) => ({ ...p, workingHours: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-4">
          <h3 className="font-display text-sm font-bold text-slate-900">Ana Sayfa Hero İçeriği</h3>
          <div>
            <label htmlFor="set-headline" className="block text-xs font-semibold text-slate-700">
              Ana Başlık (H1)
            </label>
            <input
              id="set-headline"
              type="text"
              value={form.heroHeadline}
              onChange={(e) => setForm((p) => ({ ...p, heroHeadline: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="set-subtext" className="block text-xs font-semibold text-slate-700">
              Hero Açıklama Metni
            </label>
            <textarea
              id="set-subtext"
              rows={3}
              value={form.heroSubtext}
              onChange={(e) => setForm((p) => ({ ...p, heroSubtext: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="set-cta" className="block text-xs font-semibold text-slate-700">
              Ana Buton Etiketi
            </label>
            <input
              id="set-cta"
              type="text"
              value={form.heroCtaLabel}
              onChange={(e) => setForm((p) => ({ ...p, heroCtaLabel: e.target.value }))}
              className="mt-1 w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}

interface ThemeExportProps {
  cms: CmsState;
  token: string;
}

export function ThemeExportView({ cms, token }: ThemeExportProps) {
  const themeFiles = useMemo(() => generateWordPressThemeFiles(cms), [cms]);
  const [selectedFile, setSelectedFile] = useState(themeFiles[0].filename);
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState<'theme' | 'project' | 'static' | null>(
    null,
  );
  const [downloadError, setDownloadError] = useState('');

  const activeFile = themeFiles.find((f) => f.filename === selectedFile) || themeFiles[0];

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadActiveFile = () => {
    const mime = activeFile.filename.endsWith('.css') ? 'text/css' : 'application/x-httpd-php';
    const blob = new Blob([activeFile.content], { type: `${mime}; charset=utf-8` });
    triggerBlobDownload(blob, activeFile.filename);
  };

  const handleDownloadThemeZip = async () => {
    setDownloadError('');
    setDownloadingZip('theme');
    try {
      const blob = await buildWordPressThemeZipBlob(cms);
      triggerBlobDownload(blob, 'anb-plastik-wp-tema.zip');
    } catch {
      setDownloadError('WordPress tema ZIP paketi oluşturulamadı.');
    } finally {
      setDownloadingZip(null);
    }
  };

  const handleDownloadStaticZip = async () => {
    setDownloadError('');
    setDownloadingZip('static');
    try {
      const res = await fetch('/api/export/static-zip', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setDownloadError('Statik site paketi oluşturulamadı. Lütfen oturumunuzu kontrol edin.');
        return;
      }
      const blob = await res.blob();
      triggerBlobDownload(blob, 'anb-plastik-statik-site.zip');
    } catch {
      setDownloadError('Sunucu bağlantısı sırasında statik paket indirilemedi.');
    } finally {
      setDownloadingZip(null);
    }
  };

  const handleDownloadProjectZip = async () => {
    setDownloadError('');
    setDownloadingZip('project');
    try {
      const res = await fetch('/api/export/project-zip', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setDownloadError('Proje dosyaları indirilemedi. Lütfen yönetici oturumunuzu kontrol edin.');
        return;
      }
      const blob = await res.blob();
      triggerBlobDownload(blob, 'anb-plastik-tum-dosyalar.zip');
    } catch {
      setDownloadError('Sunucu bağlantısı sırasında arşiv indirilemedi.');
    } finally {
      setDownloadingZip(null);
    }
  };

  const handleDownloadJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      theme: 'anb-plastik',
      files: themeFiles,
      cmsData: cms,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    triggerBlobDownload(blob, 'anb-plastik-wordpress-paketi.json');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            WordPress Tema & Proje Dosyaları İndirme Merkezi
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Kullanacağınız sunucu ortamına uygun paketi seçin: WordPress Teması, cPanel/FTP
            Statik Hosting veya tam Node.js kaynak kodları.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadThemeZip}
            disabled={downloadingZip !== null}
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white whitespace-nowrap hover:bg-sky-700 disabled:opacity-60"
          >
            <FileCode2 className="h-4 w-4" aria-hidden="true" />
            <span>
              {downloadingZip === 'theme'
                ? 'Hazırlanıyor...'
                : 'WordPress Temasını İndir (.zip)'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownloadStaticZip}
            disabled={downloadingZip !== null}
            className="inline-flex items-center gap-2 rounded-md border border-sky-700 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-900 whitespace-nowrap hover:bg-sky-100 disabled:opacity-60"
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            <span>
              {downloadingZip === 'static'
                ? 'Derleniyor...'
                : 'Statik Hosting Paketi (.zip)'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownloadProjectZip}
            disabled={downloadingZip !== null}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 whitespace-nowrap hover:bg-slate-50 disabled:opacity-60"
          >
            <Archive className="h-4 w-4" aria-hidden="true" />
            <span>
              {downloadingZip === 'project'
                ? 'Hazırlanıyor...'
                : 'Tüm Kaynak Kodları (.zip)'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 whitespace-nowrap hover:bg-slate-50"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-700 md:grid-cols-3">
        <div>
          <p className="font-semibold text-slate-900">1. WordPress Kurulumu</p>
          <p className="mt-1 leading-relaxed text-slate-600">
            <strong>anb-plastik-wp-tema.zip</strong> dosyasını WordPress Panel &gt; Görünüm &gt;
            Temalar &gt; Yeni Ekle &gt; Tema Yükle bölümünden yükleyip etkinleştirin.
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">2. cPanel / FTP (public_html)</p>
          <p className="mt-1 leading-relaxed text-slate-600">
            <strong>anb-plastik-statik-site.zip</strong> içindeki derlenmiş dosyaları doğrudan{' '}
            <code>public_html</code> klasörüne çıkarın. Ham <code>src/</code> dosyaları tarayıcıda
            tek başına açılmaz.
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">3. Node.js Sunucusu (Tam CMS)</p>
          <p className="mt-1 leading-relaxed text-slate-600">
            <strong>anb-plastik-tum-dosyalar.zip</strong> paketini sunucuda açıp{' '}
            <code>npm install &amp;&amp; npm run build &amp;&amp; npm start</code> komutlarını
            çalıştırın.
          </p>
        </div>
      </div>

      {downloadError && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800"
        >
          {downloadError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
            wp-content/themes/anb-plastik/
          </div>
          <ul className="divide-y divide-slate-200">
            {themeFiles.map((file) => (
              <li key={file.filename}>
                <button
                  type="button"
                  onClick={() => setSelectedFile(file.filename)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    selectedFile === file.filename ? 'bg-sky-50/80' : 'hover:bg-slate-50'
                  }`}
                >
                  <p className="font-mono text-sm font-semibold text-slate-900">{file.filename}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{file.description}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 lg:col-span-8 overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
            <span className="font-mono text-xs font-medium text-sky-300">
              {activeFile.filename}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadActiveFile}
                className="inline-flex items-center gap-1.5 rounded border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-200 hover:border-slate-500"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Bu Dosyayı İndir</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-200 hover:border-slate-500"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
              </button>
            </div>
          </div>
          <pre className="max-h-[460px] overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-200">
            <code>{activeFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
