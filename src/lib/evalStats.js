/**
 * Análisis de las respuestas de evaluaciones.
 *
 * Todo aquí es cálculo puro sobre los perfiles: no toca Supabase ni Excel, y
 * `reports.js` lo usa para armar el reporte descargable.
 *
 * El avance se mide sobre el bloque de habilidades, que la evaluación de
 * ingreso (E1) y la de cierre (E2) del mismo nivel hacen con los mismos
 * renglones y la misma escala de frecuencia 1–6. Restar el promedio de cierre
 * menos el de ingreso da el avance de esa persona en esa área.
 *
 * ADVERTENCIA DE LECTURA: son respuestas autoinformadas en escala Likert, sin
 * prueba estadística. Las diferencias describen lo que el grupo reporta, no
 * prueban que el programa haya causado el cambio, y con pocos casos se mueven
 * mucho por azar. Por eso cada corte lleva su `n` y los de menos de
 * `N_MINIMO` casos se marcan como muestra insuficiente.
 */
import { AREAS_HABILIDADES, areaDeRenglon, nivelDePrograma, NIVELES } from '../evaluaciones';
import { claveSeguimiento } from './claveSeguimiento';

/** Debajo de este número de casos no se interpreta un promedio. */
export const N_MINIMO = 5;

/** Escala de frecuencia del bloque de habilidades. */
export const ESCALA_MIN = 1;
export const ESCALA_MAX = 6;

/** Cortes de dominio sobre la escala 1–6, aplicados al promedio de cierre. */
export const CORTES_DOMINIO = [
  { desde: 5.0, etiqueta: 'Consolidado' },
  { desde: 4.0, etiqueta: 'En desarrollo alto' },
  { desde: 3.0, etiqueta: 'En desarrollo' },
  { desde: 0,   etiqueta: 'Incipiente' },
];

/** Cortes de cambio, en puntos de la escala 1–6. */
export const CORTES_CAMBIO = [
  { desde: 0.75,  etiqueta: 'Avance claro' },
  { desde: 0.25,  etiqueta: 'Avance moderado' },
  { desde: -0.25, etiqueta: 'Sin cambio relevante' },
  { desde: -99,   etiqueta: 'Retroceso: revisar' },
];

