import { useState } from 'react';
import { eventDisplayName, eventTypeInfo, formatFechaDisplay } from '../eventos';
import { Alert } from './ui/Alert';

export function UserEventsList({ userData, onUpdate, onDelete }) {
  const eventos = [...(userData.eventos || [])].sort((a, b) => {
    if (b.fecha > a.fecha) return 1;
    if (b.fecha < a.fecha) return -1;
    return 0;
  });

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [status, setStatus] = useState('');

  async function handleEditSave(evId) {
    try {
      await onUpdate(evId, editingText.trim());
      setStatus('✓ Comentario actualizado');
      setEditingId(null);
    } catch (e) {
      setStatus('Error: ' + e.message);
    }
  }

  async function handleDelete(evId) {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      await onDelete(evId);
      setStatus('✓ Registro eliminado');
    } catch (e) {
      setStatus('Error: ' + e.message);
    }
  }

  if (eventos.length === 0) {
    return (
      <Alert type="info">
        Este participante no tiene eventos registrados. Ve a la sección <strong>Eventos</strong> del menú lateral para registrar uno.
      </Alert>
    );
  }

  return (
    <div>
      {status && (
        <div role="status" style={{ marginBottom: '12px' }}>
          <Alert type="success" onDismiss={() => setStatus('')}>{status}</Alert>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {eventos.map(ev => {
          const ti = eventTypeInfo(ev.tipo);
          const isEditing = editingId === ev.id;
          return (
            <div key={ev.id} style={{
              border: '1px solid #E5E7EB', borderRadius: '8px',
              borderLeft: `4px solid ${ti.color}`,
              padding: '12px 14px', background: 'white',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.87rem', color: '#111827' }}>
                    {ti.icon} {eventDisplayName(ev)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                    📅 {formatFechaDisplay(ev.fecha)} · {ev.anio}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => { setEditingId(ev.id); setEditingText(ev.comentarios || ''); }}
                    style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontSize: '0.78rem', color: '#374151' }}
                  >Editar</button>
                  <button
                    onClick={() => handleDelete(ev.id)}
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
                      onClick={() => handleEditSave(ev.id)}
                      style={{ padding: '4px 12px', borderRadius: '6px', background: '#1A56A4', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.78rem' }}
                    >Guardar</button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{ padding: '4px 12px', borderRadius: '6px', background: 'white', border: '1px solid #E5E7EB', cursor: 'pointer', fontSize: '0.78rem' }}
                    >Cancelar</button>
                  </div>
                </div>
              ) : ev.comentarios ? (
                <div style={{ marginTop: '6px', fontSize: '0.82rem', color: '#374151' }}>
                  💬 {ev.comentarios}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
