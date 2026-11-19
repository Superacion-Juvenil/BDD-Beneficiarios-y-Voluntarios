import { supabase } from './supabase';

const SCHEMA_VERSION = 3;
const META_KEY = 'sj_schema_version';

const OLD_PROGRAMA_NAMES = ['MJ Sec/Prepa', 'MJ Sec', 'MJ Prepa/Sec', 'MJ General', 'MJ'];

async function migrateProgramaNames() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, programa')
    .in('programa', OLD_PROGRAMA_NAMES);

  if (error) throw error;
  if (!data || data.length === 0) return 0;

  const ids = data.map(r => r.id);
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ programa: 'MJ Prepa' })
    .in('id', ids);

  if (updateError) throw updateError;

  console.log(`[migrations] v2: ${ids.length} usuario(s) actualizados a "MJ Prepa"`);
  return ids.length;
}

/**
 * Las 6 evaluaciones que estuvieron publicadas hasta noviembre de 2026, antes
 * de sustituirlas por los 15 instrumentos oficiales. Sus respuestas ya no
 * corresponden a ningún cuestionario vigente y se eliminan a petición de
 * coordinación.
 */
const EVALUACIONES_RETIRADAS = [
  'diag-conociendome',
  'seg-trimestral',
  'sat-semestral',
  'mj-vida-adolescente',
  'univ-vocacion',
  'vol-servicio',
];

async function limpiarEvaluacionesRetiradas() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, evaluaciones')
    .not('evaluaciones', 'is', null);

  if (error) throw error;

  let limpiados = 0;
  for (const row of data || []) {
    const ev = row.evaluaciones;
    if (!ev || typeof ev !== 'object' || Array.isArray(ev)) continue;

    const sobrantes = EVALUACIONES_RETIRADAS.filter(k => k in ev);
    if (sobrantes.length === 0) continue;

    const limpio = { ...ev };
    for (const k of sobrantes) delete limpio[k];

    // Sin tocar updatedAt: esto es limpieza interna, no una edición del
    // participante, y la columna "Actualizado" del panel no debe moverse.
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ evaluaciones: limpio })
      .eq('id', row.id);

    if (updateError) {
      console.error(`[migrations] v3: no se pudo limpiar ${row.id}:`, updateError.message);
      continue;
    }
    limpiados += 1;
  }

  if (limpiados > 0) {
    console.log(`[migrations] v3: respuestas retiradas eliminadas de ${limpiados} perfil(es)`);
  }
  return limpiados;
}

export async function runMigrations() {
  try {
    const stored = parseInt(localStorage.getItem(META_KEY) || '1', 10);
    if (stored >= SCHEMA_VERSION) return;

    if (stored < 2) {
      await migrateProgramaNames();
    }

    if (stored < 3) {
      await limpiarEvaluacionesRetiradas();
    }

    localStorage.setItem(META_KEY, String(SCHEMA_VERSION));
  } catch (err) {
    console.error('[migrations] Error durante la migración (continuando):', err);
  }
}
