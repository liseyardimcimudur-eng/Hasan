export type PolymerFamily = 'YYPE' | 'AYPE';

export type ProcessMethod =
  | 'Enjeksiyonluk'
  | 'Şişirmelik'
  | 'Filmlik'
  | 'Boruluk'
  | 'Rafyalık';

export interface PolymerGrade {
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
}

export const POLYMER_GRADES: PolymerGrade[] = [
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
  },
];

export const HERO_METRICS = [
  {
    value: '0,02 – 70',
    unit: 'g/10dk',
    label: 'MFI Erime Akış Aralığı (190°C / 2.16 kg)',
  },
  {
    value: 'YYPE & AYPE',
    unit: 'HDPE / LDPE',
    label: 'Çift Polimer Grubu Uzmanlığı',
  },
  {
    value: 'PE63 – PE100',
    unit: 'Altyapı',
    label: 'Basınçlı Boru ve Ekstrüzyon Standartları',
  },
  {
    value: 'Başakşehir',
    unit: 'İstanbul',
    label: 'İkitelli & Marmara Lojistik Dağıtım Merkezi',
  },
];

export const CAPABILITIES = [
  {
    index: '01',
    title: 'Kesintisiz Polimer Tedarik Zinciri',
    description:
      'YYPE (0,02–20 g/10dk) ve AYPE (0,3–70 g/10dk) ürün gruplarında üretim hatlarınızın durmaması için düzenli stok ve planlı termin yönetimi sağlıyoruz.',
  },
  {
    index: '02',
    title: 'Uygulamaya Göre MFI Eşleştirme',
    description:
      'Shrink film, sera örtüsü, PE100 basınçlı boru, bidon veya masterbatch taşıyıcı reçeteleriniz için doğru erime indeksi (MFI) ve yoğunluk sınıfını belirliyoruz.',
  },
  {
    index: '03',
    title: 'İstanbul Merkezli Hızlı Sevkiyat',
    description:
      'Başakşehir / İstanbul operasyon merkezimizden Türkiye genelindeki plastik ambalaj, boru ve enjeksiyon tesislerine palet ve tır bazlı sevkiyat gerçekleştiriyoruz.',
  },
  {
    index: '04',
    title: 'İç ve Dış Ticaret Tecrübesi',
    description:
      'ANB Plastik İç ve Dış Ticaret Ltd. Şti. güvencesiyle ithalat, gümrükleme ve LOT bazlı teknik analiz sertifikası süreçlerini şeffaf biçimde yönetiyoruz.',
  },
];

export const SECTOR_REFERENCES = [
  {
    sector: 'Esnek Ambalaj ve Film Üreticileri',
    polymers: 'AYPE Filmlik (0,3–7) · YYPE Filmlik (0,02–0,07)',
    applications: 'Shrink rulo, atlet ve hışır poşet, peçete torbası, laminasyon filmleri',
    benchmark: '25 kg çuval & BigBag stoktan sevkiyat',
  },
  {
    sector: 'Altyapı ve Basınçlı Boru Sistemleri',
    polymers: 'YYPE Boruluk PE63 · PE80 · PE100 (0,03–0,07)',
    applications: 'Temiz su, doğalgaz, korige kanalizasyon ve telekom muhafaza boruları',
    benchmark: 'Uzun dönem hidrostatik basınç uyumu',
  },
  {
    sector: 'Tarım ve Sulama Teknolojileri',
    polymers: 'AYPE Filmlik · YYPE Rafyalık (0,7–0,9)',
    applications: 'UV katkılı sera örtüleri, damlama sulama boruları, file çuval üretimi',
    benchmark: 'Sezon öncesi yüksek tonajlı tedarik planı',
  },
  {
    sector: 'Enjeksiyon, Kapak ve Masterbatch',
    polymers: 'YYPE Enjeksiyon (1–20) · AYPE Enjeksiyon (10–70)',
    applications: 'Gıda kapakları, endüstriyel kasalar, paletler, mutfak eşyaları ve konsantre boya',
    benchmark: 'Tutarlı MFI partisi ile düşük fire oranı',
  },
];

export const COMPANY_INFO = {
  brandName: 'ANB Plastik',
  legalName: 'ANB Plastik İç ve Dış Ticaret Limited Şirketi',
  slogan: 'Plastik adına her şey',
  district: 'Başakşehir, İstanbul',
  domain: 'anbplastik.com',
  email: 'info@anbplastik.com',
  workingHours: 'Pazartesi – Cuma: 08:30 – 18:00',
};
