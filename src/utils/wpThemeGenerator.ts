import type { CmsState } from '../data/defaultCmsState';

export interface WordPressThemeFile {
  filename: string;
  description: string;
  content: string;
}

const escapePhp = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

export function generateWordPressThemeFiles(cms: CmsState): WordPressThemeFile[] {
  const { settings, pages, grades, sectors } = cms;
  const publishedPages = pages
    .filter((p) => p.status === 'published')
    .sort((a, b) => a.order - b.order);
  const publishedGrades = grades.filter((g) => g.status === 'published');

  const styleCss = `/*
Theme Name: ${settings.brandName} Kurumsal Tema
Theme URI: https://${settings.domain}
Author: ${settings.legalName}
Description: ${settings.slogan} — YYPE & AYPE Polietilen Hammadde Kataloğu ve B2B Teklif Teması
Version: 1.1.0
Requires at least: 6.0
Requires PHP: 7.4
Text Domain: anb-plastik
*/

:root {
  --anb-navy: #0f172a;
  --anb-slate: #475569;
  --anb-sky: #0369a1;
  --anb-bg: #f8fafc;
  --anb-surface: #ffffff;
  --anb-border: #e2e8f0;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: var(--anb-bg);
  color: var(--anb-navy);
  line-height: 1.6;
}

a {
  color: inherit;
  text-decoration: none;
}

.anb-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.anb-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid var(--anb-border);
}

.anb-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 64px;
}

.anb-brand {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--anb-navy);
  white-space: nowrap;
}

.anb-nav ul {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--anb-slate);
}

.anb-nav a:hover {
  color: var(--anb-navy);
  text-decoration: underline;
}

.anb-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--anb-navy);
  color: #ffffff;
  padding: 9px 18px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.anb-cta:hover {
  background: var(--anb-sky);
}

.anb-hero {
  background: var(--anb-surface);
  border-bottom: 1px solid var(--anb-border);
  padding: 64px 0;
}

.anb-kicker {
  font-size: 13px;
  font-weight: 600;
  color: var(--anb-sky);
  margin: 0 0 12px;
}

.anb-hero h1 {
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.15;
  margin: 0 0 16px;
  max-width: 780px;
  letter-spacing: -0.02em;
}

.anb-hero-subtext {
  font-size: 17px;
  color: var(--anb-slate);
  max-width: 680px;
  margin: 0 0 28px;
}

.anb-section {
  padding: 56px 0;
}

.anb-section-title {
  font-size: 26px;
  margin: 0 0 8px;
  letter-spacing: -0.015em;
}

.anb-section-desc {
  color: var(--anb-slate);
  margin: 0 0 28px;
  max-width: 720px;
}

.anb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.anb-card {
  background: var(--anb-surface);
  border: 1px solid var(--anb-border);
  border-radius: 8px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
}

.anb-card-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--anb-sky);
}

.anb-card h3 {
  margin: 0;
  font-size: 18px;
  color: var(--anb-navy);
}

.anb-mfi {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 15px;
  font-weight: 700;
  color: var(--anb-navy);
  background: var(--anb-bg);
  border: 1px solid var(--anb-border);
  padding: 8px 12px;
  border-radius: 6px;
}

.anb-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.anb-tags li {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--anb-bg);
  border: 1px solid var(--anb-border);
  color: var(--anb-slate);
}

.anb-table-wrap {
  overflow-x: auto;
  background: var(--anb-surface);
  border: 1px solid var(--anb-border);
  border-radius: 8px;
}

.anb-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.anb-table th,
.anb-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--anb-border);
}

.anb-table th {
  background: var(--anb-bg);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--anb-slate);
}

.anb-page-card {
  background: var(--anb-surface);
  border: 1px solid var(--anb-border);
  border-radius: 8px;
  padding: 32px;
  margin: 32px 0;
}

.anb-footer {
  background: var(--anb-surface);
  border-top: 1px solid var(--anb-border);
  padding: 32px 0;
  font-size: 13px;
  color: var(--anb-slate);
}

.anb-footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

@media (max-width: 768px) {
  .anb-nav {
    display: none;
  }
}
`;

  const functionsPhp = `<?php
/**
 * ${settings.brandName} Tema Fonksiyonları ve Özel Polimer Ürün Türü (CPT)
 */
if (!defined('ABSPATH')) exit;

function anb_plastik_setup() {
  add_theme_support('title-tag');
  add_theme_support('post-thumbnails');
  register_nav_menus(array(
    'primary' => __('Ana Menü', 'anb-plastik'),
    'footer'  => __('Alt Menü', 'anb-plastik'),
  ));
}
add_action('after_setup_theme', 'anb_plastik_setup');

function anb_plastik_enqueue_assets() {
  wp_enqueue_style(
    'anb-plastik-style',
    get_stylesheet_uri(),
    array(),
    '1.1.0'
  );
}
add_action('wp_enqueue_scripts', 'anb_plastik_enqueue_assets');

function anb_register_polimer_cpt() {
  register_post_type('polimer_urun', array(
    'labels' => array(
      'name' => __('Polimer Ürünleri', 'anb-plastik'),
      'singular_name' => __('Polimer Serisi', 'anb-plastik'),
    ),
    'public' => true,
    'has_archive' => true,
    'menu_icon' => 'dashicons-category',
    'supports' => array('title', 'editor', 'custom-fields'),
    'show_in_rest' => true,
  ));
}
add_action('init', 'anb_register_polimer_cpt');
`;

  const headerPhp = `<?php
/**
 * Üst Menü Şablonu — ${settings.brandName}
 */
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="anb-header">
  <div class="anb-container anb-header-inner">
    <a class="anb-brand" href="<?php echo esc_url(home_url('/')); ?>">
      ${escapePhp(settings.brandName)}
    </a>
    <nav class="anb-nav" aria-label="Ana Menü">
      <?php
        if (has_nav_menu('primary')) {
          wp_nav_menu(array(
            'theme_location' => 'primary',
            'container' => false,
            'fallback_cb' => false,
          ));
        } else {
          echo '<ul>';
          echo '<li><a href="' . esc_url(home_url('/')) . '">Ana Sayfa</a></li>';
          echo '<li><a href="#urunler">Ürünlerimiz</a></li>';
          echo '<li><a href="#sektorler">Referanslarımız</a></li>';
          echo '<li><a href="#iletisim">İletişim</a></li>';
          echo '</ul>';
        }
      ?>
    </nav>
    <a class="anb-cta" href="mailto:${escapePhp(settings.email)}">Teklif Al</a>
  </div>
</header>
`;

  const footerPhp = `<?php
/**
 * Alt Bilgi Şablonu — ${settings.legalName}
 */
?>
<footer id="iletisim" class="anb-footer">
  <div class="anb-container anb-footer-inner">
    <div>
      <strong>${escapePhp(settings.brandName)}</strong> — ${escapePhp(settings.slogan)} · ${escapePhp(settings.district)}
    </div>
    <div>
      &copy; <?php echo esc_html(date('Y')); ?> ${escapePhp(settings.legalName)} ·
      <a href="mailto:${escapePhp(settings.email)}">${escapePhp(settings.email)}</a>
    </div>
  </div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
`;

  const defaultGradesPhpArray = publishedGrades
    .map(
      (g) => `  array(
    'family' => '${escapePhp(g.family)} (${escapePhp(g.familyEnglishName)})',
    'process' => '${escapePhp(g.process)}',
    'title' => '${escapePhp(g.title)}',
    'mfi' => '${escapePhp(g.mfiRange)}',
    'summary' => '${escapePhp(g.summary)}',
    'apps' => array(${g.applications.map((a) => `'${escapePhp(a)}'`).join(', ')}),
  )`,
    )
    .join(',\n');

  const defaultSectorsPhpArray = sectors
    .map(
      (s) => `  array(
    'sector' => '${escapePhp(s.sector)}',
    'polymers' => '${escapePhp(s.polymers)}',
    'applications' => '${escapePhp(s.applications)}',
    'benchmark' => '${escapePhp(s.benchmark)}',
  )`,
    )
    .join(',\n');

  const frontPagePhp = `<?php
/**
 * Ön Sayfa Şablonu (front-page.php)
 * Aktif Sayfalar: ${publishedPages.map((p) => p.title).join(', ')}
 * Aktif Polimer Serileri: ${publishedGrades.length} adet
 */
get_header();

$anb_default_grades = array(
${defaultGradesPhpArray}
);

$anb_default_sectors = array(
${defaultSectorsPhpArray}
);
?>
<main id="primary" class="anb-main">
  <section class="anb-hero">
    <div class="anb-container">
      <p class="anb-kicker">${escapePhp(settings.slogan)} · ${escapePhp(settings.district)}</p>
      <h1>${escapePhp(settings.heroHeadline)}</h1>
      <p class="anb-hero-subtext">${escapePhp(settings.heroSubtext)}</p>
      <a class="anb-cta" href="mailto:${escapePhp(settings.email)}">${escapePhp(settings.heroCtaLabel)}</a>
    </div>
  </section>

  <section id="urunler" class="anb-section">
    <div class="anb-container">
      <h2 class="anb-section-title">YYPE ve AYPE Polietilen Ürün Grupları</h2>
      <p class="anb-section-desc">
        190°C / 2.16 kg test standardında YYPE (HDPE) ve AYPE (LDPE) polimer serileri.
      </p>
      <div class="anb-grid">
        <?php
        $products = new WP_Query(array('post_type' => 'polimer_urun', 'posts_per_page' => 12));
        if ($products->have_posts()) :
          while ($products->have_posts()) : $products->the_post(); ?>
            <article class="anb-card">
              <div>
                <h3><?php the_title(); ?></h3>
                <div><?php the_content(); ?></div>
              </div>
            </article>
          <?php endwhile;
          wp_reset_postdata();
        else :
          foreach ($anb_default_grades as $grade) : ?>
            <article class="anb-card">
              <div>
                <div class="anb-card-meta">
                  <span><?php echo esc_html($grade['family'] . ' · ' . $grade['process']); ?></span>
                  <span>190°C / 2.16 kg</span>
                </div>
                <h3><?php echo esc_html($grade['title']); ?></h3>
                <div class="anb-mfi">MFI: <?php echo esc_html($grade['mfi']); ?></div>
                <p><?php echo esc_html($grade['summary']); ?></p>
                <ul class="anb-tags">
                  <?php foreach ($grade['apps'] as $app) : ?>
                    <li><?php echo esc_html($app); ?></li>
                  <?php endforeach; ?>
                </ul>
              </div>
              <a class="anb-cta" href="mailto:${escapePhp(settings.email)}?subject=<?php echo rawurlencode('Teklif Talebi: ' . $grade['title']); ?>">Teklif Al</a>
            </article>
          <?php endforeach;
        endif; ?>
      </div>
    </div>
  </section>

  <section id="sektorler" class="anb-section">
    <div class="anb-container">
      <h2 class="anb-section-title">Sektörel Çözümler</h2>
      <div class="anb-table-wrap">
        <table class="anb-table">
          <thead>
            <tr>
              <th>Sektör</th>
              <th>Önerilen Polimer</th>
              <th>Uygulamalar</th>
              <th>Tedarik Standardı</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($anb_default_sectors as $sector) : ?>
              <tr>
                <td><strong><?php echo esc_html($sector['sector']); ?></strong></td>
                <td><?php echo esc_html($sector['polymers']); ?></td>
                <td><?php echo esc_html($sector['applications']); ?></td>
                <td><?php echo esc_html($sector['benchmark']); ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</main>
<?php get_footer(); ?>
`;

  const indexPhp = `<?php
/**
 * Ana Yedek Şablon (index.php) — WordPress tema doğrulaması için zorunludur.
 */
if (is_front_page() || is_home()) {
  locate_template('front-page.php', true);
  return;
}

get_header();
?>
<main id="primary" class="anb-container">
  <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
    <article id="post-<?php the_ID(); ?>" <?php post_class('anb-page-card'); ?>>
      <h1><?php the_title(); ?></h1>
      <div class="entry-content">
        <?php the_content(); ?>
      </div>
    </article>
  <?php endwhile; else : ?>
    <div class="anb-page-card">
      <h1>${escapePhp(settings.brandName)}</h1>
      <p>${escapePhp(settings.heroSubtext)}</p>
    </div>
  <?php endif; ?>
</main>
<?php get_footer(); ?>
`;

  const pagePhp = `<?php
/**
 * Standart Sayfa Şablonu (page.php)
 */
get_header();
while (have_posts()) : the_post(); ?>
  <main class="anb-container">
    <article id="post-<?php the_ID(); ?>" <?php post_class('anb-page-card'); ?>>
      <header>
        <h1><?php the_title(); ?></h1>
      </header>
      <div class="entry-content">
        <?php the_content(); ?>
      </div>
    </article>
  </main>
<?php endwhile;
get_footer(); ?>
`;

  return [
    {
      filename: 'index.php',
      description: 'WordPress zorunlu ana şablon dosyası (tema tanıma ve arşiv görünümü)',
      content: indexPhp,
    },
    {
      filename: 'style.css',
      description: 'WordPress tema üst bilgisi ve tam kurumsal CSS stilleri',
      content: styleCss,
    },
    {
      filename: 'functions.php',
      description: 'Stil yükleme (wp_enqueue_style), menüler ve Polimer CPT tanımı',
      content: functionsPhp,
    },
    {
      filename: 'header.php',
      description: '3 bölgeli üst menü ve WordPress wp_head() kancası',
      content: headerPhp,
    },
    {
      filename: 'front-page.php',
      description: 'Ana sayfa hero, YYPE/AYPE katalog döngüsü ve sektör tablosu',
      content: frontPagePhp,
    },
    {
      filename: 'page.php',
      description: 'Hakkımızda, Ürünlerimiz, Referanslarımız ve İletişim sayfa şablonu',
      content: pagePhp,
    },
    {
      filename: 'footer.php',
      description: 'Kurumsal alt bilgi ve wp_footer() kancası',
      content: footerPhp,
    },
  ];
}
