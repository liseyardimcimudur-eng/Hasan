import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import JSZip from 'jszip';
import { build as viteBuild, createServer as createViteServer } from 'vite';
import {
  DEFAULT_CMS_STATE,
  type CmsPage,
  type CmsPolymerGrade,
  type CmsQuoteRecord,
  type CmsSectorReference,
  type CmsSiteSettings,
  type CmsState,
  type QuoteStatus,
} from './src/data/defaultCmsState.ts';
import { shouldIncludeProjectPath } from './src/utils/projectExport.ts';
import {
  buildQuoteSummary,
  hasValidationErrors,
  validateQuoteForm,
} from './src/utils/validation.ts';
import { generateWordPressThemeFiles } from './src/utils/wpThemeGenerator.ts';

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'wp-store.json');

const ADMIN_USERNAME = process.env.WP_ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.WP_ADMIN_PASSWORD || 'anb2026';

const activeTokens = new Map<string, { username: string; createdAt: number }>();

function loadCmsState(): CmsState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
      fs.writeFileSync(STORE_PATH, JSON.stringify(DEFAULT_CMS_STATE, null, 2), 'utf-8');
      return structuredClone(DEFAULT_CMS_STATE);
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as CmsState;
    return {
      settings: { ...DEFAULT_CMS_STATE.settings, ...(parsed.settings || {}) },
      pages: Array.isArray(parsed.pages) ? parsed.pages : DEFAULT_CMS_STATE.pages,
      grades: Array.isArray(parsed.grades) ? parsed.grades : DEFAULT_CMS_STATE.grades,
      sectors: Array.isArray(parsed.sectors) ? parsed.sectors : DEFAULT_CMS_STATE.sectors,
      quotes: Array.isArray(parsed.quotes) ? parsed.quotes : DEFAULT_CMS_STATE.quotes,
    };
  } catch {
    return structuredClone(DEFAULT_CMS_STATE);
  }
}

function saveCmsState(state: CmsState): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), 'utf-8');
}

function getTokenFromHeader(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return null;
  }
  return auth.slice('Bearer '.length).trim();
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = getTokenFromHeader(req);
  if (!token || !activeTokens.has(token)) {
    res.status(401).json({ error: 'Yönetici oturumu gerekli.' });
    return;
  }
  next();
}

