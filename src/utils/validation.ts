export interface QuoteFormInput {
  companyOrName: string;
  email: string;
  phone: string;
  gradeId: string;
  tonnage: string;
  notes: string;
}

export interface QuoteValidationErrors {
  companyOrName?: string;
  email?: string;
  phone?: string;
  gradeId?: string;
  tonnage?: string;
}

export interface QuoteSubmissionSummary {
  referenceCode: string;
  companyOrName: string;
  email: string;
  phone: string;
  gradeId: string;
  tonnageNumber: number;
  notes: string;
  submittedAtLabel: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateQuoteForm(input: QuoteFormInput): QuoteValidationErrors {
  const errors: QuoteValidationErrors = {};

  if (!input.companyOrName.trim() || input.companyOrName.trim().length < 2) {
    errors.companyOrName = 'Lütfen firma unvanı veya ad soyad giriniz.';
  }

  if (!input.email.trim()) {
    errors.email = 'Kurumsal e-posta adresi zorunludur.';
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = 'Geçerli bir e-posta adresi giriniz (ör. ad@firma.com).';
  }

  const digits = input.phone.replace(/\D/g, '');
  if (!digits) {
    errors.phone = 'İletişim telefon numarası zorunludur.';
  } else if (digits.length < 10) {
    errors.phone = 'Telefon numarası en az 10 haneli olmalıdır.';
  }

  if (!input.gradeId.trim()) {
    errors.gradeId = 'Lütfen bir polietilen ürün sınıfı seçiniz.';
  }

  const parsedTon = Number(input.tonnage.replace(',', '.'));
  if (!input.tonnage.trim() || Number.isNaN(parsedTon) || parsedTon <= 0) {
    errors.tonnage = 'Talep edilen miktar (ton) sıfırdan büyük olmalıdır.';
  }

  return errors;
}

export function hasValidationErrors(errors: QuoteValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function buildQuoteSummary(
  input: QuoteFormInput,
  seedCounter = 1,
): QuoteSubmissionSummary {
  const cleanName = input.companyOrName.trim();
  const tonnageNumber = Number(input.tonnage.replace(',', '.'));
  const padded = String(1000 + (seedCounter % 9000));
  return {
    referenceCode: `ANB-2026-${padded}`,
    companyOrName: cleanName,
    email: input.email.trim(),
    phone: input.phone.trim(),
    gradeId: input.gradeId,
    tonnageNumber,
    notes: input.notes.trim(),
    submittedAtLabel: 'Talep Kaydı Alındı',
  };
}
