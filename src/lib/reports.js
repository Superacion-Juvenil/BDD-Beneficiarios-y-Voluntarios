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
function sexOf(u) {
  const s = (u.sexo || '').toLowerCase().trim();
  if (s.startsWith('h')) return 'Hombre';
  if (s.startsWith('m') || s.startsWith('f')) return 'Mujer';
  return 'Sin dato';
}

/** Conteo de un grupo separado por sexo. */
function porSexo(items) {
  const c = { Hombre: 0, Mujer: 0, 'Sin dato': 0 };
  for (const it of items) c[sexOf(it)] += 1;
  return c;
}

/**
 * Agrupa por categoría y separa hombres y mujeres dentro de cada una.
 * Devuelve las filas ordenadas por total y si alguien quedó sin sexo: la
 * columna "Sin dato" sólo se dibuja cuando hace falta, porque el sexo se
 * deriva del CURP y en la práctica siempre viene.
 */
function countMapBySex(items, getKey) {
  const map = new Map();
  for (const it of items) {
    const k = (getKey(it) || '').toString().trim();
    if (!k) continue;
    if (!map.has(k)) map.set(k, { Hombre: 0, Mujer: 0, 'Sin dato': 0 });
    map.get(k)[sexOf(it)] += 1;
  }
  const filas = [...map.entries()]
    .map(([clave, c]) => ({ clave, ...c, total: c.Hombre + c.Mujer + c['Sin dato'] }))
    .sort((a, b) => b.total - a.total || a.clave.localeCompare(b.clave, 'es'));
  return { filas, haySinDato: filas.some(f => f['Sin dato'] > 0) };
}

/** Encabezados y anchos según se necesite o no la columna "Sin dato". */
function columnasSexo(titulo, haySinDato) {
  return haySinDato
    ? { headers: [titulo, 'Hombres', 'Mujeres', 'Sin dato', 'Total'], widths: [30, 10, 10, 10, 10] }
    : { headers: [titulo, 'Hombres', 'Mujeres', 'Total'], widths: [30, 10, 10, 10] };
}

function filaSexo(etiqueta, c, haySinDato) {
  const total = c.Hombre + c.Mujer + c['Sin dato'];
  return haySinDato
    ? [etiqueta, c.Hombre, c.Mujer, c['Sin dato'], total]
    : [etiqueta, c.Hombre, c.Mujer, total];
}

function sheetCountBySex(titulo, { filas, haySinDato }) {
  const { headers, widths } = columnasSexo(titulo, haySinDato);
  const aoa = [headers, ...filas.map(f => filaSexo(f.clave, f, haySinDato))];

  // Fila de totales, para que la hoja cuadre sola.
  const suma = k => filas.reduce((s, f) => s + f[k], 0);
  aoa.push(filaSexo('Total', {
    Hombre: suma('Hombre'), Mujer: suma('Mujer'), 'Sin dato': suma('Sin dato'),
  }, haySinDato));

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  styleHeader(ws, widths);
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  return ws;
}

/**
 * Conteo simple, sin abrir por sexo. Lo usa la hoja "Por sexo", donde cruzar
 * sexo contra sí mismo daría una matriz diagonal que no dice nada.
 */
function sheetCountSimple(titulo, conteo) {
  const filas = [['Hombres', conteo.Hombre], ['Mujeres', conteo.Mujer]];
  if (conteo['Sin dato'] > 0) filas.push(['Sin dato', conteo['Sin dato']]);
  const total = conteo.Hombre + conteo.Mujer + conteo['Sin dato'];
  const ws = XLSX.utils.aoa_to_sheet([[titulo, 'Cantidad'], ...filas, ['Total', total]]);
  styleHeader(ws, [30, 12]);
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  return ws;
}

export function reporteEstadisticas(users) {
  const wb = XLSX.utils.book_new();
  const beneficiarios = users.filter(u => u.tipoParticipante === 'Beneficiario');
  const voluntarios = users.filter(u => u.tipoParticipante === 'Voluntario');

  // Cada indicador del resumen también se abre en hombres y mujeres.
  const indicadores = [
    ['Total participantes', users],
    ['Beneficiarios', beneficiarios],
    ['Voluntarios', voluntarios],
    ['Activos', users.filter(u => (u.status || 'Activo') === 'Activo')],
    ['Menores de edad', users.filter(u => isMinor(u.fechaNacimiento))],
    ['Mayores de edad', users.filter(u => !isMinor(u.fechaNacimiento))],
    ['Docs completos', users.filter(u => u.docTerminos && u.docCartaResponsiva && u.docCapacitacionPASI)],
    ['Sin capacitación Fundación Roble', users.filter(u => !u.docCapacitacionPASI)],
  ].map(([etiqueta, lista]) => [etiqueta, porSexo(lista)]);

  const haySinDato = indicadores.some(([, c]) => c['Sin dato'] > 0);
  const { headers, widths } = columnasSexo('Indicador', haySinDato);

  const resumen = [
    ['Estadísticas globales', ''],
    ['Fecha del reporte', today()],
    [],
    headers,
    ...indicadores.map(([etiqueta, c]) => filaSexo(etiqueta, c, haySinDato)),
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
  styleHeader(wsResumen, [36, ...widths.slice(1)]);
  addSheet(wb, 'Resumen', wsResumen);

  addSheet(wb, 'Por programa', sheetCountBySex('Programa', countMapBySex(users, u => u.programa)));
  addSheet(wb, 'Por distrito', sheetCountBySex('Distrito', countMapBySex(users, u => u.distrito)));
  addSheet(wb, 'Por municipio', sheetCountBySex('Municipio', countMapBySex(users, u => u.municipio)));
  addSheet(wb, 'Por escuela', sheetCountBySex('Escuela', countMapBySex(beneficiarios, u => u.escuela)));
  addSheet(wb, 'Por carrera', sheetCountBySex('Carrera', countMapBySex(beneficiarios, u => u.carrera)));
  addSheet(wb, 'Por ocupación', sheetCountBySex('Ocupación', countMapBySex(voluntarios, u => u.ocupacion)));
  addSheet(wb, 'Por grado escolar', sheetCountBySex('Grado', countMapBySex(users, u => u.gradoEscolar)));
  addSheet(wb, 'Por sexo', sheetCountSimple('Sexo', porSexo(users)));

  download(wb, `Estadisticas_${today()}.xlsx`);
}
