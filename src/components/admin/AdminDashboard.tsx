import { useState } from 'react';
import {
  Building2,
  Code2,
  ExternalLink,
  FileText,
  HardDrive,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  X,
} from 'lucide-react';
import type { CmsState } from '../../data/defaultCmsState';
import { GoogleDriveManager } from './GoogleDriveManager';
import { PagesManager } from './PagesManager';
import { ProductsManager } from './ProductsManager';
import { QuotesManager, SectorsManager } from './QuotesSectorsManager';
import { SettingsManager, ThemeExportView } from './SettingsThemeExport';

export type AdminTab =
  | 'dashboard'
  | 'pages'
  | 'products'
  | 'sectors'
  | 'quotes'
  | 'drive'
  | 'settings'
  | 'export';

interface AdminDashboardProps {
  cms: CmsState;
  token: string;
  adminUsername: string;
  initialTab?: AdminTab;
  initialEditPageId?: string;
  onRefreshCms: () => Promise<void>;
  onVisitSite: (slug?: string) => void;
  onLogout: () => void;
}

const TAB_ITEMS: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Başlangıç', icon: LayoutDashboard },
  { id: 'pages', label: 'Sayfalar', icon: FileText },
  { id: 'products', label: 'Ürünler (YYPE/AYPE)', icon: Package },
  { id: 'sectors', label: 'Referanslar', icon: Building2 },
  { id: 'quotes', label: 'Teklif Talepleri', icon: Inbox },
  { id: 'drive', label: 'Google Drive', icon: HardDrive },
  { id: 'settings', label: 'Genel Ayarlar', icon: Settings },
  { id: 'export', label: 'WordPress Tema Çıktısı', icon: Code2 },
];

