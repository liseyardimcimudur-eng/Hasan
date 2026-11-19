import { useState } from 'react';
import { Edit3, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import type { CmsPage, CmsSiteSettings } from '../data/defaultCmsState';

interface NavbarProps {
  settings: CmsSiteSettings;
  pages: CmsPage[];
  currentPath: string;
  isAdmin: boolean;
  adminUsername?: string;
  onNavigate: (path: string) => void;
  onRequestQuote: () => void;
  onOpenAdmin: (tab?: string, pageId?: string) => void;
  onLogout: () => void;
  activePageId?: string;
}

export function Navbar({
  settings,
  pages,
  currentPath,
  isAdmin,
  adminUsername,
  onNavigate,
  onRequestQuote,
  onOpenAdmin,
  onLogout,
  activePageId,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navPages = pages
    .filter((p) => p.status === 'published' && p.showInNav)
    .sort((a, b) => a.order - b.order)
    .slice(0, 5);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(slug);
  };

  return (
    <div className="sticky top-0 z-40">
      {isAdmin && (
        <div className="border-b border-slate-800 bg-slate-950 px-4 text-xs text-slate-200 sm:px-6 lg:px-8">
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onOpenAdmin('dashboard')}
                className="inline-flex items-center gap-1.5 font-medium text-white whitespace-nowrap shrink-0 hover:text-sky-300"
              >
                <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Yönetim Paneli (wp-admin)</span>
              </button>
              {activePageId && (
                <button
                  type="button"
                  onClick={() => onOpenAdmin('pages', activePageId)}
                  className="hidden sm:inline-flex items-center gap-1.5 text-slate-300 whitespace-nowrap shrink-0 hover:text-white"
                >
                  <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Bu Sayfayı Düzenle</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-slate-400">
                Yönetici: {adminUsername || 'admin'}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1 text-slate-300 whitespace-nowrap shrink-0 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700"
          >
            {settings.brandName}
          </a>

          <nav
            aria-label="Ana gezinme"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
          >
            {navPages.map((page) => {
              const isCurrent = currentPath === page.slug;
              return (
                <a
                  key={page.id}
                  href={page.slug}
                  onClick={(e) => handleLinkClick(e, page.slug)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`whitespace-nowrap shrink-0 py-1 underline-offset-4 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700 ${
                    isCurrent
                      ? 'font-semibold text-slate-900 underline decoration-sky-700 decoration-2'
                      : 'text-slate-600 hover:text-slate-900 hover:underline'
                  }`}
                >
                  {page.navLabel}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onRequestQuote}
              className="hidden sm:inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            >
              Teklif Al
            </button>

            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Gezinme menüsünü kapat' : 'Gezinme menüsünü aç'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            aria-label="Mobil gezinme"
            className="border-t border-slate-200 bg-white px-4 py-4 md:hidden"
          >
            <ul className="flex flex-col gap-1">
              {navPages.map((page) => {
                const isCurrent = currentPath === page.slug;
                return (
                  <li key={page.id}>
                    <a
                      href={page.slug}
                      onClick={(e) => handleLinkClick(e, page.slug)}
                      className={`block rounded-md px-3 py-2.5 text-base font-medium transition-colors ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-900 font-semibold'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {page.navLabel}
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onRequestQuote();
                }}
                className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700"
              >
                Teklif Al
              </button>
            </div>
          </nav>
        )}
      </header>
    </div>
  );
}
