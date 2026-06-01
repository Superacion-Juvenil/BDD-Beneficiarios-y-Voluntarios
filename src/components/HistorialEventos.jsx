import { useState, useMemo } from 'react';
import { EVENT_TYPES, eventDisplayName, eventTypeInfo, formatFechaDisplay } from '../eventos';
import { Alert } from './ui/Alert';

export function HistorialEventos({ users, onUpdate, onDelete }) {
  const [filterTipo, setFilterTipo] = useState('');
  const [filterAnio, setFilterAnio] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [editingId, setEditingId] = useState(null); // ev id
  const [editingText, setEditingText] = useState('');
  const [status, setStatus] = useState('');

  // Flatten all event records with user info
  const allRecords = useMemo(() => {
    const records = [];
    for (const u of users) {
      for (const ev of (u.eventos || [])) {
        records.push({ user: u, ev });
      }
    }
    return records;
  }, [users]);

  const availableYears = useMemo(() => {
    const years = new Set(allRecords.map(r => r.ev.anio).filter(Boolean));
    return Array.from(years).sort((a, b) => b - a);
  }, [allRecords]);

  const filtered = useMemo(() => {
    return allRecords.filter(({ user: u, ev }) => {
      if (filterTipo && ev.tipo !== filterTipo) return false;
      if (filterAnio && String(ev.anio) !== filterAnio) return false;
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase();
        const name = `${u.nombre || ''} ${u.apellidoPaterno || ''} ${u.apellidoMaterno || ''}`.toLowerCase();
        const comment = (ev.comentarios || '').toLowerCase();
        const custom = (ev.nombreCustom || '').toLowerCase();
        if (!name.includes(q) && !(u.curp || '').toLowerCase().includes(q) && !comment.includes(q) && !custom.includes(q)) return false;
      }
      return true;
    });
  }, [allRecords, filterTipo, filterAnio, filterSearch]);

  // Group by tipo|fecha|nombreCustom
  const groups = useMemo(() => {
    const map = new Map();
    for (const r of filtered) {
      const key = `${r.ev.tipo}|${r.ev.fecha}|${r.ev.nombreCustom || ''}`;
      if (!map.has(key)) map.set(key, { key, ev: r.ev, records: [] });
      map.get(key).records.push(r);
    }
    return Array.from(map.values()).sort((a, b) => {
      if (b.ev.fecha > a.ev.fecha) return 1;
      if (b.ev.fecha < a.ev.fecha) return -1;
      return 0;
    });
  }, [filtered]);

  async function handleEditSave(uid, evId) {
    try {
      await onUpdate(uid, evId, editingText.trim());
      setStatus('✓ Comentario actualizado');
      setEditingId(null);
    } catch (e) {
      setStatus('Error: ' + e.message);
    }
  }

  async function handleDelete(uid, evId, name) {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      await onDelete(uid, evId);
      setStatus('✓ Registro eliminado');
    } catch (e) {
      setStatus('Error: ' + e.message);
    }
  }

  return (
    <div>
      {status && (
        <div role="status" style={{ marginBottom: '12px' }}>
          <Alert type="success" onDismiss={() => setStatus('')}>{status}</Alert>
        </div>
      )}

      {/* Filtros */}
      <div style={{
        background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px',
        padding: '12px 16px', marginBottom: '16px',
        display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <select
          value={filterTipo}
          onChange={e => setFilterTipo(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: '7px', border: '1px solid #E5E7EB', fontSize: '0.85rem', background: 'white' }}
        >
          <option value="">Todos los tipos</option>
          {EVENT_TYPES.map(et => (
            <option key={et.id} value={et.id}>{et.icon} {et.label}</option>
          ))}
        </select>
        <select
          value={filterAnio}
          onChange={e => setFilterAnio(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: '7px', border: '1px solid #E5E7EB', fontSize: '0.85rem', background: 'white' }}
        >
          <option value="">Todos los años</option>
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <input
          type="search"
          value={filterSearch}
          onChange={e => setFilterSearch(e.target.value)}
          placeholder="Buscar..."
          style={{ flex: 1, minWidth: '160px', padding: '8px 10px', borderRadius: '7px', border: '1px solid #E5E7EB', fontSize: '0.85rem' }}
        />
      </div>

      <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '0 0 16px' }}>
        {filtered.length} registro{filtered.length !== 1 ? 's' : ''} · {groups.length} evento{groups.length !== 1 ? 's' : ''} único{groups.length !== 1 ? 's' : ''}
      </p>

      {groups.length === 0 && (
        <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '40px 0', fontSize: '0.9rem' }}>
          No hay registros que coincidan con los filtros.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {groups.map(({ key, ev, records }) => {
          const ti = eventTypeInfo(ev.tipo);
          const displayName = eventDisplayName(ev);
          return (
            <div key={key} style={{
              background: 'white', borderRadius: '10px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              overflow: 'hidden',
              borderLeft: `4px solid ${ti.color}`,
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
                  {ti.icon} {displayName}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '2px' }}>
                  📅 {formatFechaDisplay(ev.fecha)} · {records.length} participante{records.length !== 1 ? 's' : ''}
                </div>
              </div>
              {records.map(({ user: u, ev: evr }) => {
                const name = [u.nombre, u.apellidoPaterno, u.apellidoMaterno].filter(Boolean).join(' ');
                const isEditing = editingId === evr.id;
                return (
                  <div key={evr.id} style={{ padding: '12px 16px', borderBottom: '1px solid #F9FAFB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.87rem', color: '#111827' }}>👤 {name || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace' }}>{u.curp || '—'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          onClick={() => { setEditingId(evr.id); setEditingText(evr.comentarios || ''); }}
                          style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontSize: '0.78rem', color: '#374151' }}
                        >Editar</button>
                        <button
                          onClick={() => handleDelete(u.uid, evr.id, name)}
                          style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', fontSize: '0.78rem', color: '#DC2626' }}
                        >Eliminar</button>
                      </div>
                    </div>
                    {isEditing ? (
                      <div style={{ marginTop: '8px' }}>
                        <textarea
                          value={editingText}
                          onChange={e => setEditingText(e.target.value)}
                          rows={2}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #1A56A4', fontSize: '0.82rem', boxSizing: 'border-box', fontFamily: 'inherit' }}
                        />
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <button
                            onClick={() => handleEditSave(u.uid, evr.id)}
                            style={{ padding: '4px 12px', borderRadius: '6px', background: '#1A56A4', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.78rem' }}
                          >Guardar</button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{ padding: '4px 12px', borderRadius: '6px', background: 'white', border: '1px solid #E5E7EB', cursor: 'pointer', fontSize: '0.78rem' }}
                          >Cancelar</button>
                        </div>
                      </div>
                    ) : evr.comentarios ? (
                      <div style={{ marginTop: '6px', fontSize: '0.82rem', color: '#374151' }}>
                        💬 {evr.comentarios}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