export function promedio(nums) {
  const v = (nums || []).filter(n => typeof n === 'number' && Number.isFinite(n));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

export function redondear(n, d = 2) {
  if (n === null || n === undefined || !Number.isFinite(n)) return null;
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

export function nivelDeDominio(prom) {
  if (prom === null || prom === undefined) return '';
  return (CORTES_DOMINIO.find(c => prom >= c.desde) || {}).etiqueta || '';
}

export function lecturaCambio(delta, n) {
  if (delta === null || delta === undefined) return 'Sin datos';
  if (n !== undefined && n < N_MINIMO) return 'Muestra insuficiente';
  return (CORTES_CAMBIO.find(c => delta >= c.desde) || {}).etiqueta || '';
}

/** Promedio de cualquier grid numérico, p. ej. el desempeño d1…d8 de la E4B. */
function promedioBloque(respuestaGrid) {
  if (!respuestaGrid || typeof respuestaGrid !== 'object') return null;
  return promedio(Object.values(respuestaGrid));
}

/**
 * Promedio del bloque de habilidades. Sólo cuenta los renglones que mapean a
 * un área conocida: si quedara una clave suelta de una versión anterior del
 * cuestionario, no debe alterar el promedio ni el avance de nadie.
 */
function promedioHabilidades(respuestaGrid) {
  if (!respuestaGrid || typeof respuestaGrid !== 'object') return null;
  return promedio(
    Object.entries(respuestaGrid)
      .filter(([rowId]) => areaDeRenglon(rowId))
      .map(([, valor]) => valor)
  );
}

/** Valor por área de un bloque de habilidades. */
function porAreaBloque(respuestaGrid) {
  const out = {};
  if (!respuestaGrid || typeof respuestaGrid !== 'object') return out;
  for (const [rowId, valor] of Object.entries(respuestaGrid)) {
    const area = areaDeRenglon(rowId);
    if (area && typeof valor === 'number') out[area] = valor;
  }
  return out;
}

/** Etapa del participante en su paso por SJ, según lo que ha respondido. */
function etapaDe(tipo, ev, nivel) {
  if (tipo === 'Voluntario') {
    if (ev.e4b) return 'Servicio evaluado por coordinador';
    if (ev.e4a) return 'Autoevaluación de servicio';
    if (ev.e3b) return 'Sirvió en evento';
    return 'Sin evaluaciones';
  }
  if (!nivel) return 'Programa sin nivel asignado';
  if (ev.e5) return 'Graduado';
  if (ev.e1 && ev.e2) return 'Ciclo cerrado';
  if (ev.e1) return 'En ciclo (diagnóstico hecho)';
  if (ev.e3) return 'Sólo evaluación de evento';
  return 'Sin evaluaciones';
}

/** Orden de las etapas para la hoja de paso por SJ. */
export const ORDEN_ETAPAS = [
  'Sin evaluaciones',
  'Programa sin nivel asignado',
  'Sólo evaluación de evento',
  'En ciclo (diagnóstico hecho)',
  'Ciclo cerrado',
  'Graduado',
  'Sirvió en evento',
  'Autoevaluación de servicio',
  'Servicio evaluado por coordinador',
];

/**
 * Análisis de un participante: qué respondió, en qué etapa va y cuánto
 * avanzó en cada área entre el ingreso y el cierre.
 */
export function analizarUsuario(u) {
  const tipo = u.tipoParticipante || u.tipo || 'Beneficiario';
  const nivel = nivelDePrograma(u.programa);
  const todas = u.evaluaciones || {};

  const ev = {
    e1: nivel ? todas[`e1-${nivel}`] : null,
    e2: nivel ? todas[`e2-${nivel}`] : null,
    e3: nivel ? todas[`e3-evento-${nivel}`] : null,
    e5: nivel ? todas[`e5-graduados-${nivel}`] : null,
    e3b: todas['e3-evento-equipo'],
    e4a: todas['e4-autoevaluacion-servidores'],
    e4b: todas['e4-coordinador-servidor'],
  };

  const gridIngreso = ev.e1?.answers?.habilidades;
  const gridCierre = ev.e2?.answers?.habilidades;
  const gridServicio = ev.e4a?.answers?.habilidades;

  const ingreso = porAreaBloque(gridIngreso);
  const cierre = porAreaBloque(gridCierre);
  const servicio = porAreaBloque(gridServicio);

  const porArea = {};
  for (const area of AREAS_HABILIDADES) {
    const a = ingreso[area] ?? null;
    const b = cierre[area] ?? null;
    porArea[area] = {
      ingreso: a,
      cierre: b,
      delta: a !== null && b !== null ? b - a : null,
      servicio: servicio[area] ?? null,
    };
  }

  const promIngreso = promedioHabilidades(gridIngreso);
  const promCierre = promedioHabilidades(gridCierre);
  const promServicio = promedioHabilidades(gridServicio);

  // La evaluación del coordinador usa escala de desempeño 1–4, así que no se
  // puede restar directo contra la autoevaluación 1–6. Ambas se llevan a
  // porcentaje de su propia escala para poder compararlas.
  const promCoordinador = promedioBloque(ev.e4b?.answers?.desempeno);
  const pctServicio = promServicio === null ? null : (promServicio - 1) / (ESCALA_MAX - 1);
  const pctCoordinador = promCoordinador === null ? null : (promCoordinador - 1) / (4 - 1);

  return {
    uid: u.id || u.uid,
    clave: ev.e2?.clave || ev.e1?.clave || ev.e4a?.clave || claveSeguimiento(u),
    nombre: [u.nombre, u.apellidoPaterno, u.apellidoMaterno].filter(Boolean).join(' ') || u.curp || '—',
    curp: u.curp || '',
    sexo: u.sexo || '',
    programa: u.programa || '',
    nivel,
    nivelLabel: nivel ? NIVELES[nivel].label : '',
    tipo,
    distrito: u.distrito || '',
    status: u.status || 'Activo',
    ev,
    completadas: Object.entries(ev).filter(([, r]) => r?.completedAt).map(([k]) => k),
    etapa: etapaDe(tipo, ev, nivel),
    porArea,
    promIngreso,
    promCierre,
    delta: promIngreso !== null && promCierre !== null ? promCierre - promIngreso : null,
    promServicio,
    promCoordinador,
    // Diferencia en puntos porcentuales entre cómo se ve el servidor y cómo
    // lo ve su coordinador. Positivo = el servidor se califica más alto.
    brechaServicio: pctServicio !== null && pctCoordinador !== null
      ? (pctServicio - pctCoordinador) * 100
      : null,
  };
}

/** Promedio de ingreso, cierre y avance de un área sobre un grupo. */
export function agregarArea(analisis, area) {
  const pares = analisis
    .map(a => a.porArea[area])
    .filter(x => x && x.ingreso !== null && x.cierre !== null);
  const soloCierre = analisis
    .map(a => a.porArea[area])
    .filter(x => x && x.cierre !== null);

  const promIngreso = promedio(pares.map(x => x.ingreso));
  const promCierre = promedio(pares.map(x => x.cierre));
  const deltas = pares.map(x => x.delta);

  return {
    area,
    n: pares.length,
    nCierre: soloCierre.length,
    promIngreso,
    promCierre,
    delta: promIngreso !== null && promCierre !== null ? promCierre - promIngreso : null,
    mejoraron: deltas.filter(d => d > 0).length,
    igual: deltas.filter(d => d === 0).length,
    bajaron: deltas.filter(d => d < 0).length,
    // Nivel actual que reporta el grupo, aunque no tenga evaluación de ingreso.
    promActual: promedio(soloCierre.map(x => x.cierre)),
  };
}

/** Las 12 áreas agregadas sobre un grupo, ordenadas de mayor a menor avance. */
export function resumenPorArea(analisis) {
  return AREAS_HABILIDADES
    .map(area => agregarArea(analisis, area))
    .sort((a, b) => (b.delta ?? -99) - (a.delta ?? -99));
}

/** "+1.00 puntos", "-0.74 puntos", "+1.00 punto" según corresponda. */
function puntos(delta) {
  const v = Math.abs(delta).toFixed(2);
  const signo = delta >= 0 ? '+' : '-';
  return `${signo}${v} ${v === '1.00' ? 'punto' : 'puntos'}`;
}

/** Frase de interpretación de un área, con el `n` siempre a la vista. */
export function interpretarArea(fila) {
  if (fila.n === 0) {
    return fila.nCierre > 0
      ? 'Sólo hay evaluación de cierre: no se puede medir avance sin el diagnóstico de ingreso.'
      : 'Sin respuestas suficientes.';
  }
  if (fila.n < N_MINIMO) {
    return `Sólo ${fila.n} caso(s) con ingreso y cierre: no alcanza para interpretar el promedio.`;
  }
  const lectura = lecturaCambio(fila.delta, fila.n);
  const dominio = nivelDeDominio(fila.promCierre);
  const pctMejora = Math.round((fila.mejoraron / fila.n) * 100);
  const quienSubio = fila.mejoraron === 0
    ? 'nadie subió'
    : `${pctMejora}% subió (${fila.mejoraron} de ${fila.n})`;

  if (lectura === 'Retroceso: revisar') {
    return `El grupo se califica ${Math.abs(fila.delta).toFixed(2)} puntos por debajo de su propio ingreso. `
      + `Hoy el área está en "${dominio}" y ${fila.bajaron} de ${fila.n} bajaron. `
      + `Conviene revisar qué pasó aquí este ciclo antes de sacar conclusiones.`;
  }
  if (lectura === 'Sin cambio relevante') {
    return `Prácticamente sin movimiento (${puntos(fila.delta)}). `
      + `El grupo llegaba en "${nivelDeDominio(fila.promIngreso)}" y sigue en "${dominio}": `
      + `${quienSubio} y ${fila.bajaron} bajaron.`;
  }
  return `${lectura}: ${puntos(fila.delta)}, de ${redondear(fila.promIngreso)} a ${redondear(fila.promCierre)}. `
    + `${quienSubio}. Hoy el área está en "${dominio}".`;
}

/** Las áreas más fuertes y las más débiles del grupo, por nivel actual. */
export function fortalezasYRetos(filas) {
  const conDato = filas.filter(f => f.promActual !== null && f.nCierre >= N_MINIMO);
  const porNivel = [...conDato].sort((a, b) => b.promActual - a.promActual);
  return {
    fortalezas: porNivel.slice(0, 3),
    retos: porNivel.slice(-3).reverse(),
    conDato: conDato.length,
  };
}

/** Conteo de participantes por etapa del paso por SJ. */
export function conteoEtapas(analisis) {
  const map = new Map(ORDEN_ETAPAS.map(e => [e, 0]));
  for (const a of analisis) map.set(a.etapa, (map.get(a.etapa) || 0) + 1);
  return [...map.entries()]
    .filter(([, n]) => n > 0)
    .map(([etapa, n]) => ({ etapa, n }));
}
