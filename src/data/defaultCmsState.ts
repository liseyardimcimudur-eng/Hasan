export type PolymerFamily = 'YYPE' | 'AYPE';

export type ProcessMethod =
  | 'Enjeksiyonluk'
  | 'Şişirmelik'
  | 'Filmlik'
  | 'Boruluk'
  | 'Rafyalık';

export type PublishStatus = 'published' | 'draft';

export type QuoteStatus = 'Yeni' | 'İnceleniyor' | 'Teklif İletildi';

export interface CmsPolymerGrade {
  id: string;
  family: PolymerFamily;
  familyFullName: string;
  familyEnglishName: string;
  process: ProcessMethod;
  title: string;
  mfiRange: string;
  testCondition: string;
  summary: string;
  applications: string[];
  standards?: string;
  status: PublishStatus;
}

export interface CmsPageSections {
  showHero: boolean;
  showCatalog: boolean;
  showAbout: boolean;
  showSectors: boolean;
  showQuoteForm: boolean;
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  navLabel: string;
  status: PublishStatus;
  showInNav: boolean;
  order: number;
  kicker: string;
  lead: string;
  body: string;
  sections: CmsPageSections;
  updatedAt: string;
}

export interface CmsSectorReference {
  id: string;
  sector: string;
  polymers: string;
  applications: string;
  benchmark: string;
}

export interface CmsQuoteRecord {
  id: string;
  referenceCode: string;
  companyOrName: string;
  email: string;
  phone: string;
  gradeId: string;
  gradeTitle: string;
  tonnageNumber: number;
  notes: string;
  status: QuoteStatus;
  createdAt: string;
}

export interface CmsSiteSettings {
  brandName: string;
  legalName: string;
  slogan: string;
  district: string;
  domain: string;
  email: string;
  phone: string;
  workingHours: string;
  heroHeadline: string;
  heroSubtext: string;
  heroCtaLabel: string;
}

export interface CmsState {
  settings: CmsSiteSettings;
  pages: CmsPage[];
  grades: CmsPolymerGrade[];
  sectors: CmsSectorReference[];
  quotes: CmsQuoteRecord[];
}