function normalizeSlug(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed || trimmed === '/') {
    return '/';
  }
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\s+/g, '-').replace(/\/+$/, '') || '/';
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  let cmsState = loadCmsState();

  // Auth routes
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: 'Kullanıcı adı veya parola hatalı.' });
      return;
    }

    const token = crypto.randomBytes(24).toString('hex');
    activeTokens.set(token, { username, createdAt: Date.now() });
    res.json({ token, username });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const token = getTokenFromHeader(req);
    const session = token ? activeTokens.get(token) : undefined;
    if (!session) {
      res.status(401).json({ authenticated: false });
      return;
    }
    res.json({ authenticated: true, username: session.username });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const token = getTokenFromHeader(req);
    if (token) {
      activeTokens.delete(token);
    }
    res.json({ ok: true });
  });

  // Public CMS read endpoint (quotes omitted for unauthenticated callers)
  app.get('/api/cms', (req: Request, res: Response) => {
    const token = getTokenFromHeader(req);
    const isAdmin = Boolean(token && activeTokens.has(token));

    res.json({
      settings: cmsState.settings,
      pages: cmsState.pages,
      grades: cmsState.grades,
      sectors: cmsState.sectors,
      quotes: isAdmin ? cmsState.quotes : [],
    });
  });

  // Public B2B Quote Submission
  app.post('/api/quotes', (req: Request, res: Response) => {
    const input = {
      companyOrName: String(req.body?.companyOrName || ''),
      email: String(req.body?.email || ''),
      phone: String(req.body?.phone || ''),
      gradeId: String(req.body?.gradeId || ''),
      tonnage: String(req.body?.tonnage || ''),
      notes: String(req.body?.notes || ''),
    };

    const errors = validateQuoteForm(input);
    if (hasValidationErrors(errors)) {
      res.status(400).json({ error: 'Form alanları eksik veya geçersiz.', errors });
      return;
    }

    const summary = buildQuoteSummary(input, cmsState.quotes.length + 1);
    const grade = cmsState.grades.find((g) => g.id === input.gradeId);

    const record: CmsQuoteRecord = {
      id: `quote-${Date.now()}`,
      referenceCode: summary.referenceCode,
      companyOrName: summary.companyOrName,
      email: summary.email,
      phone: summary.phone,
      gradeId: summary.gradeId,
      gradeTitle: grade?.title ?? summary.gradeId,
      tonnageNumber: summary.tonnageNumber,
      notes: summary.notes,
      status: 'Yeni',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    cmsState = {
      ...cmsState,
      quotes: [record, ...cmsState.quotes],
    };
    saveCmsState(cmsState);

    res.status(201).json({ summary, quote: record });
  });

  // Admin: Settings
  app.put('/api/cms/settings', requireAdmin, (req: Request, res: Response) => {
    const incoming = req.body as Partial<CmsSiteSettings>;
    if (!incoming.brandName?.trim() || !incoming.legalName?.trim()) {
      res.status(400).json({ error: 'Marka adı ve ticari unvan boş bırakılamaz.' });
      return;
    }

    cmsState = {
      ...cmsState,
      settings: {
        ...cmsState.settings,
        ...incoming,
        brandName: incoming.brandName.trim(),
        legalName: incoming.legalName.trim(),
      },
    };
    saveCmsState(cmsState);
    res.json({ settings: cmsState.settings });
  });

  // Admin: Pages CRUD
  app.post('/api/cms/pages', requireAdmin, (req: Request, res: Response) => {
    const body = req.body as Partial<CmsPage>;
    if (!body.title?.trim() || !body.slug?.trim()) {
      res.status(400).json({ error: 'Sayfa başlığı ve URL yolu zorunludur.' });
      return;
    }

    const slug = normalizeSlug(body.slug);
    if (cmsState.pages.some((p) => p.slug === slug)) {
      res.status(409).json({ error: 'Bu URL yoluna sahip bir sayfa zaten var.' });
      return;
    }

    const newPage: CmsPage = {
      id: `page-${Date.now()}`,
      slug,
      title: body.title.trim(),
      navLabel: (body.navLabel || body.title).trim(),
      status: body.status === 'draft' ? 'draft' : 'published',
      showInNav: body.showInNav ?? true,
      order: cmsState.pages.length + 1,
      kicker: (body.kicker || '').trim(),
      lead: (body.lead || body.title).trim(),
      body: (body.body || '').trim(),
      sections: {
        showHero: Boolean(body.sections?.showHero),
        showCatalog: Boolean(body.sections?.showCatalog),
        showAbout: Boolean(body.sections?.showAbout),
        showSectors: Boolean(body.sections?.showSectors),
        showQuoteForm: body.sections?.showQuoteForm ?? true,
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    cmsState = { ...cmsState, pages: [...cmsState.pages, newPage] };
    saveCmsState(cmsState);
    res.status(201).json({ page: newPage });
  });

  app.put('/api/cms/pages/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const existing = cmsState.pages.find((p) => p.id === id);
    if (!existing) {
      res.status(404).json({ error: 'Sayfa bulunamadı.' });
      return;
    }

    const body = req.body as Partial<CmsPage>;
    const slug = existing.slug === '/' ? '/' : normalizeSlug(body.slug || existing.slug);

    if (cmsState.pages.some((p) => p.id !== id && p.slug === slug)) {
      res.status(409).json({ error: 'Bu URL yolu başka bir sayfada kullanılıyor.' });
      return;
    }

    const updated: CmsPage = {
      ...existing,
      ...body,
      id: existing.id,
      slug,
      title: (body.title ?? existing.title).trim(),
      navLabel: (body.navLabel ?? existing.navLabel).trim(),
      kicker: (body.kicker ?? existing.kicker).trim(),
      lead: (body.lead ?? existing.lead).trim(),
      body: (body.body ?? existing.body).trim(),
      sections: {
        ...existing.sections,
        ...(body.sections || {}),
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    cmsState = {
      ...cmsState,
      pages: cmsState.pages.map((p) => (p.id === id ? updated : p)),
    };
    saveCmsState(cmsState);
    res.json({ page: updated });
  });

  app.delete('/api/cms/pages/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const target = cmsState.pages.find((p) => p.id === id);
    if (!target) {
      res.status(404).json({ error: 'Sayfa bulunamadı.' });
      return;
    }
    if (target.slug === '/') {
      res.status(400).json({ error: 'Ana sayfa silinemez.' });
      return;
    }

    cmsState = {
      ...cmsState,
      pages: cmsState.pages.filter((p) => p.id !== id),
    };
    saveCmsState(cmsState);
    res.json({ ok: true });
  });

  // Admin: Polymer Grades CRUD
  app.post('/api/cms/grades', requireAdmin, (req: Request, res: Response) => {
    const body = req.body as Partial<CmsPolymerGrade>;
    if (!body.title?.trim() || !body.mfiRange?.trim()) {
      res.status(400).json({ error: 'Ürün başlığı ve MFI değeri zorunludur.' });
      return;
    }

    const family = body.family === 'AYPE' ? 'AYPE' : 'YYPE';
    const newGrade: CmsPolymerGrade = {
      id: `grade-${Date.now()}`,
      family,
      familyFullName:
        family === 'YYPE'
          ? 'Yüksek Yoğunluklu Polietilen'
          : 'Alçak Yoğunluklu Polietilen',
      familyEnglishName: family === 'YYPE' ? 'HDPE' : 'LDPE',
      process: body.process || 'Enjeksiyonluk',
      title: body.title.trim(),
      mfiRange: body.mfiRange.trim(),
      testCondition: (body.testCondition || '190°C / 2.16 kg').trim(),
      summary: (body.summary || '').trim(),
      applications: Array.isArray(body.applications)
        ? body.applications.filter(Boolean)
        : [],
      standards: body.standards?.trim() || undefined,
      status: body.status === 'draft' ? 'draft' : 'published',
    };

    cmsState = { ...cmsState, grades: [...cmsState.grades, newGrade] };
    saveCmsState(cmsState);
    res.status(201).json({ grade: newGrade });
  });

  app.put('/api/cms/grades/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const existing = cmsState.grades.find((g) => g.id === id);
    if (!existing) {
      res.status(404).json({ error: 'Ürün grubu bulunamadı.' });
      return;
    }

    const body = req.body as Partial<CmsPolymerGrade>;
    const family = body.family ?? existing.family;
    const updated: CmsPolymerGrade = {
      ...existing,
      ...body,
      id: existing.id,
      family,
      familyFullName:
        family === 'YYPE'
          ? 'Yüksek Yoğunluklu Polietilen'
          : 'Alçak Yoğunluklu Polietilen',
      familyEnglishName: family === 'YYPE' ? 'HDPE' : 'LDPE',
      title: (body.title ?? existing.title).trim(),
      mfiRange: (body.mfiRange ?? existing.mfiRange).trim(),
      summary: (body.summary ?? existing.summary).trim(),
      applications: Array.isArray(body.applications)
        ? body.applications.filter(Boolean)
        : existing.applications,
    };

    cmsState = {
      ...cmsState,
      grades: cmsState.grades.map((g) => (g.id === id ? updated : g)),
    };
    saveCmsState(cmsState);
    res.json({ grade: updated });
  });

  app.delete('/api/cms/grades/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    cmsState = {
      ...cmsState,
      grades: cmsState.grades.filter((g) => g.id !== id),
    };
    saveCmsState(cmsState);
    res.json({ ok: true });
  });

  // Admin: Sectors CRUD
  app.post('/api/cms/sectors', requireAdmin, (req: Request, res: Response) => {
    const body = req.body as Partial<CmsSectorReference>;
    if (!body.sector?.trim()) {
      res.status(400).json({ error: 'Sektör adı zorunludur.' });
      return;
    }

    const item: CmsSectorReference = {
      id: `sec-${Date.now()}`,
      sector: body.sector.trim(),
      polymers: (body.polymers || '').trim(),
      applications: (body.applications || '').trim(),
      benchmark: (body.benchmark || '').trim(),
    };

    cmsState = { ...cmsState, sectors: [...cmsState.sectors, item] };
    saveCmsState(cmsState);
    res.status(201).json({ sector: item });
  });

  app.put('/api/cms/sectors/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const existing = cmsState.sectors.find((s) => s.id === id);
    if (!existing) {
      res.status(404).json({ error: 'Sektör kaydı bulunamadı.' });
      return;
    }

    const body = req.body as Partial<CmsSectorReference>;
    const updated: CmsSectorReference = {
      ...existing,
      ...body,
      id: existing.id,
      sector: (body.sector ?? existing.sector).trim(),
    };

    cmsState = {
      ...cmsState,
      sectors: cmsState.sectors.map((s) => (s.id === id ? updated : s)),
    };
    saveCmsState(cmsState);
    res.json({ sector: updated });
  });

  app.delete('/api/cms/sectors/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    cmsState = {
      ...cmsState,
      sectors: cmsState.sectors.filter((s) => s.id !== id),
    };
    saveCmsState(cmsState);
    res.json({ ok: true });
  });

  // Admin: Quotes Inbox management
  app.patch('/api/cms/quotes/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const status = req.body?.status as QuoteStatus | undefined;
    if (!status || !['Yeni', 'İnceleniyor', 'Teklif İletildi'].includes(status)) {
      res.status(400).json({ error: 'Geçersiz teklif durumu.' });
      return;
    }

    cmsState = {
      ...cmsState,
      quotes: cmsState.quotes.map((q) => (q.id === id ? { ...q, status } : q)),
    };
    saveCmsState(cmsState);
    res.json({ ok: true });
  });

  app.delete('/api/cms/quotes/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    cmsState = {
      ...cmsState,
      quotes: cmsState.quotes.filter((q) => q.id !== id),
    };
    saveCmsState(cmsState);
    res.json({ ok: true });
  });

  // Admin: Download all prepared project files + generated WordPress theme as a single ZIP
  app.get('/api/export/project-zip', requireAdmin, async (_req: Request, res: Response) => {
    try {
      const rootDir = process.cwd();
      const zip = new JSZip();

      const walkDir = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
          if (!shouldIncludeProjectPath(relPath)) continue;

          if (entry.isDirectory()) {
            walkDir(fullPath);
          } else if (entry.isFile()) {
            const content = fs.readFileSync(fullPath);
            zip.file(relPath, content);
          }
        }
      };

      walkDir(rootDir);

      // Include generated WordPress PHP theme folder inside the archive as well
      const wpFiles = generateWordPressThemeFiles(cmsState);
      for (const wpFile of wpFiles) {
        zip.file(`wordpress-theme/anb-plastik/${wpFile.filename}`, wpFile.content);
      }

      zip.file(
        'KURULUM-REHBERI.txt',
        [
          'ANB PLASTIK — KURULUM VE YAYINLAMA REHBERI',
          '==========================================',
          '',
          '1) WORDPRESS SITESINE KURULUM:',
          '   - Panelden "WordPress Temasini Indir (.zip)" dugmesiyle indirilen anb-plastik-wp-tema.zip',
          '     dosyasini WordPress Admin > Gorunum > Temalar > Yeni Ekle > Tema Yukle kismindan yukleyin.',
          '   - Veya bu arsivdeki wordpress-theme/anb-plastik/ klasorunu wp-content/themes/ altina atin.',
          '',
          '2) CPANEL / FTP STATIK HOSTING (public_html) ICIN:',
          '   - Kok dizindeki index.html ve src/*.tsx dosyalari tarayicida dogrudan calismaz!',
          '   - Panelden "Statik Hosting Paketi (.zip)" dugmesini kullanarak derlenmis dist/',
          '     dosyalarini (anb-plastik-statik-site.zip) indirin ve public_html klasorune cikarin.',
          '',
          '3) NODE.JS SUNUCUSUNDA TAM CMS OLARAK CALISTIRMA:',
          '   - npm install',
          '   - npm run build',
          '   - npm start',
        ].join('\n'),
      );

      const buffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="anb-plastik-tum-dosyalar.zip"',
      );
      res.setHeader('Content-Length', String(buffer.length));
      res.send(buffer);
    } catch {
      res.status(500).json({ error: 'Proje arşivi oluşturulamadı.' });
    }
  });

  // Admin: Build (if needed) and download compiled static site (dist/) for cPanel/FTP public_html
  app.get('/api/export/static-zip', requireAdmin, async (_req: Request, res: Response) => {
    try {
      const distDir = path.resolve(process.cwd(), 'dist');
      if (!fs.existsSync(path.join(distDir, 'index.html'))) {
        await viteBuild({ logLevel: 'silent' });
      }

      const zip = new JSZip();
      const walkDist = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relPath = path.relative(distDir, fullPath).replace(/\\/g, '/');
          if (entry.isDirectory()) {
            walkDist(fullPath);
          } else if (entry.isFile()) {
            zip.file(relPath, fs.readFileSync(fullPath));
          }
        }
      };

      walkDist(distDir);

      // Add Apache .htaccess so SPA routes (/hakkimizda, /urunlerimiz, /drive) work cleanly on cPanel
      zip.file(
        '.htaccess',
        [
          '<IfModule mod_rewrite.c>',
          '  RewriteEngine On',
          '  RewriteBase /',
          '  RewriteRule ^index\\.html$ - [L]',
          '  RewriteCond %{REQUEST_FILENAME} !-f',
          '  RewriteCond %{REQUEST_FILENAME} !-d',
          '  RewriteRule . /index.html [L]',
          '</IfModule>',
        ].join('\n'),
      );

      const buffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="anb-plastik-statik-site.zip"',
      );
      res.setHeader('Content-Length', String(buffer.length));
      res.send(buffer);
    } catch {
      res.status(500).json({ error: 'Statik site paketi oluşturulamadı.' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ANB Plastik CMS server listening on http://localhost:${PORT}`);
  });
}

startServer();
