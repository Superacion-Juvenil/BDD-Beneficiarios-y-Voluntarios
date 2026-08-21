import * as XLSX from 'xlsx';
import { calcAge, isMinor, formatFechaNac } from './curp';

const BRAND = '1A56A4';

function fullName(u) {
  return [u.nombre, u.apellidoPaterno, u.apellidoMaterno].filter(Boolean).join(' ');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function download(wb, filename) {
  XLSX.writeFile(wb, filename, { compression: true });
}

function styleHeader(ws, cols) {
  if (!ws['!cols']) ws['!cols'] = cols.map(c => ({ wch: c }));
  else ws['!cols'] = cols.map((c, i) => ({ wch: c, ...(ws['!cols'][i] || {}) }));
}

function sheetFromRows(headers, rows, widths) {
  const aoa = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  if (widths) styleHeader(ws, widths);
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  return ws;
}

function addSheet(wb, name, ws) {
  const safe = name.replace(/[\[\]\:\*\?\/\\]/g, '-').slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safe || 'Hoja');
}

// ─── Report: Directorio general ──────────────────────────
export function reporteDirectorio(users) {
  const wb = XLSX.utils.book_new();
  const byPrograma = new Map();
  for (const u of users) {
    const k = (u.programa || 'Sin programa').trim() || 'Sin programa';
    if (!byPrograma.has(k)) byPrograma.set(k, []);
    byPrograma.get(k).push(u);
  }
  const headers = ['CURP', 'Nombre', 'Apellido Paterno', 'Apellido Materno', 'Edad', 'Sexo',
    'Correo', 'Teléfono', 'Municipio', 'Distrito', 'Tipo', 'Estado', 'Programa'];
  const widths = [22, 20, 20, 20, 6, 8, 30, 14, 18, 16, 14, 12, 20];

  // Resumen
  const resumen = [
    ['Reporte', 'Directorio general'],
    ['Fecha', today()],
    ['Total registros', users.length],
    [],
    ['Programa', 'Registros'],
    ...[...byPrograma.entries()].map(([k, v]) => [k, v.length]),
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
  styleHeader(wsResumen, [22, 20]);
  addSheet(wb, 'Resumen', wsResumen);

  const programas = [...byPrograma.keys()].sort();
  for (const p of programas) {
    const rows = byPrograma.get(p).map(u => [
      u.curp || '', u.nombre || '', u.apellidoPaterno || '', u.apellidoMaterno || '',
      calcAge(u.fechaNacimiento) ?? '', u.sexo || '',
      u.correo || '', u.telefono || '',
      u.municipio || '', u.distrito || '',
      u.tipoParticipante || '', u.status || '', u.programa || '',
    ]);
    addSheet(wb, p, sheetFromRows(headers, rows, widths));
  }

  download(wb, `Directorio_${today()}.xlsx`);
}

// ─── Report: Menores de edad con datos de padres ─────────
export function reporteMenores(users) {
  const menores = users.filter(u => isMinor(u.fechaNacimiento));
  const wb = XLSX.utils.book_new();
  const headers = ['CURP', 'Nombre completo', 'Edad', 'Programa', 'Distrito',
    'Nombre del padre', 'Teléfono del padre', 'Correo del padre',
    'Nombre de la madre', 'Teléfono de la madre', 'Correo de la madre',
    'Teléfono de casa', 'Alergias', 'Talla playera', 'Seguro médico',
    'Tutor (nombre)', 'Tutor (teléfono)', 'Tutor (correo)'];
  const widths = [22, 30, 6, 18, 16, 24, 14, 26, 24, 14, 26, 14, 20, 12, 20, 24, 14, 26];
  const rows = menores.map(u => [
    u.curp || '', fullName(u), calcAge(u.fechaNacimiento) ?? '',
    u.programa || '', u.distrito || '',
    u.nombrePadre || '', u.telefonoPadre || '', u.correoPadre || '',
    u.nombreMadre || '', u.telefonoMadre || '', u.correoMadre || '',
    u.telefonoCasa || '', u.alergias || '', u.tallaPlayera || '', u.seguroMedico || '',
    u.tutorNombre || '', u.tutorTelefono || '', u.tutorCorreo || '',
  ]);
  addSheet(wb, 'Menores de edad', sheetFromRows(headers, rows, widths));
  download(wb, `Menores_${today()}.xlsx`);
}

// ─── Report: Documentación pendiente ─────────────────────
export function reporteDocumentacion(users) {
  const wb = XLSX.utils.book_new();
  const headers = ['CURP', 'Nombre', 'Programa', 'Distrito', 'Correo', 'Teléfono'];
  const widths = [22, 30, 20, 16, 30, 14];

  const filtros = [
    { key: 'terminos', label: 'Sin Términos', filter: u => !u.docTerminos },
    { key: 'carta', label: 'Sin Carta responsiva', filter: u => !u.docCartaResponsiva },
    { key: 'roble', label: 'Sin Fundación Roble', filter: u => !u.docCapacitacionPASI },
    { key: 'todos', label: 'Sin ningún doc', filter: u => !u.docTerminos && !u.docCartaResponsiva && !u.docCapacitacionPASI },
  ];

  const resumen = [
    ['Reporte', 'Documentación pendiente'],
    ['Fecha', today()],
    ['Total registros', users.length],
    [],
    ['Categoría', 'Personas'],
    ...filtros.map(f => [f.label, users.filter(f.filter).length]),
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
  styleHeader(wsResumen, [22, 20]);
  addSheet(wb, 'Resumen', wsResumen);

  for (const f of filtros) {
    const rows = users.filter(f.filter).map(u => [
      u.curp || '', fullName(u), u.programa || '', u.distrito || '',
      u.correo || '', u.telefono || '',
    ]);
    addSheet(wb, f.label, sheetFromRows(headers, rows, widths));
  }
  download(wb, `Documentacion_pendiente_${today()}.xlsx`);
}

// ─── Report: Sin capacitación Fundación Roble ────────────
export function reporteSinRoble(users) {
  const sinRoble = users.filter(u => !u.docCapacitacionPASI);
  const wb = XLSX.utils.book_new();
  const headers = ['CURP', 'Nombre', 'Programa', 'Distrito', 'Tipo', 'Correo', 'Teléfono'];
  const widths = [22, 30, 20, 16, 14, 30, 14];
  const rows = sinRoble.map(u => [
    u.curp || '', fullName(u), u.programa || '', u.distrito || '',
    u.tipoParticipante || '', u.correo || '', u.telefono || '',
  ]);
  addSheet(wb, 'Sin Fundación Roble', sheetFromRows(headers, rows, widths));
  download(wb, `Sin_capacitacion_Roble_${today()}.xlsx`);
}

// ─── Report: Beneficiarios / Voluntarios ────────────────
export function reportePorTipo(users, tipo) {
  const filtrados = users.filter(u => u.tipoParticipante === tipo);
  const wb = XLSX.utils.book_new();
  const isBenef = tipo === 'Beneficiario';
  const headers = isBenef
    ? ['CURP', 'Nombre', 'Edad', 'Programa', 'Distrito', 'Escuela', 'Grado', 'Carrera', 'Correo', 'Teléfono', 'Estado']
    : ['CURP', 'Nombre', 'Edad', 'Programa', 'Distrito', 'Ocupación', 'Empresa', 'Voluntariado externo', 'Correo', 'Teléfono', 'Estado'];
  const widths = [22, 30, 6, 20, 16, 24, 14, 20, 30, 14, 12];
  const rows = filtrados.map(u => [
    u.curp || '', fullName(u), calcAge(u.fechaNacimiento) ?? '',
    u.programa || '', u.distrito || '',
    isBenef ? (u.escuela || '') : (u.ocupacion || ''),
    isBenef ? (u.gradoEscolar || '') : (u.empresa || ''),
    isBenef ? (u.carrera || '') : (u.voluntariadoExterno || ''),
    u.correo || '', u.telefono || '', u.status || '',
  ]);
  addSheet(wb, tipo + 's', sheetFromRows(headers, rows, widths));
  download(wb, `${tipo}s_${today()}.xlsx`);
}

// ─── Report: Estadísticas globales ──────────────────────
function countMap(items, getKey) {
  const map = new Map();
  for (const it of items) {
    const k = (getKey(it) || '').toString().trim();
    if (!k) continue;
    map.set(k, (map.get(k) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function sexOf(u) {
  const s = (u.sexo || '').toLowerCase().trim();
  if (s.startsWith('h')) return 'Hombre';
  if (s.startsWith('m') || s.startsWith('f')) return 'Mujer';
  return 'Sin dato';
}

export function reporteEstadisticas(users) {
  const wb = XLSX.utils.book_new();
  const total = users.length;
  const benef = users.filter(u => u.tipoParticipante === 'Beneficiario').length;
  const vol = users.filter(u => u.tipoParticipante === 'Voluntario').length;
  const activos = users.filter(u => (u.status || 'Activo') === 'Activo').length;
  const menores = users.filter(u => isMinor(u.fechaNacimiento)).length;
  const docsCompletos = users.filter(u => u.docTerminos && u.docCartaResponsiva && u.docCapacitacionPASI).length;
  const sinRoble = users.filter(u => !u.docCapacitacionPASI).length;
  const H = users.filter(u => sexOf(u) === 'Hombre').length;
  const M = users.filter(u => sexOf(u) === 'Mujer').length;

  const resumen = [
    ['Estadísticas globales', ''],
    ['Fecha del reporte', today()],
    [],
    ['Indicador', 'Valor'],
    ['Total participantes', total],
    ['Beneficiarios', benef],
    ['Voluntarios', vol],
    ['Activos', activos],
    ['Hombres', H],
    ['Mujeres', M],
    ['Menores de edad', menores],
    ['Docs completos', docsCompletos],
    ['Sin capacitación Fundación Roble', sinRoble],
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
  styleHeader(wsResumen, [36, 12]);
  addSheet(wb, 'Resumen', wsResumen);

  function sheetCount(title, entries) {
    const aoa = [[title, 'Cantidad'], ...entries];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    styleHeader(ws, [30, 12]);
    return ws;
  }

  addSheet(wb, 'Por programa', sheetCount('Programa', countMap(users, u => u.programa)));
  addSheet(wb, 'Por distrito', sheetCount('Distrito', countMap(users, u => u.distrito)));
  addSheet(wb, 'Por municipio', sheetCount('Municipio', countMap(users, u => u.municipio)));
  addSheet(wb, 'Por escuela', sheetCount('Escuela', countMap(users.filter(u => u.tipoParticipante === 'Beneficiario'), u => u.escuela)));
  addSheet(wb, 'Por carrera', sheetCount('Carrera', countMap(users.filter(u => u.tipoParticipante === 'Beneficiario'), u => u.carrera)));
  addSheet(wb, 'Por ocupación', sheetCount('Ocupación', countMap(users.filter(u => u.tipoParticipante === 'Voluntario'), u => u.ocupacion)));
  addSheet(wb, 'Por grado escolar', sheetCount('Grado', countMap(users, u => u.gradoEscolar)));
  addSheet(wb, 'Por sexo', sheetCount('Sexo', countMap(users, u => sexOf(u))));

  download(wb, `Estadisticas_${today()}.xlsx`);
}
