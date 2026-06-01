export const EVENT_TYPES = [
  { id: 'verano-mision',      label: 'Verano en Misión',             icon: '🌅', color: '#D4537E' },
  { id: 'dignidad-accion',    label: 'Dignidad en Acción',           icon: '🤝', color: '#1A56A4' },
  { id: 'retiro-anual',       label: 'Retiro Anual',                 icon: '🏞️', color: '#1a7a45' },
  { id: 'campamento',         label: 'Campamento',                   icon: '⛺', color: '#BA7517' },
  { id: 'carrera-vivamus',    label: 'Carrera Vivamus',              icon: '🏃', color: '#993556' },
  { id: 'conferencia-verano', label: 'Conferencia de Verano',        icon: '🎤', color: '#7c3aed' },
  { id: 'actividad-mh',       label: 'Actividad de mujeres/hombres', icon: '👥', color: '#0891b2' },
  { id: 'otro',               label: 'Otro',                         icon: '📅', color: '#6b7a99' },
];

export function newEventId() {
  return `ev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function eventDisplayName(ev) {
  if (ev.tipo === 'otro') return ev.nombreCustom || 'Otro evento';
  return EVENT_TYPES.find(t => t.id === ev.tipo)?.label || 'Evento';
}

export function eventTypeInfo(tipoId) {
  return EVENT_TYPES.find(t => t.id === tipoId) || { id: tipoId, label: tipoId, icon: '📅', color: '#6b7a99' };
}

export function formatFechaDisplay(fecha) {
  if (!fecha) return '';
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}
