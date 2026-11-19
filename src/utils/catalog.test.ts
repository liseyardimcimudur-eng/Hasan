import test from 'node:test';
import assert from 'node:assert/strict';
import { POLYMER_GRADES } from '../data/polymers';
import { filterPolymerGrades, getAvailableProcesses } from './catalog';
import {
  buildQuoteSummary,
  hasValidationErrors,
  validateQuoteForm,
} from './validation';

test('filterPolymerGrades filters accurately by family YYPE and AYPE', () => {
  const yype = filterPolymerGrades(POLYMER_GRADES, {
    family: 'YYPE',
    process: 'ALL',
    query: '',
  });
  assert.equal(yype.length, 5);
  assert.ok(yype.every((g) => g.family === 'YYPE'));

  const aype = filterPolymerGrades(POLYMER_GRADES, {
    family: 'AYPE',
    process: 'ALL',
    query: '',
  });
  assert.equal(aype.length, 2);
  assert.ok(aype.every((g) => g.family === 'AYPE'));
});

test('filterPolymerGrades matches Turkish application keywords and pipe standards', () => {
  const seraMatches = filterPolymerGrades(POLYMER_GRADES, {
    family: 'ALL',
    process: 'ALL',
    query: 'Sera Örtüsü',
  });
  assert.equal(seraMatches.length, 1);
  assert.equal(seraMatches[0].id, 'aype-filmlik');

  const pe100Matches = filterPolymerGrades(POLYMER_GRADES, {
    family: 'ALL',
    process: 'ALL',
    query: 'pe100',
  });
  assert.equal(pe100Matches.length, 1);
  assert.equal(pe100Matches[0].id, 'yype-boruluk');

  const siseMatches = filterPolymerGrades(POLYMER_GRADES, {
    family: 'ALL',
    process: 'ALL',
    query: 'şişe',
  });
  assert.equal(siseMatches.length, 1);
  assert.equal(siseMatches[0].id, 'yype-sisirmelik');
});

test('getAvailableProcesses returns only processes present for selected family', () => {
  const aypeProcesses = getAvailableProcesses(POLYMER_GRADES, 'AYPE');
  assert.deepEqual(aypeProcesses, ['Filmlik', 'Enjeksiyonluk']);
});

test('validateQuoteForm catches empty or malformed fields and passes valid B2B input', () => {
  const emptyErrors = validateQuoteForm({
    companyOrName: '',
    email: 'gecersiz',
    phone: '123',
    gradeId: '',
    tonnage: '0',
    notes: '',
  });
  assert.equal(hasValidationErrors(emptyErrors), true);
  assert.ok(emptyErrors.companyOrName);
  assert.ok(emptyErrors.email);
  assert.ok(emptyErrors.phone);
  assert.ok(emptyErrors.gradeId);
  assert.ok(emptyErrors.tonnage);

  const validErrors = validateQuoteForm({
    companyOrName: 'Marmara Ambalaj A.Ş.',
    email: 'satinalma@marmaraambalaj.com.tr',
    phone: '+90 212 555 12 34',
    gradeId: 'yype-boruluk',
    tonnage: '24,5',
    notes: 'PE100 siyah kompaund teklifi rica ederiz.',
  });
  assert.equal(hasValidationErrors(validErrors), false);

  const summary = buildQuoteSummary(
    {
      companyOrName: 'Marmara Ambalaj A.Ş.',
      email: 'satinalma@marmaraambalaj.com.tr',
      phone: '+90 212 555 12 34',
      gradeId: 'yype-boruluk',
      tonnage: '24,5',
      notes: 'PE100 siyah kompaund teklifi rica ederiz.',
    },
    7,
  );
  assert.equal(summary.referenceCode, 'ANB-2026-1007');
  assert.equal(summary.tonnageNumber, 24.5);
});
