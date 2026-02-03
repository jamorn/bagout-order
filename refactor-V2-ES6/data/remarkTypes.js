import gradeData from './grade_pp.js';

function collectByType(typeName) {
  return gradeData
    .filter(g => (g.type || '').toString().toUpperCase() === (typeName || '').toString().toUpperCase())
    .map(g => g.MATNR)
    .filter(Boolean);
}

export const PREMIUM = collectByType('PREMIUM');
export const SUB_STANDARD = collectByType('SUB-STANDARD');
export const OFF_GRADE = collectByType('OFF-GRADE');
export const TEST = collectByType('TEST');
export const OGPH = collectByType('OGPH');
export const OGPR = collectByType('OGPR');

export default { PREMIUM, SUB_STANDARD, OFF_GRADE, TEST, OGPH, OGPR };
