import * as XLSX from 'xlsx';
import { calcAge, isMinor, formatFechaNac } from './curp';
import { AREAS_HABILIDADES, NIVELES, ESCALAS } from '../evaluaciones';
import {
  analizarUsuario, resumenPorArea, interpretarArea, fortalezasYRetos,
  conteoEtapas, ORDEN_ETAPAS, nivelDeDominio, lecturaCambio,
  promedio, redondear, N_MINIMO,
} from './evalStats';

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

// ─── Report: Evaluaciones y avance ───────────────────────

/** Etiqueta "4.21" o "—" para las celdas numéricas del reporte. */
function num(n) {
  const r = redondear(n);
  return r === null ? '—' : r;
}

function firmado(n) {
  const r = redondear(n);
  if (r === null) return '—';
  return r > 0 ? `+${r}` : String(r);
}

function pct(parte, total) {
  if (!total) return '—';
  return `${Math.round((parte / total) * 100)}%`;
}

/** Distribución de respuestas de un grid sobre una escala con etiquetas. */
function distribucionGrid(analisis, evalKey, questionId, escala) {
  const filas = new Map();
  for (const a of analisis) {
    const grid = a.ev[evalKey]?.answers?.[questionId];
    if (!grid) continue;
    for (const [rowId, valor] of Object.entries(grid)) {
      if (typeof valor !== 'number') continue;
      if (!filas.has(rowId)) filas.set(rowId, new Array(escala.labels.length).fill(0));
      const i = valor - escala.min;
      if (i >= 0 && i < escala.labels.length) filas.get(rowId)[i] += 1;
    }
  }
  return filas;
}

/** Net Promoter Score sobre respuestas 0–10. */
function calcularNPS(valores) {
  const v = valores.filter(n => typeof n === 'number');
  if (!v.length) return null;
  const prom = v.filter(n => n >= 9).length;
  const det = v.filter(n => n <= 6).length;
  return {
    n: v.length,
    promotores: prom,
    pasivos: v.length - prom - det,
    detractores: det,
    nps: Math.round(((prom - det) / v.length) * 100),
    media: promedio(v),
  };
}

