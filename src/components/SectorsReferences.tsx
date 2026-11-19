import type { CmsPage, CmsSectorReference } from '../data/defaultCmsState';

interface SectorsReferencesProps {
  sectors: CmsSectorReference[];
  referencesPage?: CmsPage;
  onSelectSectorQuote: (sectorName: string) => void;
}

export function SectorsReferences({
  sectors,
  referencesPage,
  onSelectSectorQuote,
}: SectorsReferencesProps) {
  return (
    <section id="sektorler" className="border-b border-slate-200 bg-slate-900 py-16 text-slate-100 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-xs font-medium tracking-wide text-sky-400">
              {referencesPage?.kicker || 'Sektörel Çözümler & Referans Yapısı'}
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white [text-wrap:balance] sm:text-4xl">
              {referencesPage?.lead || 'Farklı İmalat Disiplinlerine Özel Polimer Çözümleri'}
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-300 lg:col-span-5">
            {referencesPage?.body ||
              'Ekstrüzyon, şişirme ve enjeksiyon tesislerinin spesifik MFI, yoğunluk ve termal dayanım beklentilerine uygun hammadde tedarik ediyoruz.'}
          </p>
        </div>

        <div
          id="referanslar"
          className="mt-12 divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-950/60"
        >
          <div className="hidden grid-cols-12 gap-4 px-6 py-3.5 text-xs font-medium text-slate-400 lg:grid">
            <span className="col-span-3">Sektör Grubu</span>
            <span className="col-span-3">Önerilen Polimer</span>
            <span className="col-span-4">Tipik Nihai Ürünler</span>
            <span className="col-span-2 text-right">Tedarik Standardı</span>
          </div>

          {sectors.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-1 gap-3 px-6 py-5 transition-colors hover:bg-slate-900/80 lg:grid-cols-12 lg:items-center lg:gap-4"
            >
              <div className="lg:col-span-3">
                <h3 className="font-display text-base font-semibold text-white">{item.sector}</h3>
              </div>
              <div className="font-mono text-xs text-sky-300 lg:col-span-3">
                {item.polymers}
              </div>
              <div className="text-sm text-slate-300 lg:col-span-4">{item.applications}</div>
              <div className="flex items-center justify-between gap-3 lg:col-span-2 lg:justify-end">
                <span className="text-xs text-slate-400 lg:text-right">{item.benchmark}</span>
                <button
                  type="button"
                  onClick={() => onSelectSectorQuote(item.sector)}
                  className="shrink-0 rounded border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-sky-500 hover:text-white"
                >
                  Sor
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
