/**
 * Migration script — imports Excel data into Supabase Auth + profiles.
 *
 * Usage:
 *   node scripts/migrate.js --file=./data/participantes.xlsx [--dry-run]
 *
 * Requires (.env):
 *   SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...   (NUNCA exponer en frontend)
 *   DEFAULT_USER_PASSWORD=SJ2025
 *
 * Dependencias:
 *   npm install xlsx @supabase/supabase-js dotenv
 *
 * Expected Excel sheets:  SU | MCU | MJ | STAFF SJ
 * Deduplication: si un CURP aparece en varias hojas, se conserva el más
 * reciente por "Marca temporal".
 */

'use strict';

const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, v] = a.replace('--', '').split('=');
    return [k, v ?? true];
  })
);

const EXCEL_FILE = args.file || './data/participantes.xlsx';
const DRY_RUN = args['dry-run'] === true || args['dry-run'] === 'true';
const DEFAULT_PASSWORD = process.env.DEFAULT_USER_PASSWORD || 'SJ2025';

const SHEET_PROGRAMA = {
  'SU': 'SU',
  'MCU': 'MCU',
  'MJ': 'MJ Sec/Prepa',
  'STAFF SJ': null,
};

// ────────────────────────────────────────────────
function parseCURP(curp) {
  if (!curp || curp.length !== 18) return null;
  const c = curp.toUpperCase();
  const yyRaw = parseInt(c.slice(4, 6), 10);
  const mm = c.slice(6, 8);
  const dd = c.slice(8, 10);
  const decadeChar = c[16];
  let yyyy;
  if (decadeChar === 'A') yyyy = 2000 + yyRaw;
  else if (/\d/.test(decadeChar)) yyyy = 1900 + yyRaw;
  else yyyy = yyRaw > 25 ? 1900 + yyRaw : 2000 + yyRaw;
  const sex = c[10] === 'H' ? 'Hombre' : c[10] === 'M' ? 'Mujer' : null;
  return { fechaNacimiento: `${yyyy}-${mm}-${dd}`, sexo: sex };
}

