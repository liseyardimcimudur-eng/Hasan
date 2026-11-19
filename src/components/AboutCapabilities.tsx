import { useState } from 'react';
import { Factory, PackageCheck } from 'lucide-react';
import type { CmsPage, CmsSiteSettings } from '../data/defaultCmsState';
import { CAPABILITIES } from '../data/polymers';

interface AboutCapabilitiesProps {
  settings: CmsSiteSettings;
  aboutPage?: CmsPage;
}

export function AboutCapabilities({ settings, aboutPage }: AboutCapabilitiesProps) {
  const [pipeImgErr, setPipeImgErr] = useState(false);
  const [filmImgErr, setFilmImgErr] = useState(false);
  const [warehouseImgErr, setWarehouseImgErr] = useState(false);

  return (
    <section id="hakkimizda" className="border-b border-slate-200 bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-wide text-sky-700">
              {aboutPage?.kicker || `Hakkımızda · ${settings.district}`}
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 [text-wrap:balance] sm:text-4xl">
              {aboutPage?.lead || 'Üretim Hatları İçin Planlı ve Süreklilik Odaklı Hammadde Tedariği'}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              {aboutPage?.body ||
                `${settings.legalName}, Türkiye’nin plastik sanayi kümelenme merkezi ${settings.district}’dan yurt içi üreticilere polietilen hammaddeleri tedarik etmektedir.`}
            </p>

            <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              {!warehouseImgErr ? (
                <img
                  src="/src/assets/images/warehouse_logistics_1795044043517.jpg"
                  alt="25 kg polietilen hammadde çuvallarının paletli olarak istiflendiği modern lojistik deposu"
                  referrerPolicy="no-referrer"
                  onError={() => setWarehouseImgErr(true)}
                  className="aspect-4/3 w-full object-cover"
                />
              ) : (
                <div className="flex aspect-4/3 w-full flex-col items-center justify-center bg-slate-800 p-6 text-center text-white">
                  <PackageCheck className="mb-2 h-8 w-8 text-sky-400" aria-hidden="true" />
                  <p className="text-sm font-medium">{settings.district} Hammadde Lojistik Merkezi</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between gap-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {CAPABILITIES.map((cap) => (
                <div
                  key={cap.index}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-6"
                >
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {cap.index}. {cap.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                    {cap.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {!pipeImgErr ? (
                  <img
                    src="/src/assets/images/polymer_hdpe_pipes_1795044042499.jpg"
                    alt="YYPE PE100 basınçlı borular ve endüstriyel plastik enjeksiyon kasaları"
                    referrerPolicy="no-referrer"
                    onError={() => setPipeImgErr(true)}
                    className="aspect-4/3 w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-4/3 items-center justify-center bg-slate-800 text-white">
                    <Factory className="h-8 w-8 text-sky-400" aria-hidden="true" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs font-medium text-slate-500">YYPE · PE63 / PE80 / PE100</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Altyapı Boru ve Enjeksiyon Uygulamaları
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {!filmImgErr ? (
                  <img
                    src="/src/assets/images/polymer_ldpe_film_1795044042950.jpg"
                    alt="AYPE şeffaf shrink film ve endüstriyel ambalaj rulo üretimi"
                    referrerPolicy="no-referrer"
                    onError={() => setFilmImgErr(true)}
                    className="aspect-4/3 w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-4/3 items-center justify-center bg-slate-800 text-white">
                    <Factory className="h-8 w-8 text-sky-400" aria-hidden="true" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs font-medium text-slate-500">AYPE · MFI 0,3 – 7 g/10dk</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Shrink, Sera Örtüsü ve Ambalaj Filmleri
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
