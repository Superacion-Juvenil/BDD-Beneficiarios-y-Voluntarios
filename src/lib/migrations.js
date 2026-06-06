import { supabase } from './supabase';

const SCHEMA_VERSION = 2;
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

export async function runMigrations() {
  try {
    const stored = parseInt(localStorage.getItem(META_KEY) || '1', 10);
    if (stored >= SCHEMA_VERSION) return;

    if (stored < 2) {
      await migrateProgramaNames();
    }

    localStorage.setItem(META_KEY, String(SCHEMA_VERSION));
  } catch (err) {
    console.error('[migrations] Error durante la migración (continuando):', err);
  }
}