function normalizeStr(v) {
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

function findCol(row, candidates) {
  const keys = Object.keys(row).map(k => k.trim().toLowerCase());
  for (const c of candidates) {
    const idx = keys.findIndex(k => k.includes(c.toLowerCase()));
    if (idx !== -1) return Object.keys(row)[idx];
  }
  return null;
}

function extractField(row, candidates) {
  const col = findCol(row, candidates);
  return col ? normalizeStr(row[col]) : '';
}

function rowToUser(row, sheetName) {
  const curp = extractField(row, ['curp']).toUpperCase();
  if (!curp || curp.length !== 18) return null;

  const parsed = parseCURP(curp);
  const tipoParticipante = sheetName === 'STAFF SJ' ? 'Voluntario' : 'Beneficiario';
  const programa = SHEET_PROGRAMA[sheetName] || extractField(row, ['programa']);

  const marcaTemporal = extractField(row, ['marca temporal', 'timestamp', 'fecha registro']);

  return {
    curp,
    nombre: extractField(row, ['nombre', 'nombres']),
    apellidoPaterno: extractField(row, ['apellido paterno', 'paterno', 'primer apellido']),
    apellidoMaterno: extractField(row, ['apellido materno', 'materno', 'segundo apellido']),
    fechaNacimiento: parsed?.fechaNacimiento || '',
    sexo: parsed?.sexo || '',
    correo: extractField(row, ['correo', 'email', 'e-mail']),
    telefono: extractField(row, ['telefono', 'teléfono', 'cel', 'celular']),
    calle: extractField(row, ['calle', 'domicilio', 'direccion', 'dirección']),
    colonia: extractField(row, ['colonia']),
    cp: extractField(row, ['cp', 'código postal', 'codigo postal']),
    municipio: extractField(row, ['municipio', 'ciudad']),
    tutorNombre: extractField(row, ['tutor', 'padre', 'nombre tutor']),
    tutorTelefono: extractField(row, ['telefono tutor', 'cel tutor']),
    tutorCorreo: extractField(row, ['correo tutor', 'email tutor']),
    tipoParticipante,
    programa,
    distrito: extractField(row, ['distrito']),
    status: extractField(row, ['status', 'estado', 'estatus']) || 'Activo',
    gradoEscolar: extractField(row, ['grado', 'semestre', 'año escolar']),
    escuela: extractField(row, ['escuela', 'universidad', 'institución']),
    carrera: extractField(row, ['carrera']),
    ocupacion: extractField(row, ['ocupacion', 'ocupación']),
    empresa: extractField(row, ['empresa', 'trabajo']),
    programasSJ: extractField(row, ['programas sj', 'programas']),
    servicio: extractField(row, ['servicio']),
    voluntariadoExterno: extractField(row, ['voluntariado']),
    notas: extractField(row, ['notas', 'comentarios', 'observaciones']),
    docTerminos: false,
    docCartaResponsiva: false,
    docCapacitacionPASI: false,
    docFechaPASI: '',
    mustChangePassword: true,
    marcaTemporal,
    sheetName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ────────────────────────────────────────────────
async function findUserByEmail(supabase, email) {
  // Recorre páginas de listUsers hasta encontrar el email.
  const PAGE_SIZE = 200;
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
    if (error) throw error;
    const users = data?.users || [];
    const hit = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
    if (hit) return hit;
    if (users.length < PAGE_SIZE) return null;
    page++;
  }
}

// ────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 Migración SJ — ${DRY_RUN ? 'DRY RUN' : 'PRODUCCIÓN'}`);
  console.log(`📄 Archivo: ${EXCEL_FILE}\n`);

  if (!fs.existsSync(EXCEL_FILE)) {
    console.error(`❌ Archivo no encontrado: ${EXCEL_FILE}`);
    process.exit(1);
  }

  const workbook = XLSX.readFile(EXCEL_FILE);
  const allUsers = new Map();
  let totalRows = 0;
  let duplicates = 0;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    console.log(`📋 Hoja "${sheetName}": ${rows.length} filas`);

    for (const row of rows) {
      const user = rowToUser(row, sheetName);
      if (!user) {
        console.warn(`  ⚠️  Fila sin CURP válido — saltada`);
        continue;
      }
      totalRows++;
      if (allUsers.has(user.curp)) {
        duplicates++;
        const existing = allUsers.get(user.curp);
        if (user.marcaTemporal > existing.marcaTemporal) {
          console.log(`  🔄 Duplicado CURP ${user.curp} — se conserva el más reciente (${sheetName})`);
          allUsers.set(user.curp, user);
        } else {
          console.log(`  🔄 Duplicado CURP ${user.curp} — se conserva el existente (${existing.sheetName})`);
        }
      } else {
        allUsers.set(user.curp, user);
      }
    }
  }

  const users = Array.from(allUsers.values());
  console.log(`\n📊 Resumen de parsing:`);
  console.log(`  Total filas procesadas : ${totalRows}`);
  console.log(`  Duplicados resueltos   : ${duplicates}`);
  console.log(`  Registros únicos       : ${users.length}`);

  if (DRY_RUN) {
    console.log('\n✅ Dry run completado — ningún dato fue enviado a Supabase.\n');
    console.log('Muestra de los primeros 3 registros:');
    users.slice(0, 3).forEach(u => console.log(JSON.stringify(u, null, 2)));
    return;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error('❌ Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const user of users) {
    const email = `${user.curp}@sj.internal`.toLowerCase();
    const { marcaTemporal: _mt, sheetName: _sn, ...profileData } = user;

    try {
      let uid;
      const existing = await findUserByEmail(supabase, email);
      if (existing) {
        uid = existing.id;
        updated++;
        console.log(`  🔄 Actualizado: ${user.curp}`);
      } else {
        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password: DEFAULT_PASSWORD,
          email_confirm: true,
          user_metadata: { curp: user.curp },
        });
        if (error) throw error;
        uid = data.user.id;
        created++;
        console.log(`  ✅ Creado: ${user.curp} → uid: ${uid}`);
      }

      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert({
          id: uid,
          ...profileData,
          updatedAt: new Date().toISOString(),
        }, { onConflict: 'id' });
      if (upsertErr) throw upsertErr;

    } catch (err) {
      errors++;
      console.error(`  ❌ Error con CURP ${user.curp}: ${err.message}`);
    }
  }

  console.log(`\n🏁 Migración completada:`);
  console.log(`  Creados  : ${created}`);
  console.log(`  Actualizados: ${updated}`);
  console.log(`  Errores  : ${errors}`);
  console.log(`\nContraseña temporal asignada: "${DEFAULT_PASSWORD}"`);
  console.log('Los participantes deberán cambiarla en su primer acceso.\n');
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