export function AdminDashboard({
  cms,
  token,
  adminUsername,
  initialTab = 'dashboard',
  initialEditPageId,
  onRefreshCms,
  onVisitSite,
  onLogout,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const publishedPagesCount = cms.pages.filter((p) => p.status === 'published').length;
  const activeGradesCount = cms.grades.filter((g) => g.status === 'published').length;
  const pendingQuotesCount = cms.quotes.filter((q) => q.status === 'Yeni').length;

  const activeTabLabel = TAB_ITEMS.find((t) => t.id === activeTab)?.label || 'Başlangıç';

  const selectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-800 bg-slate-900 text-slate-200 lg:flex">
        <div>
          <div className="border-b border-slate-800 px-5 py-4">
            <p className="font-display text-base font-bold tracking-tight text-white">
              {cms.settings.brandName} CMS
            </p>
            <p className="mt-0.5 text-xs text-slate-400">WordPress Yönetim Paneli</p>
          </div>

          <nav aria-label="Yönetici menüsü" className="p-3 space-y-1">
            {TAB_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTab(item.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-sky-700 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.id === 'quotes' && pendingQuotesCount > 0 && (
                    <span className="rounded bg-slate-950 px-1.5 py-0.5 font-mono text-xs text-sky-300 tabular-nums">
                      {pendingQuotesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-800 p-4 text-xs text-slate-400">
          <p className="font-medium text-slate-200">Yönetici: {adminUsername}</p>
          <p className="mt-0.5">{cms.settings.domain}</p>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative z-10 flex w-64 flex-col justify-between bg-slate-900 text-slate-200">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3.5">
                <span className="font-display text-sm font-bold text-white">
                  {cms.settings.brandName} CMS
                </span>
                <button
                  type="button"
                  aria-label="Yönetici menüsünü kapat"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded p-1 text-slate-300 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav aria-label="Mobil yönetici menüsü" className="p-3 space-y-1">
                {TAB_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectTab(item.id)}
                      className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium ${
                        active ? 'bg-sky-700 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 sm:gap-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              aria-label="Yönetici menüsünü aç"
              onClick={() => setMobileNavOpen(true)}
              className="shrink-0 rounded-md border border-slate-200 p-2 text-slate-700 lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0 truncate text-sm text-slate-500">
              <span className="hidden font-medium text-slate-700 sm:inline">
                {cms.settings.brandName}
              </span>
              <span aria-hidden="true" className="mx-2 hidden sm:inline">
                /
              </span>
              <span className="font-semibold text-slate-900">{activeTabLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onVisitSite('/')}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 whitespace-nowrap shrink-0 hover:bg-slate-50 sm:px-3"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Siteyi Görüntüle</span>
              <span className="sm:hidden">Site</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white whitespace-nowrap shrink-0 hover:bg-red-700 sm:px-3"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Çıkış Yap</span>
              <span className="sm:hidden">Çıkış</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="font-display text-2xl font-bold text-slate-900">
                      Hoş Geldiniz, {adminUsername}
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                      {cms.settings.legalName} web sitesindeki tüm sayfaları, YYPE/AYPE ürün
                      kataloğunu ve teklif taleplerini buradan yönetebilirsiniz.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectTab('export')}
                    className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 hover:bg-sky-700"
                  >
                    <Code2 className="h-4 w-4" aria-hidden="true" />
                    <span>Tüm Dosyaları / Tema ZIP İndir</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-5">
                    <p className="text-xs font-medium text-slate-500">Yayımlanan Sayfa</p>
                    <p className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                      {publishedPagesCount} / {cms.pages.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-5">
                    <p className="text-xs font-medium text-slate-500">Aktif Polimer Serisi</p>
                    <p className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                      {activeGradesCount} / {cms.grades.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-5">
                    <p className="text-xs font-medium text-slate-500">Yeni Teklif Talebi</p>
                    <p className="mt-2 font-mono text-2xl font-bold text-sky-700 tabular-nums">
                      {pendingQuotesCount}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-5">
                    <p className="text-xs font-medium text-slate-500">Sektör Referansı</p>
                    <p className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                      {cms.sectors.length}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-7 overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
                      <h2 className="font-display text-sm font-bold text-slate-900">
                        Site Sayfaları Özeti
                      </h2>
                      <button
                        type="button"
                        onClick={() => selectTab('pages')}
                        className="text-xs font-semibold text-sky-700 hover:underline"
                      >
                        Tümünü Yönet
                      </button>
                    </div>
                    <ul className="divide-y divide-slate-200">
                      {cms.pages.map((p) => (
                        <li
                          key={p.id}
                          className="flex items-center justify-between px-5 py-3 text-sm"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">{p.title}</span>
                            <span className="ml-2 font-mono text-xs text-slate-500">{p.slug}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onVisitSite(p.slug)}
                            className="text-xs font-medium text-slate-600 hover:text-sky-700 hover:underline"
                          >
                            Görüntüle
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="lg:col-span-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
                      <h2 className="font-display text-sm font-bold text-slate-900">
                        Son Teklif Talepleri
                      </h2>
                      <button
                        type="button"
                        onClick={() => selectTab('quotes')}
                        className="text-xs font-semibold text-sky-700 hover:underline"
                      >
                        Gelen Kutusu
                      </button>
                    </div>
                    <ul className="divide-y divide-slate-200">
                      {cms.quotes.slice(0, 4).map((q) => (
                        <li key={q.id} className="px-5 py-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">{q.companyOrName}</span>
                            <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
                              {q.tonnageNumber} Ton
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {q.gradeTitle} · {q.status}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pages' && (
              <PagesManager
                pages={cms.pages}
                initialEditPageId={initialEditPageId}
                token={token}
                onRefreshCms={onRefreshCms}
                onPreviewPage={(slug) => onVisitSite(slug)}
              />
            )}

            {activeTab === 'products' && (
              <ProductsManager
                grades={cms.grades}
                token={token}
                onRefreshCms={onRefreshCms}
              />
            )}

            {activeTab === 'sectors' && (
              <SectorsManager
                sectors={cms.sectors}
                token={token}
                onRefreshCms={onRefreshCms}
              />
            )}

            {activeTab === 'quotes' && (
              <QuotesManager
                quotes={cms.quotes}
                token={token}
                onRefreshCms={onRefreshCms}
              />
            )}

            {activeTab === 'drive' && <GoogleDriveManager cms={cms} mode="admin" />}

            {activeTab === 'settings' && (
              <SettingsManager
                settings={cms.settings}
                token={token}
                onRefreshCms={onRefreshCms}
              />
            )}

            {activeTab === 'export' && <ThemeExportView cms={cms} token={token} />}
          </div>
        </main>
      </div>
    </div>
  );
}
