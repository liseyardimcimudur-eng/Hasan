import { useEffect, useState, type FormEvent } from 'react';
import { Check, ExternalLink, Plus, Trash2 } from 'lucide-react';
import type { CmsPage, PublishStatus } from '../../data/defaultCmsState';

interface PagesManagerProps {
  pages: CmsPage[];
  initialEditPageId?: string;
  token: string;
  onRefreshCms: () => Promise<void>;
  onPreviewPage: (slug: string) => void;
}

export function PagesManager({
  pages,
  initialEditPageId,
  token,
  onRefreshCms,
  onPreviewPage,
}: PagesManagerProps) {
  const sortedPages = [...pages].sort((a, b) => a.order - b.order);
  const [selectedId, setSelectedId] = useState<string>(
    initialEditPageId || sortedPages[0]?.id || '',
  );
  const [creatingNew, setCreatingNew] = useState(false);

  const selectedPage = sortedPages.find((p) => p.id === selectedId);

  const [draft, setDraft] = useState<Partial<CmsPage>>(() =>
    selectedPage ? { ...selectedPage } : {},
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  useEffect(() => {
    if (initialEditPageId) {
      const target = pages.find((p) => p.id === initialEditPageId);
      if (target) {
        setCreatingNew(false);
        setSelectedId(target.id);
        setDraft(structuredClone(target));
        setFeedback(null);
      }
    }
  }, [initialEditPageId, pages]);

  const loadPageIntoEditor = (page: CmsPage) => {
    setCreatingNew(false);
    setSelectedId(page.id);
    setDraft(structuredClone(page));
    setFeedback(null);
  };

  const startNewPage = () => {
    setCreatingNew(true);
    setSelectedId('');
    setFeedback(null);
    setDraft({
      title: '',
      navLabel: '',
      slug: '/yeni-sayfa',
      status: 'published',
      showInNav: true,
      kicker: 'ANB Plastik · Bilgilendirme',
      lead: '',
      body: '',
      sections: {
        showHero: false,
        showCatalog: false,
        showAbout: false,
        showSectors: false,
        showQuoteForm: true,
      },
    });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!draft.title?.trim() || !draft.slug?.trim()) {
      setFeedback({ type: 'err', msg: 'Sayfa başlığı ve URL yolu zorunludur.' });
      return;
    }

    setSaving(true);
    try {
      const url = creatingNew ? '/api/cms/pages' : `/api/cms/pages/${selectedId}`;
      const method = creatingNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'err', msg: data.error || 'Sayfa kaydedilemedi.' });
        return;
      }

      await onRefreshCms();
      if (data.page) {
        setCreatingNew(false);
        setSelectedId(data.page.id);
        setDraft(structuredClone(data.page));
      }
      setFeedback({ type: 'ok', msg: 'Sayfa değişiklikleri kaydedildi ve yayına alındı.' });
    } catch {
      setFeedback({ type: 'err', msg: 'Sunucu bağlantı hatası.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (page: CmsPage) => {
    if (page.slug === '/') return;
    setFeedback(null);
    try {
      const res = await fetch(`/api/cms/pages/${page.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'err', msg: data.error || 'Sayfa silinemedi.' });
        return;
      }
      await onRefreshCms();
      const remaining = sortedPages.filter((p) => p.id !== page.id);
      if (remaining[0]) {
        loadPageIntoEditor(remaining[0]);
      }
      setFeedback({ type: 'ok', msg: `"${page.title}" sayfası silindi.` });
    } catch {
      setFeedback({ type: 'err', msg: 'Silme işlemi başarısız.' });
    }
  };

  const updateSection = (key: keyof CmsPage['sections'], value: boolean) => {
    setDraft((prev) => ({
      ...prev,
      sections: {
        showHero: prev.sections?.showHero ?? false,
        showCatalog: prev.sections?.showCatalog ?? false,
        showAbout: prev.sections?.showAbout ?? false,
        showSectors: prev.sections?.showSectors ?? false,
        showQuoteForm: prev.sections?.showQuoteForm ?? true,
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Sayfalar Yönetimi</h2>
          <p className="mt-1 text-sm text-slate-600">
            Tüm WordPress sayfalarının başlıklarını, içeriklerini, yayın durumlarını ve blok
            görünümlerini kontrol edin.
          </p>
        </div>

        <button
          type="button"
          onClick={startNewPage}
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white whitespace-nowrap shrink-0 hover:bg-sky-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Yeni Sayfa Ekle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
            Kayıtlı Sayfalar ({sortedPages.length})
          </div>
          <ul className="divide-y divide-slate-200">
            {sortedPages.map((page) => {
              const active = !creatingNew && selectedId === page.id;
              return (
                <li
                  key={page.id}
                  className={`flex items-center justify-between gap-3 px-4 py-3 transition-colors ${
                    active ? 'bg-sky-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => loadPageIntoEditor(page)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-semibold text-slate-900">{page.title}</p>
                    <p className="mt-0.5 font-mono text-xs text-slate-500">{page.slug}</p>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded border px-2 py-0.5 text-xs font-medium ${
                        page.status === 'published'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-amber-200 bg-amber-50 text-amber-800'
                      }`}
                    >
                      {page.status === 'published' ? 'Yayımlandı' : 'Taslak'}
                    </span>
                    <button
                      type="button"
                      aria-label={`${page.title} sayfasını sitede görüntüle`}
                      onClick={() => onPreviewPage(page.slug)}
                      className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="lg:col-span-7">
          <form
            onSubmit={handleSave}
            className="space-y-5 rounded-lg border border-slate-200 bg-white p-6"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="font-display text-lg font-bold text-slate-900">
                {creatingNew ? 'Yeni WordPress Sayfası Oluştur' : `Düzenle: ${draft.title || ''}`}
              </h3>
              {!creatingNew && selectedPage && selectedPage.slug !== '/' && (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedPage)}
                  className="inline-flex items-center gap-1.5 rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Sil</span>
                </button>
              )}
            </div>

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
                <label htmlFor="page-title" className="block text-xs font-semibold text-slate-700">
                  Sayfa Başlığı
                </label>
                <input
                  id="page-title"
                  type="text"
                  value={draft.title || ''}
                  onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-700 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="page-navlabel" className="block text-xs font-semibold text-slate-700">
                  Menü Etiketi
                </label>
                <input
                  id="page-navlabel"
                  type="text"
                  value={draft.navLabel || ''}
                  onChange={(e) => setDraft((p) => ({ ...p, navLabel: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-700 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="page-slug" className="block text-xs font-semibold text-slate-700">
                  Kalıcı Bağlantı (Slug)
                </label>
                <input
                  id="page-slug"
                  type="text"
                  disabled={!creatingNew && selectedPage?.slug === '/'}
                  value={draft.slug || ''}
                  onChange={(e) => setDraft((p) => ({ ...p, slug: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 disabled:bg-slate-100 focus:border-sky-700 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="page-status" className="block text-xs font-semibold text-slate-700">
                  Yayın Durumu
                </label>
                <select
                  id="page-status"
                  value={draft.status || 'published'}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, status: e.target.value as PublishStatus }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-700 focus:outline-none"
                >
                  <option value="published">Yayımlandı</option>
                  <option value="draft">Taslak (Gizli)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="page-kicker" className="block text-xs font-semibold text-slate-700">
                Üst Başlık (Kicker)
              </label>
              <input
                id="page-kicker"
                type="text"
                value={draft.kicker || ''}
                onChange={(e) => setDraft((p) => ({ ...p, kicker: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-700 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="page-lead" className="block text-xs font-semibold text-slate-700">
                Sayfa Alt Başlığı / Vurgu Cümlesi
              </label>
              <input
                id="page-lead"
                type="text"
                value={draft.lead || ''}
                onChange={(e) => setDraft((p) => ({ ...p, lead: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-700 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="page-body" className="block text-xs font-semibold text-slate-700">
                Sayfa İçerik Metni
              </label>
              <textarea
                id="page-body"
                rows={4}
                value={draft.body || ''}
                onChange={(e) => setDraft((p) => ({ ...p, body: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-700 focus:outline-none"
              />
            </div>

            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs font-semibold text-slate-700">
                Bu Sayfada Gösterilecek Modüller
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.showInNav)}
                    onChange={(e) => setDraft((p) => ({ ...p, showInNav: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-sky-700"
                  />
                  <span>Üst Menüde Göster</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.sections?.showHero)}
                    onChange={(e) => updateSection('showHero', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-700"
                  />
                  <span>Hero Vitrin Bölümü</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.sections?.showCatalog)}
                    onChange={(e) => updateSection('showCatalog', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-700"
                  />
                  <span>YYPE & AYPE Ürün Kataloğu</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.sections?.showAbout)}
                    onChange={(e) => updateSection('showAbout', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-700"
                  />
                  <span>Kurumsal Yetenekler (Hakkımızda)</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.sections?.showSectors)}
                    onChange={(e) => updateSection('showSectors', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-700"
                  />
                  <span>Sektörel Referans Tablosu</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.sections?.showQuoteForm)}
                    onChange={(e) => updateSection('showQuoteForm', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-700"
                  />
                  <span>Teklif ve İletişim Formu</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              {!creatingNew && draft.slug && (
                <button
                  type="button"
                  onClick={() => onPreviewPage(draft.slug!)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Sayfayı Görüntüle
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {saving ? 'Kaydediliyor...' : creatingNew ? 'Sayfayı Oluştur' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
