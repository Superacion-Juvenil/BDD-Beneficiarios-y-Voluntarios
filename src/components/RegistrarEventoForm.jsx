import { useState, useMemo } from 'react';
import { EVENT_TYPES, newEventId } from '../eventos';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';

const today = () => new Date().toISOString().slice(0, 10);

export function RegistrarEventoForm({ users, onRegister }) {
  const [tipo, setTipo] = useState('');
  const [nombreCustom, setNombreCustom] = useState('');
  const [fecha, setFecha] = useState(today());
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]); // [{ user, comentario }]
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const searchResults = useMemo(() => {
    if (search.trim().length < 2) return [];
    const q = search.toLowerCase();
    const selectedUids = new Set(selected.map(s => s.user.uid));
    return users.filter(u => {
      if (selectedUids.has(u.uid)) return false;
      const name = `${u.nombre || ''} ${u.apellidoPaterno || ''} ${u.apellidoMaterno || ''}`.toLowerCase();
      return (
        name.includes(q) ||
        (u.curp || '').toLowerCase().includes(q) ||
        (u.programa || '').toLowerCase().includes(q)
      );
    }).slice(0, 12);
  }, [search, users, selected]);

  function addUser(u) {
    setSelected(prev => [...prev, { user: u, comentario: '' }]);
    setSearch('');
  }

  function removeUser(uid) {
    setSelected(prev => prev.filter(s => s.user.uid !== uid));
  }

  function setComentario(uid, val) {
    setSelected(prev => prev.map(s => s.user.uid === uid ? { ...s, comentario: val } : s));
  }

  async function handleSave() {
    if (!tipo) { setError('Selecciona un tipo de evento.'); return; }
    if (tipo === 'otro' && !nombreCustom.trim()) { setError('Especifica el nombre del evento.'); return; }
    if (!fecha) { setError('Indica la fecha del evento.'); return; }
    if (selected.length === 0) { setError('Agrega al menos un participante.'); return; }
    setError('');
    setSaving(true);
    try {
      const anio = new Date(fecha + 'T00:00:00').getFullYear();
      const registradoEn = new Date().toISOString();
      const entries = selected.map(({ user, comentario }) => ({
        curp: user.uid,
        eventData: {
          id: newEventId(),
          tipo,
          nombreCustom: tipo === 'otro' ? nombreCustom.trim() : '',
          fecha,
          anio,
          comentarios: comentario.trim(),
          registradoEn,
        },
      }));
      await onRegister(entries);
      setTipo('');
      setNombreCustom('');
      setFecha(today());
      setSelected([]);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {error && <Alert type="error" onDismiss={() => setError('')} style={{ marginBottom: '16px' }}>{error}</Alert>}

      {/* Paso A: tipo */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ margin: '0 0 10px', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>Tipo de evento *</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
          {EVENT_TYPES.map(et => {
            const sel = tipo === et.id;
            return (
              <button
                key={et.id}
                onClick={() => setTipo(et.id)}
                style={{
                  padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                  border: sel ? `2px solid ${et.color}` : '2px solid #E5E7EB',
                  background: sel ? `${et.color}1a` : 'white',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '0.82rem', fontWeight: sel ? 600 : 400, color: sel ? et.color : '#374151',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{et.icon}</span>
                <span>{et.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tipo === 'otro' && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '6px' }}>
            Nombre del evento *
          </label>
          <input
            type="text"
            value={nombreCustom}
            onChange={e => setNombreCustom(e.target.value)}
            placeholder="Ej: Taller de oración, Posada, etc."
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.88rem', boxSizing: 'border-box' }}
          />
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '6px' }}>
          Fecha del evento *
        </label>
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.88rem' }}
        />
      </div>

      {/* Paso B: participantes */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ margin: '0 0 10px', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>Buscar y agregar participantes</p>
        <div style={{ position: 'relative' }}>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, CURP o programa..."
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.88rem', boxSizing: 'border-box' }}
          />
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
              background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '260px', overflowY: 'auto',
            }}>
              {searchResults.map(u => {
                const name = [u.nombre, u.apellidoPaterno, u.apellidoMaterno].filter(Boolean).join(' ');
                const initials = [u.nombre?.[0], u.apellidoPaterno?.[0]].filter(Boolean).join('').toUpperCase() || '?';
                return (
                  <button
                    key={u.uid}
                    onClick={() => addUser(u)}
                    style={{
                      width: '100%', padding: '10px 14px', border: 'none', background: 'transparent',
                      cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px',
                      borderBottom: '1px solid #F3F4F6',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', background: '#1A56A4',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                    }}>{initials}</div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem', color: '#111827' }}>{name || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace' }}>
                        {u.curp || '—'} · {u.programa || '—'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selected.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ margin: '0 0 10px', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
            Seleccionados ({selected.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selected.map(({ user: u, comentario }) => {
              const name = [u.nombre, u.apellidoPaterno, u.apellidoMaterno].filter(Boolean).join(' ');
              return (
                <div key={u.uid} style={{
                  border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px',
                  background: '#FAFAFA',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem', color: '#111827' }}>{name || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace' }}>{u.curp || '—'}</div>
                    </div>
                    <button
                      onClick={() => removeUser(u.uid)}
                      aria-label={`Quitar a ${name} de la lista`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '1rem', padding: '4px 8px' }}
                    >✕</button>
                  </div>
                  <textarea
                    value={comentario}
                    onChange={e => setComentario(u.uid, e.target.value)}
                    placeholder="Comentarios sobre la participación (opcional)..."
                    rows={2}
                    style={{
                      width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5E7EB',
                      fontSize: '0.82rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Paso C */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : `Guardar evento${selected.length > 0 ? ` (${selected.length})` : ''}`}
        </Button>
        {selected.length > 0 && (
          <Button variant="secondary" onClick={() => setSelected([])}>Limpiar participantes</Button>
        )}
      </div>
    </div>
  );
}
