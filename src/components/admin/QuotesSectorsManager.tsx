import { useState, type FormEvent } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import type {
  CmsQuoteRecord,
  CmsSectorReference,
  QuoteStatus,
} from '../../data/defaultCmsState';

interface QuotesManagerProps {
  quotes: CmsQuoteRecord[];
  token: string;
  onRefreshCms: () => Promise<void>;
}

export function QuotesManager({ quotes, token, onRefreshCms }: QuotesManagerProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | QuoteStatus>('ALL');

  const filtered = quotes.filter((q) => {
    if (statusFilter !== 'ALL' && q.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const hay = `${q.referenceCode} ${q.companyOrName} ${q.email} ${q.gradeTitle}`.toLowerCase();
    return hay.includes(search.toLowerCase());
  });

  const handleStatusChange = async (id: string, status: QuoteStatus) => {
    await fetch(`/api/cms/quotes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    await onRefreshCms();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/cms/quotes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await onRefreshCms();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Gelen Teklif Talepleri
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Web sitesindeki iletişim ve teklif formundan gelen B2B hammadde taleplerini takip edin.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-slate-200/70 p-1">
          {(['ALL', 'Yeni', 'İnceleniyor', 'Teklif İletildi'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? `Tümü (${quotes.length})` : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Firma, referans veya ürün ara..."
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-600">
            Seçili filtreye uygun teklif talebi bulunmuyor.
          </div>
        ) : (
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="px-4 py-3">Referans</th>
                <th className="px-4 py-3">Firma / İletişim</th>
                <th className="px-4 py-3">Polimer Grubu</th>
                <th className="px-4 py-3 text-right">Miktar</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 align-top">
                    <p className="font-mono text-xs font-semibold text-slate-900">
                      {q.referenceCode}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-slate-500">{q.createdAt}</p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold text-slate-900">{q.companyOrName}</p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {q.email} · {q.phone}
                    </p>
                    {q.notes && <p className="mt-1 text-xs text-slate-500">{q.notes}</p>}
                  </td>
                  <td className="px-4 py-3 align-top text-slate-800">{q.gradeTitle}</td>
                  <td className="px-4 py-3 align-top text-right font-mono font-semibold text-slate-900 tabular-nums">
                    {q.tonnageNumber} Ton
                  </td>
                  <td className="px-4 py-3 align-top">
                    <select
                      aria-label={`${q.referenceCode} durumu`}
                      value={q.status}
                      onChange={(e) => handleStatusChange(q.id, e.target.value as QuoteStatus)}
                      className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800"
                    >
                      <option value="Yeni">Yeni</option>
                      <option value="İnceleniyor">İnceleniyor</option>
                      <option value="Teklif İletildi">Teklif İletildi</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <button
                      type="button"
                      aria-label={`${q.referenceCode} talebini sil`}
                      onClick={() => handleDelete(q.id)}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

interface SectorsManagerProps {
  sectors: CmsSectorReference[];
  token: string;
  onRefreshCms: () => Promise<void>;
}

export function SectorsManager({ sectors, token, onRefreshCms }: SectorsManagerProps) {
  const [sectorName, setSectorName] = useState('');
  const [polymers, setPolymers] = useState('');
  const [applications, setApplications] = useState('');
  const [benchmark, setBenchmark] = useState('');
  const [error, setError] = useState('');

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!sectorName.trim()) {
      setError('Sektör adı zorunludur.');
      return;
    }

    const res = await fetch('/api/cms/sectors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sector: sectorName,
        polymers,
        applications,
        benchmark,
      }),
    });
    if (!res.ok) {
      setError('Kayıt eklenemedi.');
      return;
    }

    setSectorName('');
    setPolymers('');
    setApplications('');
    setBenchmark('');
    await onRefreshCms();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/cms/sectors/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await onRefreshCms();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Referanslar & Sektörel Çözümler
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Referanslarımız sayfasında ve ana sayfa sektör matrisinde görünen sanayi alanlarını
          düzenleyin.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-200">
          {sectors.map((sec) => (
            <li
              key={sec.id}
              className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-900">{sec.sector}</p>
                <p className="mt-0.5 font-mono text-xs text-sky-700">{sec.polymers}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {sec.applications} · {sec.benchmark}
                </p>
              </div>
              <button
                type="button"
                aria-label={`${sec.sector} kaydını sil`}
                onClick={() => handleDelete(sec.id)}
                className="self-start rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 sm:self-auto"
              >
                Kaldır
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form
        onSubmit={handleAdd}
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <h3 className="font-display text-base font-bold text-slate-900">
          Yeni Sektör Referansı Ekle
        </h3>
        {error && <p className="text-xs font-medium text-red-700">{error}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            value={sectorName}
            onChange={(e) => setSectorName(e.target.value)}
            placeholder="Sektör adı (Örn. Otomotiv Yan Sanayi)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={polymers}
            onChange={(e) => setPolymers(e.target.value)}
            placeholder="Önerilen polimer (Örn. YYPE Enjeksiyon 1–10)"
            className="rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
          />
          <input
            type="text"
            value={applications}
            onChange={(e) => setApplications(e.target.value)}
            placeholder="Tipik nihai ürünler"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={benchmark}
            onChange={(e) => setBenchmark(e.target.value)}
            placeholder="Tedarik standardı (Örn. LOT analiz sertifikalı)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Sektör Ekle</span>
        </button>
      </form>
    </div>
  );
}
