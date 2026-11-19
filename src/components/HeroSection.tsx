import { useState } from 'react';
import { ArrowRight, Layers } from 'lucide-react';
import type { CmsSiteSettings } from '../data/defaultCmsState';
import { HERO_METRICS } from '../data/polymers';

interface HeroSectionProps {
  settings: CmsSiteSettings;
  onRequestQuote: () => void;
  onBrowseCatalog: () => void;
}

export function HeroSection({
  settings,
  onRequestQuote,
  onBrowseCatalog,
}: HeroSectionProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <section id="top" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-500">
                {settings.slogan} · {settings.district}
              </p>

              <h1
                className="mt-4 font-display font-bold tracking-tight text-slate-900 [text-wrap:balance]"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', lineHeight: 1.08 }}
              >
                {settings.heroHeadline}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {settings.heroSubtext}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onRequestQuote}
                  className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                >
                  {settings.heroCtaLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={onBrowseCatalog}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-800 whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                >
                  Ürün Kataloğunu İncele
                </button>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-1.5 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1">
              <span>YYPE (HDPE): 0,02 – 20 g/10dk</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span>AYPE (LDPE): 0,3 – 70 g/10dk</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span>Test Standardı: 190°C / 2.16 kg</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-72 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:h-96 lg:h-full lg:min-h-[420px]">
              {!imageError ? (
                <img
                  src="/src/assets/images/hero_polymer_pellets_1795044041921.jpg"
                  alt="ANB Plastik polietilen granül hammadde, HDPE basınçlı boru kesitleri ve endüstriyel ambalaj film ruloları"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center text-slate-100">
                  <Layers className="mb-3 h-10 w-10 text-sky-400" aria-hidden="true" />
                  <p className="font-display text-lg font-semibold">
                    YYPE & AYPE Polimer Grubu
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Endüstriyel Polietilen Granül, Boru ve Film Hammaddeleri
                  </p>
                </div>
              )}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/60 via-slate-950/20 to-transparent"
              />
              <p className="absolute bottom-4 left-4 right-4 text-xs font-medium text-white/95">
                Doğal granül polietilen · Basınçlı boru kesitleri · Ekstrüzyon ambalaj filmleri
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {HERO_METRICS.map((metric) => (
            <div key={metric.label} className="bg-slate-50 px-5 py-5">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xl font-semibold tracking-tight text-slate-900 tabular-nums">
                  {metric.value}
                </span>
                <span className="font-mono text-xs font-medium text-sky-700">
                  {metric.unit}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-slate-600">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