function hojaResumen(wb, analisis, filasArea, { fortalezas, retos }) {
  const conCierre = analisis.filter(a => a.promCierre !== null);
  const conAmbas = analisis.filter(a => a.delta !== null);
  const deltaGlobal = promedio(conAmbas.map(a => a.delta));
  const subieron = conAmbas.filter(a => a.delta > 0).length;

  const participacion = [
    ['Diagnóstico de ingreso (E1)', analisis.filter(a => a.ev.e1).length],
    ['Cierre de ciclo (E2)', analisis.filter(a => a.ev.e2).length],
    ['Evento · participantes (E3A)', analisis.filter(a => a.ev.e3).length],
    ['Evento · equipo de servicio (E3B)', analisis.filter(a => a.ev.e3b).length],
    ['Autoevaluación de servidores (E4A)', analisis.filter(a => a.ev.e4a).length],
    ['Evaluación del coordinador (E4B)', analisis.filter(a => a.ev.e4b).length],
    ['Graduados (E5)', analisis.filter(a => a.ev.e5).length],
  ];

  const aoa = [
    ['Reporte de evaluaciones y avance'],
    ['Fecha', today()],
    ['Participantes en la base', analisis.length],
    [],
    ['PARTICIPACIÓN'],
    ['Evaluación', 'Respondidas', '% de la base'],
    ...participacion.map(([k, n]) => [k, n, pct(n, analisis.length)]),
    [],
    ['AVANCE GENERAL (escala de frecuencia 1 a 6)'],
    ['Con diagnóstico de ingreso y cierre', conAmbas.length],
    ['Promedio al ingreso', num(promedio(conAmbas.map(a => a.promIngreso)))],
    ['Promedio al cierre', num(promedio(conAmbas.map(a => a.promCierre)))],
    ['Avance promedio', firmado(deltaGlobal)],
    ['Participantes que subieron', `${subieron} de ${conAmbas.length} (${pct(subieron, conAmbas.length)})`],
    ['Lectura', lecturaCambio(deltaGlobal, conAmbas.length)],
    ['Nivel que reporta el grupo hoy', nivelDeDominio(promedio(conCierre.map(a => a.promCierre)))],
    [],
  ];

  if (fortalezas.length) {
    aoa.push(['ÁREAS MÁS FUERTES HOY', 'Promedio', 'Nivel']);
    for (const f of fortalezas) aoa.push([f.area, num(f.promActual), nivelDeDominio(f.promActual)]);
    aoa.push([]);
    aoa.push(['ÁREAS CON MÁS RETO HOY', 'Promedio', 'Nivel']);
    for (const f of retos) aoa.push([f.area, num(f.promActual), nivelDeDominio(f.promActual)]);
    aoa.push([]);
  }

  const mayorAvance = filasArea.filter(f => f.n >= N_MINIMO)[0];
  const menorAvance = [...filasArea].filter(f => f.n >= N_MINIMO).pop();
  if (mayorAvance) {
    aoa.push(['DÓNDE SE MOVIÓ MÁS Y MENOS']);
    aoa.push(['Mayor avance', mayorAvance.area, firmado(mayorAvance.delta)]);
    if (menorAvance && menorAvance !== mayorAvance) {
      aoa.push(['Menor avance', menorAvance.area, firmado(menorAvance.delta)]);
    }
    aoa.push([]);
  }

  aoa.push(['CÓMO LEER ESTE REPORTE']);
  for (const linea of [
    'El avance se mide sobre el bloque "Así soy hoy", que el diagnóstico de ingreso y la evaluación de cierre hacen con los mismos renglones y la misma escala de frecuencia (1 Nunca a 6 Siempre).',
    'Las respuestas son autoinformadas: describen cómo se ve cada participante, no una medición externa de su conducta.',
    'Las diferencias de este reporte son descriptivas. No hay prueba estadística detrás, así que no demuestran que el programa haya causado el cambio.',
    `Cualquier corte con menos de ${N_MINIMO} casos se marca como muestra insuficiente: con tan pocos datos el promedio se mueve demasiado por azar.`,
    'Niveles de dominio sobre el promedio de cierre: 5.0 o más Consolidado · 4.0 a 4.9 En desarrollo alto · 3.0 a 3.9 En desarrollo · menos de 3.0 Incipiente.',
    'Lectura del cambio: +0.75 o más Avance claro · +0.25 a +0.74 Avance moderado · entre -0.24 y +0.24 Sin cambio relevante · -0.25 o menos Retroceso.',
  ]) aoa.push([linea]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  styleHeader(ws, [46, 26, 20]);
  addSheet(wb, 'Resumen', ws);
}

function hojaPorArea(wb, filasArea) {
  const headers = ['Área', 'Con ingreso y cierre (n)', 'Promedio ingreso', 'Promedio cierre',
    'Avance', 'Subieron', 'Igual', 'Bajaron', '% que subió', 'Nivel hoy', 'Interpretación'];
  const rows = filasArea.map(f => [
    f.area, f.n, num(f.promIngreso), num(f.promCierre), firmado(f.delta),
    f.mejoraron, f.igual, f.bajaron, pct(f.mejoraron, f.n),
    f.n ? nivelDeDominio(f.promCierre) : '—',
    interpretarArea(f),
  ]);
  addSheet(wb, 'Avance por área',
    sheetFromRows(headers, rows, [30, 20, 16, 16, 10, 10, 8, 9, 12, 20, 100]));
}

function hojaAreaPorNivel(wb, analisis) {
  const headers = ['Nivel', 'Área', 'n', 'Promedio ingreso', 'Promedio cierre', 'Avance', 'Lectura'];
  const rows = [];
  for (const [clave, nivel] of Object.entries(NIVELES)) {
    const delNivel = analisis.filter(a => a.nivel === clave);
    if (!delNivel.length) continue;
    for (const f of resumenPorArea(delNivel)) {
      rows.push([nivel.label, f.area, f.n, num(f.promIngreso), num(f.promCierre),
        firmado(f.delta), lecturaCambio(f.delta, f.n)]);
    }
  }
  if (!rows.length) return;
  addSheet(wb, 'Áreas por nivel', sheetFromRows(headers, rows, [16, 30, 8, 16, 16, 10, 26]));
}

function hojaPasoPorSJ(wb, analisis) {
  const conteo = conteoEtapas(analisis);
  const aoa = [
    ['Paso por SJ'],
    ['Etapa en la que va cada participante, según las evaluaciones que ha respondido.'],
    [],
    ['Etapa', 'Participantes', '% de la base'],
    ...conteo.map(c => [c.etapa, c.n, pct(c.n, analisis.length)]),
    [],
    ['Clave', 'Nombre', 'Tipo', 'Programa', 'Nivel', 'Etapa',
      'E1 Ingreso', 'E2 Cierre', 'E3A Evento', 'E3B Equipo', 'E4A Servicio', 'E4B Coordinador', 'E5 Graduados'],
  ];
  const marca = r => (r?.completedAt ? '✓' : '');
  const ordenados = [...analisis].sort((a, b) =>
    ORDEN_ETAPAS.indexOf(b.etapa) - ORDEN_ETAPAS.indexOf(a.etapa)
    || a.nombre.localeCompare(b.nombre, 'es'));
  for (const a of ordenados) {
    aoa.push([a.clave, a.nombre, a.tipo, a.programa, a.nivelLabel, a.etapa,
      marca(a.ev.e1), marca(a.ev.e2), marca(a.ev.e3), marca(a.ev.e3b),
      marca(a.ev.e4a), marca(a.ev.e4b), marca(a.ev.e5)]);
  }
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  styleHeader(ws, [20, 28, 13, 16, 14, 30, 11, 11, 11, 11, 12, 14, 13]);
  addSheet(wb, 'Paso por SJ', ws);
}

function hojaPorParticipante(wb, analisis) {
  const conAmbas = analisis.filter(a => a.delta !== null)
    .sort((a, b) => b.delta - a.delta);
  if (!conAmbas.length) return;

  const headers = ['Clave', 'Nombre', 'Sexo', 'Programa', 'Nivel', 'Distrito',
    'Promedio ingreso', 'Promedio cierre', 'Avance', 'Nivel hoy', 'Lectura',
    'Área que más subió', 'Área que más bajó'];
  const rows = conAmbas.map(a => {
    const deltas = Object.entries(a.porArea)
      .filter(([, v]) => v.delta !== null)
      .sort((x, y) => y[1].delta - x[1].delta);
    const arriba = deltas[0];
    const abajo = deltas[deltas.length - 1];
    return [
      a.clave, a.nombre, a.sexo, a.programa, a.nivelLabel, a.distrito,
      num(a.promIngreso), num(a.promCierre), firmado(a.delta),
      nivelDeDominio(a.promCierre),
      // A nivel individual no aplica el mínimo de casos: es su propio dato.
      lecturaCambio(a.delta),
      arriba && arriba[1].delta > 0 ? `${arriba[0]} (${firmado(arriba[1].delta)})` : '—',
      abajo && abajo[1].delta < 0 ? `${abajo[0]} (${firmado(abajo[1].delta)})` : '—',
    ];
  });
  addSheet(wb, 'Avance por participante',
    sheetFromRows(headers, rows, [20, 28, 8, 16, 14, 16, 16, 16, 10, 20, 24, 30, 30]));
}

function hojaAvancePercibido(wb, analisis) {
  const escala = ESCALAS.avance4;
  const dist = distribucionGrid(analisis, 'e2', 'avance', escala);
  if (!dist.size) return;

  const textos = {
    a1: 'Tomar la iniciativa y cumplir mis compromisos',
    a2: 'Relacionarme y trabajar con otros',
    a3: 'Manejar mis emociones y resolver conflictos',
    a4: 'Servir y vivir mis valores',
  };
  const headers = ['Comparado con cuando entró…', ...escala.labels, 'Respuestas', '% que reporta mejora'];
  const rows = [];
  for (const [rowId, conteo] of dist) {
    const total = conteo.reduce((a, b) => a + b, 0);
    const mejoraron = conteo.slice(1).reduce((a, b) => a + b, 0);
    rows.push([textos[rowId] || rowId, ...conteo, total, pct(mejoraron, total)]);
  }
  addSheet(wb, 'Avance percibido',
    sheetFromRows(headers, rows, [44, 14, 15, 10, 14, 12, 22]));
}

function hojaSatisfaccion(wb, analisis) {
  const bloques = [
    ['Invitaría a un amigo al programa (E2 Prepa)', analisis.map(a => a.ev.e2?.answers?.nps)],
    ['Invitaría a un amigo al próximo evento (E3A)', analisis.map(a => a.ev.e3?.answers?.nps)],
    ['Recomendaría SJ a alguien de su edad (E5)', analisis.map(a => a.ev.e5?.answers?.nps)],
  ];
  const aoa = [
    ['Satisfacción y recomendación'],
    ['El NPS va de -100 a +100: porcentaje de promotores (9-10) menos el de detractores (0-6).'],
    [],
    ['Pregunta', 'Respuestas', 'Promedio 0-10', 'Promotores', 'Pasivos', 'Detractores', 'NPS'],
  ];
  let hayAlgo = false;
  for (const [titulo, valores] of bloques) {
    const r = calcularNPS(valores);
    if (!r) { aoa.push([titulo, 0, '—', '—', '—', '—', '—']); continue; }
    hayAlgo = true;
    aoa.push([titulo, r.n, num(r.media), r.promotores, r.pasivos, r.detractores, r.nps]);
  }

  // Satisfacción general del egreso (escala 1-5) y del servicio.
  const satEgreso = analisis.map(a => a.ev.e5?.answers?.satisfaccion).filter(n => typeof n === 'number');
  const satServicio = analisis.map(a => a.ev.e3b?.answers?.satisfaccion).filter(n => typeof n === 'number');
  aoa.push([]);
  aoa.push(['Escalas 1 a 5', 'Respuestas', 'Promedio']);
  aoa.push(['Satisfacción general con su paso por SJ (E5)', satEgreso.length, num(promedio(satEgreso))]);
  aoa.push(['Satisfacción con la experiencia de servicio (E3B)', satServicio.length, num(promedio(satServicio))]);
  if (!hayAlgo && !satEgreso.length && !satServicio.length) return;

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  styleHeader(ws, [46, 13, 15, 13, 10, 13, 10]);
  addSheet(wb, 'Satisfacción y NPS', ws);
}

function hojaServidores(wb, analisis) {
  const servidores = analisis.filter(a => a.ev.e4a || a.ev.e4b);
  if (!servidores.length) return;

  const aoa = [
    ['Servidores y voluntarios'],
    ['La autoevaluación usa escala de frecuencia 1-6 y la del coordinador escala de desempeño 1-4.'],
    ['Para poder compararlas, la brecha está en puntos porcentuales de cada escala.'],
    ['Brecha positiva = el servidor se califica más alto que su coordinador.'],
    [],
    ['Clave', 'Nombre', 'Programa', 'Autoevaluación (1-6)', 'Nivel', 'Coordinador (1-4)',
      'Brecha (puntos %)', 'Prioridad para la conversación 1 a 1'],
  ];
  const ordenados = [...servidores].sort((a, b) =>
    Math.abs(b.brechaServicio ?? -1) - Math.abs(a.brechaServicio ?? -1));
  for (const a of ordenados) {
    const brecha = a.brechaServicio;
    let prioridad = '—';
    if (brecha !== null) {
      const abs = Math.abs(brecha);
      if (abs >= 25) prioridad = brecha > 0 ? 'Alta: se ve mucho mejor de lo que lo ve su coordinador' : 'Alta: se subestima frente a lo que ve su coordinador';
      else if (abs >= 12) prioridad = brecha > 0 ? 'Media: se califica por encima de su coordinador' : 'Media: se califica por debajo de su coordinador';
      else prioridad = 'Baja: lecturas alineadas';
    } else if (a.ev.e4a && !a.ev.e4b) prioridad = 'Falta la evaluación del coordinador';
    else if (!a.ev.e4a && a.ev.e4b) prioridad = 'Falta su autoevaluación';

    aoa.push([a.clave, a.nombre, a.programa,
      num(a.promServicio), a.promServicio !== null ? nivelDeDominio(a.promServicio) : '—',
      num(a.promCoordinador),
      brecha === null ? '—' : firmado(brecha),
      prioridad]);
  }

  // Promedio por área de la autoevaluación de servicio.
  const conServicio = servidores.filter(a => a.promServicio !== null);
  if (conServicio.length) {
    aoa.push([]);
    aoa.push(['Autoevaluación de servicio por área', 'Respuestas', 'Promedio (1-6)', 'Nivel']);
    const filas = AREAS_HABILIDADES.map(area => {
      const vals = conServicio.map(a => a.porArea[area]?.servicio).filter(n => typeof n === 'number');
      return { area, n: vals.length, prom: promedio(vals) };
    }).sort((a, b) => (b.prom ?? -1) - (a.prom ?? -1));
    for (const f of filas) aoa.push([f.area, f.n, num(f.prom), f.prom !== null ? nivelDeDominio(f.prom) : '—']);
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  styleHeader(ws, [20, 28, 16, 20, 20, 18, 17, 46]);
  addSheet(wb, 'Servidores', ws);
}

export function reporteEvaluaciones(users) {
  const analisis = users.map(analizarUsuario);
  const filasArea = resumenPorArea(analisis);

  const wb = XLSX.utils.book_new();
  hojaResumen(wb, analisis, filasArea, fortalezasYRetos(filasArea));
  hojaPorArea(wb, filasArea);
  hojaAreaPorNivel(wb, analisis);
  hojaPasoPorSJ(wb, analisis);
  hojaPorParticipante(wb, analisis);
  hojaAvancePercibido(wb, analisis);
  hojaSatisfaccion(wb, analisis);
  hojaServidores(wb, analisis);

  download(wb, `Evaluaciones_avance_${today()}.xlsx`);
}
