import type { PolymerFamily, PolymerGrade, ProcessMethod } from '../data/polymers';

export type FamilyFilter = 'ALL' | PolymerFamily;
export type ProcessFilter = 'ALL' | ProcessMethod;

export interface CatalogFilterParams {
  family: FamilyFilter;
  process: ProcessFilter;
  query: string;
}

const normalizeTurkish = (value: string): string =>
  value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export function filterPolymerGrades<T extends PolymerGrade>(
  grades: T[],
  params: CatalogFilterParams,
): T[] {
  const q = normalizeTurkish(params.query);

  return grades.filter((grade) => {
    if (params.family !== 'ALL' && grade.family !== params.family) {
      return false;
    }

    if (params.process !== 'ALL' && grade.process !== params.process) {
      return false;
    }

    if (!q) {
      return true;
    }

    const haystack = normalizeTurkish(
      [
        grade.family,
        grade.familyFullName,
        grade.familyEnglishName,
        grade.process,
        grade.title,
        grade.mfiRange,
        grade.standards ?? '',
        grade.summary,
        ...grade.applications,
      ].join(' '),
    );

    return haystack.includes(q);
  });
}

export function getAvailableProcesses(
  grades: PolymerGrade[],
  family: FamilyFilter,
): ProcessMethod[] {
  const relevant =
    family === 'ALL' ? grades : grades.filter((g) => g.family === family);
  const seen = new Set<ProcessMethod>();
  for (const item of relevant) {
    seen.add(item.process);
  }
  return Array.from(seen);
}
