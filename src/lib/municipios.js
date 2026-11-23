/**
 * Municipios del área metropolitana de Monterrey donde opera SJ.
 *
 * El campo `municipio` sigue siendo texto libre en la base: el catálogo sólo
 * gobierna lo que se captura de aquí en adelante. Los registros antiguos con
 * variantes de escritura ("MONTERREY", "Gral. Escobedo") se conservan tal
 * cual hasta que alguien los corrija.
 */
export const MUNICIPIOS = [
  'Monterrey',
  'Apodaca',
  'Guadalupe',
  'General Escobedo',
  'San Nicolás de los Garza',
  'San Pedro Garza García',
  'Santa Catarina',
  'García',
  'Juárez',
  'Santiago',
];

/** Valor del select cuando el municipio no está en el catálogo. */
export const OTRO = 'Otro';

/** Minúsculas, sin acentos y con los espacios colapsados, para comparar. */
function normalizar(valor) {
  return (valor || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Municipio del catálogo que corresponde a un valor guardado, o '' si no hay
 * ninguno. La comparación ignora acentos y mayúsculas, de modo que
 * "MONTERREY" reconoce a "Monterrey"; una escritura realmente distinta,
 * como "Gral. Escobedo", no se adivina y cae en "Otro".
 */
export function municipioDelCatalogo(valor) {
  const n = normalizar(valor);
  if (!n) return '';
  return MUNICIPIOS.find(m => normalizar(m) === n) || '';
}
