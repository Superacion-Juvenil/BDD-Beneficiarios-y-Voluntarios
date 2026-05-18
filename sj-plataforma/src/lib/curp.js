/**
 * CURP parser — extracts birth date and sex from the 18-character CURP string.
 * Positions are 1-based per the official CURP spec.
 *
 * Structure: AAAA YYMMDD H/M SSSS CC V
 *   [0-3]  4 letters (surname + name initial + first vowel)
 *   [4-5]  year of birth (2 digits)
 *   [6-7]  month of birth
 *   [8-9]  day of birth
 *   [10]   sex: H = Hombre, M = Mujer
 *   [11-12] state
 *   [13-15] consonants
 *   [16]   decade digit
 *   [17]   verification digit
 */

export function parseCURP(curp) {
  if (!curp || curp.length !== 18) return null;
  const c = curp.toUpperCase();

  const yyRaw = parseInt(c.slice(4, 6), 10);
  const mm = c.slice(6, 8);
  const dd = c.slice(8, 10);

  // Decade digit at position 16: '0'=1900s, 'A'=2000s
  // Fallback: year >25 → 1900s, ≤25 → 2000s
  let yyyy;
  const decadeChar = c[16];
  if (decadeChar === 'A') {
    yyyy = 2000 + yyRaw;
  } else if (decadeChar === '0' || /\d/.test(decadeChar)) {
    yyyy = 1900 + yyRaw;
  } else {
    yyyy = yyRaw > 25 ? 1900 + yyRaw : 2000 + yyRaw;
  }

  const sexChar = c[10];
  const sex = sexChar === 'H' ? 'Hombre' : sexChar === 'M' ? 'Mujer' : null;

  const fechaNac = `${yyyy}-${mm}-${dd}`; // ISO format
  return { fechaNac, sex };
}

export function calcAge(fechaNac) {
  if (!fechaNac) return null;
  const today = new Date();
  const birth = new Date(fechaNac);
  if (isNaN(birth)) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function isMinor(fechaNac) {
  const age = calcAge(fechaNac);
  return age !== null && age < 18;
}

export function formatFechaNac(isoDate) {
  if (!isoDate) return '';
  const [yyyy, mm, dd] = isoDate.split('-');
  return `${dd}/${mm}/${yyyy}`;
}

export const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

export function validateCURP(curp) {
  if (!curp) return 'El CURP es requerido';
  if (curp.length !== 18) return 'El CURP debe tener 18 caracteres';
  if (!CURP_REGEX.test(curp.toUpperCase())) return 'Formato de CURP inválido';
  return null;
}
