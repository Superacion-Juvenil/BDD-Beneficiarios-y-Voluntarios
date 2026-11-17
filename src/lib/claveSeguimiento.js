/**
 * Clave de seguimiento de un participante.
 *
 * La asigna la plataforma: los 4 primeros caracteres del CURP + "-" + el
 * programa al que pertenece. Ej.: CURP "HEPJ030110HNLRRNA1" + programa
 * "MJ Prepa"  →  "HEPJ-MJ Prepa".
 *
 * Los 4 primeros caracteres del CURP son las iniciales del nombre
 * (2 del apellido paterno, 1 del materno, 1 del nombre), así que la clave
 * identifica a la persona sin exponer su CURP completo ni su fecha de
 * nacimiento. Es estable mientras no cambie de programa; por eso cada
 * respuesta guarda la clave vigente al momento de responder.
 */
export function claveSeguimiento(user) {
  const curp = (user?.curp || '').trim().toUpperCase();
  if (curp.length < 4) return '';
  const base = curp.slice(0, 4);
  const programa = (user?.programa || '').trim();
  return programa ? `${base}-${programa}` : base;
}

/**
 * Explica por qué la clave está incompleta, para avisarlo en la interfaz.
 * Devuelve '' cuando la clave se pudo construir completa.
 */
export function faltaParaClave(user) {
  const curp = (user?.curp || '').trim();
  if (curp.length < 4) return 'Falta registrar el CURP.';
  if (!(user?.programa || '').trim()) return 'Falta elegir el programa.';
  return '';
}
