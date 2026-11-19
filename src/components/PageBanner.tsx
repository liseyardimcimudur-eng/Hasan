import { Edit3 } from 'lucide-react';
import type { CmsPage } from '../data/defaultCmsState';

interface PageBannerProps {
  page: CmsPage;
  isAdmin: boolean;
  onEditPage: (pageId: string) => void;
}

export function PageBanner({ page, isAdmin, onEditPage }: PageBannerProps) {
  return (
    <section className="border-b border-slate-200 bg-white py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-medium tracking-wide text-sky-700">
              {page.kicker || page.title}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 [text-wrap:balance] sm:text-4xl">
              {page.title}
            </h1>
            {page.lead && (
              <p className="mt-3 text-lg font-medium text-slate-800">{page.lead}</p>
            )}
            {page.body && (
              <p className="mt-2.5 text-base leading-relaxed text-slate-600">{page.body}</p>
            )}
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => onEditPage(page.id)}
              className="inline-flex items-center gap-2 self-start rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-100 md:self-auto"
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sayfayı Düzenle</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
