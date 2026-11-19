import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_CMS_STATE,
  type CmsPolymerGrade,
  type CmsState,
} from './data/defaultCmsState';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PageBanner } from './components/PageBanner';
import { ProductCatalog } from './components/ProductCatalog';
import { AboutCapabilities } from './components/AboutCapabilities';
import { SectorsReferences } from './components/SectorsReferences';
import { QuoteContactSection } from './components/QuoteContactSection';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard, type AdminTab } from './components/admin/AdminDashboard';
import { GoogleDriveManager } from './components/admin/GoogleDriveManager';

const TOKEN_STORAGE_KEY = 'anb_wp_admin_token';
const USER_STORAGE_KEY = 'anb_wp_admin_user';

export default function App() {
  const [cms, setCms] = useState<CmsState>(DEFAULT_CMS_STATE);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const p = window.location.pathname;
    return p === '/' ? '/' : p.replace(/\/+$/, '') || '/';
  });

  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const [adminUser, setAdminUser] = useState<string>(
    () => localStorage.getItem(USER_STORAGE_KEY) || '',
  );
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [editPageId, setEditPageId] = useState<string | undefined>(undefined);

  const [selectedGradeId, setSelectedGradeId] = useState<string>(DEFAULT_CMS_STATE.grades[0].id);
  const [highlightedGradeId, setHighlightedGradeId] = useState<string>('');
  const [preselectedNote, setPreselectedNote] = useState<string>('');

  const fetchCms = useCallback(async (authToken = token) => {
    try {
      const headers: Record<string, string> = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      const res = await fetch('/api/cms', { headers });
      if (res.ok) {
        const data = (await res.json()) as CmsState;
        setCms(data);
      }
    } catch {
      // Fall back cleanly to current state if offline
    }
  }, [token]);

  useEffect(() => {
    fetchCms(token);
  }, [fetchCms, token]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          setToken('');
          setAdminUser('');
        }
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    const onPopState = () => {
      const p = window.location.pathname;
      setCurrentPath(p === '/' ? '/' : p.replace(/\/+$/, '') || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (slug: string) => {
    const normalized = slug === '/' ? '/' : slug.startsWith('/') ? slug : `/${slug}`;
    if (window.location.pathname !== normalized) {
      window.history.pushState({}, '', normalized);
    }
    setCurrentPath(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = async (newToken: string, username: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    localStorage.setItem(USER_STORAGE_KEY, username);
    setToken(newToken);
    setAdminUser(username);
    await fetchCms(newToken);
    setAdminTab('dashboard');
    navigate('/wp-admin');
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken('');
    setAdminUser('');
    if (currentPath.startsWith('/wp-admin') || currentPath === '/wp-login') {
      navigate('/');
    }
  };

  const openAdmin = (tab: string = 'dashboard', pageId?: string) => {
    setAdminTab((tab as AdminTab) || 'dashboard');
    setEditPageId(pageId);
    navigate('/wp-admin');
  };

  const scrollToQuote = () => {
    const el = document.getElementById('teklif');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate('/iletisim');
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('urunler');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate('/urunlerimiz');
  };

  const handleSelectGradeForQuote = (grade: CmsPolymerGrade) => {
    setSelectedGradeId(grade.id);
    setHighlightedGradeId(grade.id);
    setPreselectedNote(
      `${grade.title} (${grade.mfiRange}) hakkında fiyat ve stok bilgisi talep ediyorum.`,
    );
    scrollToQuote();
  };

  const handleSelectSectorQuote = (sectorName: string) => {
    setPreselectedNote(
      `${sectorName} uygulamalarımız için uygun polietilen sınıfı ve teklif bilgisi rica ederim.`,
    );
    scrollToQuote();
  };

  const isAdmin = Boolean(token);

  // Admin Login / Dashboard Routes
  if (currentPath === '/wp-login' || currentPath === '/wp-admin') {
    if (!isAdmin) {
      return (
        <AdminLogin
          brandName={cms.settings.brandName}
          onLoginSuccess={handleLoginSuccess}
          onBackToSite={() => navigate('/')}
        />
      );
    }

    return (
      <AdminDashboard
        cms={cms}
        token={token}
        adminUsername={adminUser || 'admin'}
        initialTab={adminTab}
        initialEditPageId={editPageId}
        onRefreshCms={() => fetchCms(token)}
        onVisitSite={(slug = '/') => navigate(slug)}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPath === '/drive') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar
          settings={cms.settings}
          pages={cms.pages}
          currentPath="/drive"
          isAdmin={isAdmin}
          adminUsername={adminUser}
          onNavigate={navigate}
          onRequestQuote={() => navigate('/iletisim')}
          onOpenAdmin={openAdmin}
          onLogout={handleLogout}
        />

        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <GoogleDriveManager cms={cms} mode="portal" />
        </main>

        <Footer
          settings={cms.settings}
          pages={cms.pages}
          onNavigate={navigate}
          onOpenAdminLogin={() => openAdmin('dashboard')}
          onOpenDrivePortal={() => navigate('/drive')}
        />
      </div>
    );
  }

  // Public WordPress Page Lookup
  const activePage =
    cms.pages.find(
      (p) => p.slug === currentPath && (p.status === 'published' || isAdmin),
    ) || cms.pages.find((p) => p.slug === '/');

  const aboutPage = cms.pages.find((p) => p.slug === '/hakkimizda');
  const referencesPage = cms.pages.find((p) => p.slug === '/referanslarimiz');
  const contactPage = cms.pages.find((p) => p.slug === '/iletisim');

  const isHome = !activePage || activePage.slug === '/';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar
        settings={cms.settings}
        pages={cms.pages}
        currentPath={activePage?.slug || '/'}
        isAdmin={isAdmin}
        adminUsername={adminUser}
        activePageId={activePage?.id}
        onNavigate={navigate}
        onRequestQuote={scrollToQuote}
        onOpenAdmin={openAdmin}
        onLogout={handleLogout}
      />

      <main>
        {!isHome && activePage && (
          <PageBanner
            page={activePage}
            isAdmin={isAdmin}
            onEditPage={(pageId) => openAdmin('pages', pageId)}
          />
        )}

        {activePage?.sections.showHero && (
          <HeroSection
            settings={cms.settings}
            onRequestQuote={scrollToQuote}
            onBrowseCatalog={scrollToCatalog}
          />
        )}

        {activePage?.sections.showCatalog && (
          <ProductCatalog
            grades={cms.grades}
            selectedGradeId={highlightedGradeId}
            onSelectGradeForQuote={handleSelectGradeForQuote}
          />
        )}

        {activePage?.sections.showAbout && (
          <AboutCapabilities settings={cms.settings} aboutPage={aboutPage} />
        )}

        {activePage?.sections.showSectors && (
          <SectorsReferences
            sectors={cms.sectors}
            referencesPage={referencesPage}
            onSelectSectorQuote={handleSelectSectorQuote}
          />
        )}

        {activePage?.sections.showQuoteForm && (
          <QuoteContactSection
            settings={cms.settings}
            grades={cms.grades}
            contactPage={contactPage}
            selectedGradeId={selectedGradeId}
            preselectedNote={preselectedNote}
            onGradeChange={setSelectedGradeId}
            onQuoteSubmitted={() => fetchCms(token)}
          />
        )}
      </main>

      <Footer
        settings={cms.settings}
        pages={cms.pages}
        onNavigate={navigate}
        onOpenAdminLogin={() => openAdmin('dashboard')}
        onOpenDrivePortal={() => navigate('/drive')}
      />
    </div>
  );
}
