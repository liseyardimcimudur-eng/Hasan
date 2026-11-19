import type { CmsPage, CmsSiteSettings } from '../data/defaultCmsState';

interface FooterProps {
  settings: CmsSiteSettings;
  pages: CmsPage[];
  onNavigate: (slug: string) => void;
  onOpenAdminLogin: () => void;
  onOpenDrivePortal: () => void;
}

export function Footer({
  settings,
  pages,
  onNavigate,
  onOpenAdminLogin,
  onOpenDrivePortal,
}: FooterProps) {
  const footerPages = pages
    .filter((p) => p.status === 'published')
    .sort((a, b) => a.order - b.order);

  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-lg font-bold tracking-tight text-slate-900">
              {settings.brandName}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {settings.slogan} · {settings.district}
            </p>
          </div>

          <nav aria-label="Alt menü" className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
            {footerPages.map((page) => (
              <a
                key={page.id}
                href={page.slug}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(page.slug);
                }}
                className="hover:text-slate-900 hover:underline underline-offset-4"
              >
                {page.navLabel}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {settings.legalName}. Tüm hakları saklıdır.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span>{settings.domain}</span>
            <span aria-hidden="true">·</span>
            <a
              href="/drive"
              onClick={(e) => {
                e.preventDefault();
                onOpenDrivePortal();
              }}
              className="font-medium text-slate-600 hover:text-sky-700 hover:underline underline-offset-2"
            >
              Google Drive
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="/wp-admin"
              onClick={(e) => {
                e.preventDefault();
                onOpenAdminLogin();
              }}
              className="font-medium text-slate-600 hover:text-sky-700 hover:underline underline-offset-2"
            >
              Yönetici Girişi (wp-admin)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