export const DEFAULT_CMS_STATE: CmsState = {
  settings: {
    brandName: 'ANB Plastik',
    legalName: 'ANB Plastik İç ve Dış Ticaret Limited Şirketi',
    slogan: 'Plastik adına her şey',
    district: 'Başakşehir, İstanbul',
    domain: 'anbplastik.com',
    email: 'info@anbplastik.com',
    phone: '+90 (212) 000 00 00',
    workingHours: 'Pazartesi – Cuma: 08:30 – 18:00',
    heroHeadline:
      'Endüstriyel Polietilen Hammadde Tedarikinde Güvenilir Çözüm Ortağınız',
    heroSubtext:
      'ANB Plastik İç ve Dış Ticaret Limited Şirketi; film, basınçlı boru, şişirme, enjeksiyon ve rafya üretim hatları için yüksek ve alçak yoğunluklu polietilen (YYPE / AYPE) hammaddelerini doğru erime indeksi ve planlı sevkiyat ile sunar.',
    heroCtaLabel: 'Hammadde Teklifi Al',
  },
  pages: [
    {
      id: 'page-home',
      slug: '/',
      title: 'Ana Sayfa',
      navLabel: 'Ana Sayfa',
      status: 'published',
      showInNav: true,
      order: 1,
      kicker: 'Plastik adına her şey · Başakşehir, İstanbul',
      lead: 'Endüstriyel Polietilen Hammadde Tedarikinde Güvenilir Çözüm Ortağınız',
      body: 'YYPE (HDPE) ve AYPE (LDPE) polietilen hammadde gruplarında kesintisiz tedarik, teknik MFI eşleştirme ve İstanbul merkezli hızlı sevkiyat.',
      sections: {
        showHero: true,
        showCatalog: true,
        showAbout: true,
        showSectors: true,
        showQuoteForm: true,
      },
      updatedAt: '2026-11-18',
    },
    {
      id: 'page-about',
      slug: '/hakkimizda',
      title: 'Hakkımızda',
      navLabel: 'Hakkımızda',
      status: 'published',
      showInNav: true,
      order: 2,
      kicker: 'Kurumsal Yapı · Başakşehir, İstanbul',
      lead: 'Üretim Hatları İçin Planlı ve Süreklilik Odaklı Hammadde Tedariği',
      body: 'ANB Plastik İç ve Dış Ticaret Limited Şirketi, Türkiye’nin plastik sanayi kümelenme merkezi Başakşehir / İstanbul’dan yurt içi üreticilere yüksek ve alçak yoğunluklu polietilen hammaddeleri tedarik etmektedir. Ambalaj filminden basınçlı altyapı borularına, tarımsal sera örtülerinden endüstriyel enjeksiyon kalıplamaya kadar her proseste makine parkurunuzla uyumlu erime akış değerlerini sunuyoruz.',
      sections: {
        showHero: false,
        showCatalog: false,
        showAbout: true,
        showSectors: true,
        showQuoteForm: true,
      },
      updatedAt: '2026-11-18',
    },
    {
      id: 'page-products',
      slug: '/urunlerimiz',
      title: 'Ürünlerimiz',
      navLabel: 'Ürünlerimiz',
      status: 'published',
      showInNav: true,
      order: 3,
      kicker: 'Ürün Kataloğu · Teknik Erime İndeksi Rehberi',
      lead: 'YYPE ve AYPE Polietilen Ürün Grupları',
      body: 'Üretim yönteminize ve hedef uygulama alanınıza göre erime akış indeksi (MFI) değerlerini filtreleyin, teknik detayları inceleyin ve doğrudan teklif talebine ekleyin.',
      sections: {
        showHero: false,
        showCatalog: true,
        showAbout: false,
        showSectors: false,
        showQuoteForm: true,
      },
      updatedAt: '2026-11-18',
    },
    {
      id: 'page-references',
      slug: '/referanslarimiz',
      title: 'Referanslarımız',
      navLabel: 'Referanslarımız',
      status: 'published',
      showInNav: true,
      order: 4,
      kicker: 'Sektörel Çözümler & Referans Yapısı',
      lead: 'Farklı İmalat Disiplinlerine Özel Polimer Çözümleri',
      body: 'Ekstrüzyon, şişirme ve enjeksiyon tesislerinin spesifik MFI, yoğunluk ve termal dayanım beklentilerine uygun hammadde tedarik ediyoruz.',
      sections: {
        showHero: false,
        showCatalog: false,
        showAbout: true,
        showSectors: true,
        showQuoteForm: true,
      },
      updatedAt: '2026-11-18',
    },
    {
      id: 'page-contact',
      slug: '/iletisim',
      title: 'İletişim',
      navLabel: 'İletişim',
      status: 'published',
      showInNav: true,
      order: 5,
      kicker: 'İletişim ve Hammadde Teklifi',
      lead: 'Kurumsal Teklif ve Numune Talebi Oluşturun',
      body: 'İhtiyaç duyduğunuz YYPE veya AYPE sınıfını, tahmini tonajınızı ve teslimat ilini paylaşın; satış ekibimiz güncel stok ve fiyat teklifi ile dönüş yapsın.',
      sections: {
        showHero: false,
        showCatalog: false,
        showAbout: false,
        showSectors: false,
        showQuoteForm: true,
      },
      updatedAt: '2026-11-18',
    },
  ],
  grades: [
    {
      id: 'yype-enjeksiyonluk',
      family: 'YYPE',
      familyFullName: 'Yüksek Yoğunluklu Polietilen',
      familyEnglishName: 'HDPE',
      process: 'Enjeksiyonluk',
      title: 'YYPE Enjeksiyonluk Seri',
      mfiRange: '1 – 20 g/10dk',
      testCondition: '190°C / 2.16 kg',
      summary:
        'Yüksek darbe dayanımı ve boyutsal kararlılık gerektiren kalıplama hatları için optimize edilmiş akışkanlık profili.',
      applications: ['Kapak', 'Kasa', 'Plastik Palet', 'Oyuncak'],
      status: 'published',
    },
    {
      id: 'yype-sisirmelik',
      family: 'YYPE',
      familyFullName: 'Yüksek Yoğunluklu Polietilen',
      familyEnglishName: 'HDPE',
      process: 'Şişirmelik',
      title: 'YYPE Şişirmelik Seri',
      mfiRange: '0.2 – 0.7 g/10dk',
      testCondition: '190°C / 2.16 kg',
      summary:
        'Çevresel stres çatlamasına (ESCR) ve kimyasal etkilere karşı dirençli, homojen cidar dağılımı sağlayan şişirme kaliteleri.',
      applications: ['Bidon', 'Şişe', 'Kavanoz', 'Oyuncak'],
      status: 'published',
    },
    {
      id: 'yype-filmlik',
      family: 'YYPE',
      familyFullName: 'Yüksek Yoğunluklu Polietilen',
      familyEnglishName: 'HDPE',
      process: 'Filmlik',
      title: 'YYPE Filmlik Seri',
      mfiRange: '0.02 – 0.07 g/10dk',
      testCondition: '190°C / 2.16 kg',
      summary:
        'Düşük mikron kalınlıklarında dahi yüksek yırtılma ve çekme mukavemeti sunan yüksek moleküler ağırlıklı film hammaddesi.',
      applications: ['Atlet Tipi Poşet', 'Hışır Poşet', 'Taşıma Poşetleri'],
      status: 'published',
    },
    {
      id: 'yype-boruluk',
      family: 'YYPE',
      familyFullName: 'Yüksek Yoğunluklu Polietilen',
      familyEnglishName: 'HDPE',
      process: 'Boruluk',
      title: 'YYPE Boruluk Seri (PE63 – PE80 – PE100)',
      mfiRange: '0.03 – 0.07 g/10dk',
      testCondition: '190°C / 2.16 kg',
      standards: 'PE63 · PE80 · PE100',
      summary:
        'Uzun ömürlü hidrostatik basınç dayanımı gerektiren şehir şebekesi, doğalgaz ve altyapı boru hatları için sertifikalı sınıflar.',
      applications: [
        'Basınçlı Temiz Su Borusu',
        'Korige Kanalizasyon Borusu',
        'Gaz Borusu',
        'Telekomünikasyon Kablo Muhafaza Borusu',
        'Yağmurlama Borusu',
      ],
      status: 'published',
    },
    {
      id: 'yype-rafyalik',
      family: 'YYPE',
      familyFullName: 'Yüksek Yoğunluklu Polietilen',
      familyEnglishName: 'HDPE',
      process: 'Rafyalık',
      title: 'YYPE Rafyalık Seri',
      mfiRange: '0.7 – 0.9 g/10dk',
      testCondition: '190°C / 2.16 kg',
      summary:
        'Örgü ve gerdirme hatlarında kopma direnci yüksek, dengeli çekim performansı sağlayan rafya ve file iplik hammaddesi.',
      applications: ['File Çuval', 'Örgülü Tarım Filesi', 'Endüstriyel Şerit'],
      status: 'published',
    },
    {
      id: 'aype-filmlik',
      family: 'AYPE',
      familyFullName: 'Alçak Yoğunluklu Polietilen',
      familyEnglishName: 'LDPE',
      process: 'Filmlik',
      title: 'AYPE Filmlik ve Ekstrüzyon Serisi',
      mfiRange: '0.3 – 7 g/10dk',
      testCondition: '190°C / 2.16 kg',
      summary:
        'Yüksek optik şeffaflık, ısıl yapışma gücü ve esneklik gerektiren ambalaj, tarım ve laminasyon hatları için genel ve özel film kaliteleri.',
      applications: [
        'Shrink Film',
        'Sera Örtüsü',
        'Naylon Torba',
        'Taşıma Çantaları',
        'Ambalaj Filmleri',
        'Peçete Torbası',
        'Yüzey Kaplama',
        'Damlama Borusu',
        'Laminasyon',
      ],
      status: 'published',
    },
    {
      id: 'aype-enjeksiyonluk',
      family: 'AYPE',
      familyFullName: 'Alçak Yoğunluklu Polietilen',
      familyEnglishName: 'LDPE',
      process: 'Enjeksiyonluk',
      title: 'AYPE Enjeksiyonluk ve Masterbatch Serisi',
      mfiRange: '10 – 20 – 70 g/10dk',
      testCondition: '190°C / 2.16 kg',
      summary:
        'Kalıp dolum hızı yüksek, esnek kapak ve ev eşyası üretimi ile konsantre renk/katkı taşıyıcı (masterbatch) formülasyonları için.',
      applications: [
        'Mutfak Eşyası',
        'Esnek Kapak',
        'Masterbatch (Konsantre Boya)',
      ],
      status: 'published',
    },
  ],
  sectors: [
    {
      id: 'sec-ambalaj',
      sector: 'Esnek Ambalaj ve Film Üreticileri',
      polymers: 'AYPE Filmlik (0,3–7) · YYPE Filmlik (0,02–0,07)',
      applications:
        'Shrink rulo, atlet ve hışır poşet, peçete torbası, laminasyon filmleri',
      benchmark: '25 kg çuval & BigBag stoktan sevkiyat',
    },
    {
      id: 'sec-boru',
      sector: 'Altyapı ve Basınçlı Boru Sistemleri',
      polymers: 'YYPE Boruluk PE63 · PE80 · PE100 (0,03–0,07)',
      applications:
        'Temiz su, doğalgaz, korige kanalizasyon ve telekom muhafaza boruları',
      benchmark: 'Uzun dönem hidrostatik basınç uyumu',
    },
    {
      id: 'sec-tarim',
      sector: 'Tarım ve Sulama Teknolojileri',
      polymers: 'AYPE Filmlik · YYPE Rafyalık (0,7–0,9)',
      applications:
        'UV katkılı sera örtüleri, damlama sulama boruları, file çuval üretimi',
      benchmark: 'Sezon öncesi yüksek tonajlı tedarik planı',
    },
    {
      id: 'sec-enjeksiyon',
      sector: 'Enjeksiyon, Kapak ve Masterbatch',
      polymers: 'YYPE Enjeksiyon (1–20) · AYPE Enjeksiyon (10–70)',
      applications:
        'Gıda kapakları, endüstriyel kasalar, paletler, mutfak eşyaları ve konsantre boya',
      benchmark: 'Tutarlı MFI partisi ile düşük fire oranı',
    },
  ],
  quotes: [
    {
      id: 'quote-seed-1',
      referenceCode: 'ANB-2026-1001',
      companyOrName: 'Trakya Altyapı Boru San. A.Ş.',
      email: 'satinalma@trakyaboru.example',
      phone: '0212 555 41 20',
      gradeId: 'yype-boruluk',
      gradeTitle: 'YYPE Boruluk Seri (PE63 – PE80 – PE100)',
      tonnageNumber: 48,
      notes: 'PE100 siyah kompaund, 2 tır Başakşehir teslim.',
      status: 'Teklif İletildi',
      createdAt: '2026-11-17',
    },
    {
      id: 'quote-seed-2',
      referenceCode: 'ANB-2026-1002',
      companyOrName: 'Ege Sera ve Ambalaj Ltd. Şti.',
      email: 'planlama@egesera.example',
      phone: '0232 555 88 14',
      gradeId: 'aype-filmlik',
      gradeTitle: 'AYPE Filmlik ve Ekstrüzyon Serisi',
      tonnageNumber: 24,
      notes: 'UV katkılı sera örtüsü için MFI 0.3–1.0 aralığı.',
      status: 'Yeni',
      createdAt: '2026-11-18',
    },
  ],
};
