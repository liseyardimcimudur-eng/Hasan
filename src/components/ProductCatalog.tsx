import { useMemo, useState } from 'react';
import { ArrowUpRight, Search, X } from 'lucide-react';
import type { CmsPolymerGrade } from '../data/defaultCmsState';
import {
  filterPolymerGrades,
  getAvailableProcesses,
  type FamilyFilter,
  type ProcessFilter,
} from '../utils/catalog';

interface ProductCatalogProps {
  grades: CmsPolymerGrade[];
  selectedGradeId: string;
  onSelectGradeForQuote: (grade: CmsPolymerGrade) => void;
}

export function ProductCatalog({
  grades,
  selectedGradeId,
  onSelectGradeForQuote,
}: ProductCatalogProps) {
  const [family, setFamily] = useState<FamilyFilter>('ALL');
  const [process, setProcess] = useState<ProcessFilter>('ALL');
  const [query, setQuery] = useState('');

  const publishedGrades = useMemo(
    () => grades.filter((g) => g.status === 'published'),
    [grades],
  );

  const familyOptions: { value: FamilyFilter; label: string }[] = [
    { value: 'ALL', label: `Tümü (${publishedGrades.length} Seri)` },
    { value: 'YYPE', label: 'YYPE · Yüksek Yoğunluklu' },
    { value: 'AYPE', label: 'AYPE · Alçak Yoğunluklu' },
  ];

  const availableProcesses = useMemo(
    () => getAvailableProcesses(publishedGrades, family),
    [publishedGrades, family],
  );

  const filteredGrades = useMemo(
    () =>
      filterPolymerGrades(publishedGrades, {
        family,
        process,
        query,
      }),
    [publishedGrades, family, process, query],
  );

  const handleFamilyChange = (nextFamily: FamilyFilter) => {
    setFamily(nextFamily);
    const nextProcesses = getAvailableProcesses(publishedGrades, nextFamily);
    if (process !== 'ALL' && !nextProcesses.includes(process)) {
      setProcess('ALL');
    }
  };

  const resetFilters = () => {
    setFamily('ALL');
    setProcess('ALL');
    setQuery('');
  };

  return (
    <section id="urunler" className="border-b border-slate-200 bg-slate-50 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-wide text-sky-700">
              Ürün Kataloğu · Teknik Erime İndeksi Rehberi
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 [text-wrap:balance] sm:text-4xl">
              YYPE ve AYPE Polietilen Ürün Grupları
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Üretim yönteminize ve hedef uygulama alanınıza göre erime akış indeksi (MFI)
              değerlerini filtreleyin, teknik detayları inceleyin ve doğrudan teklif talebine ekleyin.
            </p>
          </div>

          <div className="w-full lg:w-80">
            <label htmlFor="catalog-search" className="sr-only">
              Uygulama veya polimer ara
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="catalog-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ara: PE100, sera, bidon, shrink..."
                className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-700"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Aramayı temizle"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-y border-slate-200 py-4 md:flex-row md:items-center md:justify-between">
          <div
            role="group"
            aria-label="Polimer grubu filtresi"
            className="flex flex-wrap items-center gap-1.5 rounded-lg bg-slate-200/70 p-1"
          >
            {familyOptions.map((opt) => {
              const active = family === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleFamilyChange(opt.value)}
                  className={`rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div
            role="group"
            aria-label="İşleme yöntemi filtresi"
            className="flex flex-wrap items-center gap-1.5"
          >
            <button
              type="button"
              onClick={() => setProcess('ALL')}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 ${
                process === 'ALL'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              }`}
            >
              Tüm Prosesler
            </button>
            {availableProcesses.map((proc) => {
              const active = process === proc;
              return (
                <button
                  key={proc}
                  type="button"
                  onClick={() => setProcess(proc)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 ${
                    active
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                >
                  {proc}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span className="tabular-nums">
            {filteredGrades.length} ürün grubu listeleniyor
          </span>
          {(family !== 'ALL' || process !== 'ALL' || query.trim() !== '') && (
            <button
              type="button"
              onClick={resetFilters}
              className="font-medium text-sky-700 hover:underline"
            >
              Filtreleri Sıfırla
            </button>
          )}
        </div>

        {filteredGrades.length === 0 ? (
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-10 text-center">
            <h3 className="font-display text-lg font-semibold text-slate-900">
              Eşleşen polietilen sınıfı bulunamadı
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Arama teriminizi değiştirerek veya filtreleri sıfırlayarak tüm YYPE ve AYPE serilerini
              görüntüleyebilirsiniz.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700"
            >
              Tüm Ürünleri Göster
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGrades.map((grade) => {
              const isSelected = selectedGradeId === grade.id;
              const shouldSpanTwo =
                filteredGrades.length === 7 &&
                (grade.id === 'yype-boruluk' || grade.id === 'aype-filmlik');
              return (
                <article
                  key={grade.id}
                  data-testid={`grade-card-${grade.id}`}
                  className={`flex flex-col justify-between rounded-lg border bg-white p-6 transition-colors duration-150 ${
                    shouldSpanTwo ? 'md:col-span-2 lg:col-span-2' : ''
                  } ${
                    isSelected
                      ? 'border-sky-700 ring-1 ring-sky-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span>
                        {grade.family} ({grade.familyEnglishName})
                        <span aria-hidden="true"> · </span>
                        {grade.process}
                      </span>
                      <span className="font-mono tabular-nums">{grade.testCondition}</span>
                    </div>

                    <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-slate-900">
                      {grade.title}
                    </h3>

                    <div className="mt-3 flex items-baseline justify-between border-y border-slate-100 py-2.5">
                      <span className="text-xs font-medium text-slate-500">Erime Değeri (MFI)</span>
                      <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                        {grade.mfiRange}
                      </span>
                    </div>

                    {grade.standards && (
                      <p className="mt-2.5 font-mono text-xs font-medium text-sky-700">
                        Standartlar: {grade.standards}
                      </p>
                    )}

                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{grade.summary}</p>

                    <div className="mt-4">
                      <h4 className="text-xs font-semibold text-slate-700">Uygulama Alanları</h4>
                      <ul
                        className={`mt-2 gap-x-6 gap-y-1 text-sm text-slate-700 ${
                          shouldSpanTwo ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-1'
                        }`}
                      >
                        {grade.applications.map((app) => (
                          <li key={app} className="flex items-start gap-2">
                            <span
                              aria-hidden="true"
                              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400"
                            />
                            <span>{app}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => onSelectGradeForQuote(grade)}
                      className={`inline-flex w-full items-center justify-between rounded-md px-4 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${
                        isSelected
                          ? 'bg-sky-700 text-white hover:bg-sky-800'
                          : 'bg-slate-100 text-slate-900 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <span>{isSelected ? 'Teklif Formunda Seçili' : 'Bu Ürün İçin Teklif Al'}</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
