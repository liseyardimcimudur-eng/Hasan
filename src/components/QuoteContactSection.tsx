import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Clock, Globe, Mail, MapPin } from 'lucide-react';
import type { CmsPage, CmsPolymerGrade, CmsSiteSettings } from '../data/defaultCmsState';
import {
  hasValidationErrors,
  validateQuoteForm,
  type QuoteFormInput,
  type QuoteSubmissionSummary,
  type QuoteValidationErrors,
} from '../utils/validation';

interface QuoteContactSectionProps {
  settings: CmsSiteSettings;
  grades: CmsPolymerGrade[];
  contactPage?: CmsPage;
  selectedGradeId: string;
  preselectedNote: string;
  onGradeChange: (gradeId: string) => void;
  onQuoteSubmitted?: () => void;
}

export function QuoteContactSection({
  settings,
  grades,
  contactPage,
  selectedGradeId,
  preselectedNote,
  onGradeChange,
  onQuoteSubmitted,
}: QuoteContactSectionProps) {
  const publishedGrades = grades.filter((g) => g.status === 'published');
  const fallbackGradeId = publishedGrades[0]?.id || '';

  const [form, setForm] = useState<QuoteFormInput>({
    companyOrName: '',
    email: '',
    phone: '',
    gradeId: selectedGradeId || fallbackGradeId,
    tonnage: '',
    notes: '',
  });
  const [errors, setErrors] = useState<QuoteValidationErrors>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<QuoteSubmissionSummary | null>(null);

  useEffect(() => {
    if (selectedGradeId) {
      setForm((prev) => ({ ...prev, gradeId: selectedGradeId }));
      setSubmitted(null);
    }
  }, [selectedGradeId]);

  useEffect(() => {
    if (preselectedNote) {
      setForm((prev) => ({ ...prev, notes: preselectedNote }));
      setSubmitted(null);
    }
  }, [preselectedNote]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');
    const validation = validateQuoteForm(form);
    setErrors(validation);

    if (hasValidationErrors(validation)) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) {
        setSubmitError(payload.error || 'Talep gönderilirken bir hata oluştu.');
        if (payload.errors) {
          setErrors(payload.errors);
        }
        return;
      }

      setSubmitted(payload.summary);
      onQuoteSubmitted?.();
    } catch {
      setSubmitError('Sunucuya ulaşılamadı. Lütfen bağlantınızı kontrol edin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(null);
    setErrors({});
    setSubmitError('');
    setForm((prev) => ({
      ...prev,
      tonnage: '',
      notes: '',
    }));
  };

  const selectedGrade = publishedGrades.find((g) => g.id === form.gradeId);

  return (
    <section id="iletisim" className="bg-slate-50 py-16 lg:py-20">
      <div id="teklif" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium tracking-wide text-sky-700">
                {contactPage?.kicker || 'İletişim ve Hammadde Teklifi'}
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 [text-wrap:balance] sm:text-4xl">
                {contactPage?.lead || 'Kurumsal Teklif ve Numune Talebi Oluşturun'}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                {contactPage?.body ||
                  'İhtiyaç duyduğunuz YYPE veya AYPE sınıfını, tahmini tonajınızı ve teslimat ilini paylaşın; satış ekibimiz güncel stok ve fiyat teklifi ile dönüş yapsın.'}
              </p>

              <dl className="mt-8 space-y-5 border-t border-slate-200 pt-6 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" aria-hidden="true" />
                  <div>
                    <dt className="font-semibold text-slate-900">Ticari Unvan ve Merkez</dt>
                    <dd className="mt-0.5 text-slate-600">
                      {settings.legalName}
                      <br />
                      {settings.district}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" aria-hidden="true" />
                  <div>
                    <dt className="font-semibold text-slate-900">Kurumsal E-Posta</dt>
                    <dd className="mt-0.5">
                      <a
                        href={`mailto:${settings.email}`}
                        className="text-slate-700 underline-offset-2 hover:text-sky-700 hover:underline"
                      >
                        {settings.email}
                      </a>
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" aria-hidden="true" />
                  <div>
                    <dt className="font-semibold text-slate-900">Web</dt>
                    <dd className="mt-0.5 text-slate-600">{settings.domain}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" aria-hidden="true" />
                  <div>
                    <dt className="font-semibold text-slate-900">Çalışma Saatleri</dt>
                    <dd className="mt-0.5 text-slate-600">{settings.workingHours}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
              {submitted ? (
                <div data-testid="quote-confirmation" className="space-y-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-mono text-xs font-semibold text-emerald-700">
                        {submitted.submittedAtLabel} · {submitted.referenceCode}
                      </p>
                      <h3 className="mt-1 font-display text-2xl font-bold text-slate-900">
                        Teklif Talebiniz Kaydedildi
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Talebiniz doğrudan {settings.brandName} yönetici gelen kutusuna iletildi.
                        Satış mühendislerimiz en kısa sürede sizinle iletişime geçecektir.
                      </p>
                    </div>
                  </div>

                  <dl className="grid grid-cols-1 gap-4 rounded-md border border-slate-200 bg-slate-50 p-5 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Firma / Yetkili</dt>
                      <dd className="mt-1 font-semibold text-slate-900">
                        {submitted.companyOrName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">İletişim</dt>
                      <dd className="mt-1 text-slate-800">
                        {submitted.email} · {submitted.phone}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Seçilen Polimer Sınıfı</dt>
                      <dd className="mt-1 font-semibold text-slate-900">
                        {selectedGrade?.title ?? submitted.gradeId}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Talep Edilen Miktar</dt>
                      <dd className="mt-1 font-mono font-semibold text-slate-900 tabular-nums">
                        {submitted.tonnageNumber} Ton
                      </dd>
                    </div>
                    {submitted.notes && (
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-medium text-slate-500">Teknik Not</dt>
                        <dd className="mt-1 text-slate-700">{submitted.notes}</dd>
                      </div>
                    )}
                  </dl>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700"
                  >
                    Yeni Teklif Talebi Oluştur
                  </button>
                </div>
              ) : (
                <form noValidate onSubmit={handleSubmit} className="space-y-5">
                  {submitError && (
                    <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="quote-company"
                        className="block text-sm font-medium text-slate-800"
                      >
                        Firma Adı / Ad Soyad
                      </label>
                      <input
                        id="quote-company"
                        name="companyOrName"
                        type="text"
                        required
                        value={form.companyOrName}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, companyOrName: e.target.value }));
                          setErrors((prev) => ({ ...prev, companyOrName: undefined }));
                        }}
                        placeholder="Örn. Marmara Ambalaj San. Tic. A.Ş."
                        className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-700"
                      />
                      {errors.companyOrName && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-700">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>{errors.companyOrName}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="quote-email"
                        className="block text-sm font-medium text-slate-800"
                      >
                        Kurumsal E-Posta
                      </label>
                      <input
                        id="quote-email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, email: e.target.value }));
                          setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder="satinalma@firma.com.tr"
                        className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-700"
                      />
                      {errors.email && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-700">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="quote-phone"
                        className="block text-sm font-medium text-slate-800"
                      >
                        Telefon Numarası
                      </label>
                      <input
                        id="quote-phone"
                        name="phone"
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, phone: e.target.value }));
                          setErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        placeholder="0212 000 00 00"
                        className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-700"
                      />
                      {errors.phone && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-700">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="quote-tonnage"
                        className="block text-sm font-medium text-slate-800"
                      >
                        Talep Edilen Miktar (Ton)
                      </label>
                      <input
                        id="quote-tonnage"
                        name="tonnage"
                        type="number"
                        min="0.5"
                        step="0.5"
                        required
                        value={form.tonnage}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, tonnage: e.target.value }));
                          setErrors((prev) => ({ ...prev, tonnage: undefined }));
                        }}
                        placeholder="Örn. 24"
                        className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 tabular-nums placeholder:font-sans placeholder:text-slate-400 focus:border-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-700"
                      />
                      {errors.tonnage && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-700">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>{errors.tonnage}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="quote-grade"
                      className="block text-sm font-medium text-slate-800"
                    >
                      Polietilen Ürün Grubu
                    </label>
                    <select
                      id="quote-grade"
                      name="gradeId"
                      value={form.gradeId}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, gradeId: e.target.value }));
                        onGradeChange(e.target.value);
                        setErrors((prev) => ({ ...prev, gradeId: undefined }));
                      }}
                      className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-700"
                    >
                      {publishedGrades.map((grade) => (
                        <option key={grade.id} value={grade.id}>
                          {grade.title} — MFI: {grade.mfiRange}
                        </option>
                      ))}
                    </select>
                    {errors.gradeId && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-700">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{errors.gradeId}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="quote-notes"
                      className="block text-sm font-medium text-slate-800"
                    >
                      Uygulama Detayı ve Teslimat Notu (Opsiyonel)
                    </label>
                    <textarea
                      id="quote-notes"
                      name="notes"
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Hedef MFI değeri, renk/katkı tercihi veya teslimat ili..."
                      className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-700"
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500">
                      {settings.district} çıkışlı palet veya tır bazlı sevkiyat planlanır.
                    </p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-sky-700 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                    >
                      {submitting ? 'Gönderiliyor...' : 'Teklif Talebini Gönder'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
