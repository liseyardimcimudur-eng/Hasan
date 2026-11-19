import { useState, type FormEvent } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import type {
  CmsPolymerGrade,
  PolymerFamily,
  ProcessMethod,
  PublishStatus,
} from '../../data/defaultCmsState';

interface ProductsManagerProps {
  grades: CmsPolymerGrade[];
  token: string;
  onRefreshCms: () => Promise<void>;
}

const PROCESSES: ProcessMethod[] = [
  'Enjeksiyonluk',
  'Şişirmelik',
  'Filmlik',
  'Boruluk',
  'Rafyalık',
];

export function ProductsManager({ grades, token, onRefreshCms }: ProductsManagerProps) {
  const [selectedId, setSelectedId] = useState<string>(grades[0]?.id || '');
  const [creating, setCreating] = useState(false);

  const selected = grades.find((g) => g.id === selectedId);
  const [form, setForm] = useState({
    family: (selected?.family || 'YYPE') as PolymerFamily,
    process: (selected?.process || 'Enjeksiyonluk') as ProcessMethod,
    title: selected?.title || '',
    mfiRange: selected?.mfiRange || '',
    testCondition: selected?.testCondition || '190°C / 2.16 kg',
    standards: selected?.standards || '',
    summary: selected?.summary || '',
    applicationsText: selected?.applications.join(', ') || '',
    status: (selected?.status || 'published') as PublishStatus,
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const loadGrade = (g: CmsPolymerGrade) => {
    setCreating(false);
    setSelectedId(g.id);
    setFeedback(null);
    setForm({
      family: g.family,
      process: g.process,
      title: g.title,
      mfiRange: g.mfiRange,
      testCondition: g.testCondition,
      standards: g.standards || '',
      summary: g.summary,
      applicationsText: g.applications.join(', '),
      status: g.status,
    });
  };

  const startCreate = () => {
    setCreating(true);
    setSelectedId('');
    setFeedback(null);
    setForm({
      family: 'YYPE',
      process: 'Enjeksiyonluk',
      title: '',
      mfiRange: '',
      testCondition: '190°C / 2.16 kg',
      standards: '',
      summary: '',
      applicationsText: '',
      status: 'published',
    });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!form.title.trim() || !form.mfiRange.trim()) {
      setFeedback({ type: 'err', msg: 'Ürün başlığı ve MFI aralığı zorunludur.' });
      return;
    }

    const applications = form.applicationsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      const url = creating ? '/api/cms/grades' : `/api/cms/grades/${selectedId}`;
      const method = creating ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          family: form.family,
          process: form.process,
          title: form.title,
          mfiRange: form.mfiRange,
          testCondition: form.testCondition,
          standards: form.standards,
          summary: form.summary,
          applications,
          status: form.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'err', msg: data.error || 'Ürün kaydedilemedi.' });
        return;
      }

      await onRefreshCms();
      if (data.grade) {
        loadGrade(data.grade);
      }
      setFeedback({ type: 'ok', msg: 'Polimer serisi güncellendi.' });
    } catch {
      setFeedback({ type: 'err', msg: 'Sunucu bağlantı hatası.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setFeedback(null);
    try {
      const res = await fetch(`/api/cms/grades/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setFeedback({ type: 'err', msg: 'Silme işlemi başarısız.' });
        return;
      }
      await onRefreshCms();
      const remaining = grades.filter((g) => g.id !== id);
      if (remaining[0]) {
        loadGrade(remaining[0]);
      } else {
        startCreate();
      }
      setFeedback({ type: 'ok', msg: 'Ürün serisi katalogdan kaldırıldı.' });
    } catch {
      setFeedback({ type: 'err', msg: 'Sunucu hatası.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Polimer Ürünleri (YYPE & AYPE)
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Katalogdaki YYPE ve AYPE serilerini, erime indeksi (MFI) değerlerini ve kullanım
            alanlarını yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white whitespace-nowrap shrink-0 hover:bg-sky-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Yeni Ürün Ekle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
            Kayıtlı Seriler ({grades.length})
          </div>
          <ul className="divide-y divide-slate-200">
            {grades.map((g) => {
              const active = !creating && selectedId === g.id;
              return (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => loadGrade(g)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                      active ? 'bg-sky-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{g.title}</p>
                      <p className="mt-0.5 font-mono text-xs text-slate-500">
                        {g.family} · {g.process} · {g.mfiRange}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded border px-2 py-0.5 text-xs font-medium ${
                        g.status === 'published'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-amber-200 bg-amber-50 text-amber-800'
                      }`}
                    >
                      {g.status === 'published' ? 'Aktif' : 'Taslak'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="lg:col-span-7">
          <form
            onSubmit={handleSave}
            className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="font-display text-lg font-bold text-slate-900">
                {creating ? 'Yeni Polimer Serisi Ekle' : `Düzenle: ${form.title}`}
              </h3>
              {!creating && selectedId && (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedId)}
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="prod-family" className="block text-xs font-semibold text-slate-700">
                  Polimer Grubu
                </label>
                <select
                  id="prod-family"
                  value={form.family}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, family: e.target.value as PolymerFamily }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="YYPE">YYPE (HDPE)</option>
                  <option value="AYPE">AYPE (LDPE)</option>
                </select>
              </div>

              <div>
                <label htmlFor="prod-process" className="block text-xs font-semibold text-slate-700">
                  Proses
                </label>
                <select
                  id="prod-process"
                  value={form.process}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, process: e.target.value as ProcessMethod }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  {PROCESSES.map((proc) => (
                    <option key={proc} value={proc}>
                      {proc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="prod-status" className="block text-xs font-semibold text-slate-700">
                  Durum
                </label>
                <select
                  id="prod-status"
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, status: e.target.value as PublishStatus }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="published">Aktif (Sitede Görünür)</option>
                  <option value="draft">Taslak (Gizli)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="prod-title" className="block text-xs font-semibold text-slate-700">
                Ürün Başlığı
              </label>
              <input
                id="prod-title"
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Örn. YYPE Boruluk Seri (PE100)"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="prod-mfi" className="block text-xs font-semibold text-slate-700">
                  Erime Değeri (MFI)
                </label>
                <input
                  id="prod-mfi"
                  type="text"
                  value={form.mfiRange}
                  onChange={(e) => setForm((p) => ({ ...p, mfiRange: e.target.value }))}
                  placeholder="0.03 – 0.07 g/10dk"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900"
                />
              </div>
              <div>
                <label htmlFor="prod-cond" className="block text-xs font-semibold text-slate-700">
                  Test Koşulu
                </label>
                <input
                  id="prod-cond"
                  type="text"
                  value={form.testCondition}
                  onChange={(e) => setForm((p) => ({ ...p, testCondition: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="prod-apps" className="block text-xs font-semibold text-slate-700">
                Uygulama Alanları (Virgül ile ayırın)
              </label>
              <input
                id="prod-apps"
                type="text"
                value={form.applicationsText}
                onChange={(e) => setForm((p) => ({ ...p, applicationsText: e.target.value }))}
                placeholder="Kapak, Kasa, Plastik Palet"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="prod-summary" className="block text-xs font-semibold text-slate-700">
                Teknik Açıklama
              </label>
              <textarea
                id="prod-summary"
                rows={3}
                value={form.summary}
                onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>

            <div className="flex justify-end border-t border-slate-200 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {saving ? 'Kaydediliyor...' : creating ? 'Ürünü Ekle' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
