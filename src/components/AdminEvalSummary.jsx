import { useState, useEffect, useMemo } from 'react';
import { EVALUACIONES, CATEGORIAS, evaluacionesParaUsuario } from '../evaluaciones';
import { getAllUsers } from '../hooks/useUser';
import { Spinner } from './ui/Spinner';
import { Alert } from './ui/Alert';

const BRAND_COLOR = '#1A56A4';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ProgressBar({ pct, color }) {
  return (
    <div style={{
      height: '8px', borderRadius: '999px', background: '#E5E7EB', overflow: 'hidden', margin: '8px 0',
    }}>
      <div style={{
        height: '100%', borderRadius: '999px',
        background: color || BRAND_COLOR,
        width: `${Math.min(pct, 100)}%`,
        transition: 'width 0.4s ease',
      }} />
    </div>
  );
}

export function AdminEvalSummary() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    return EVALUACIONES.map(ev => {
      const applies = users.filter(u => evaluacionesParaUsuario(u).some(e => e.id === ev.id));
      const completed = applies.filter(u => (u.evaluaciones || {})[ev.id]?.completedAt);
      const pct = applies.length > 0 ? Math.round((completed.length / applies.length) * 100) : 0;
      return { ev, applies, completed, pct };
    });
  }, [users]);

  if (loading) return <Spinner />;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>📝 Resumen de evaluaciones</h2>
        <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '0.85rem' }}>
          Vista general del avance de los participantes en cada evaluación.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {stats.map(({ ev, applies, completed, pct }) => {
          const cat = CATEGORIAS[ev.category] || {};
          const isOpen = expanded === ev.id;

          return (
            <div
              key={ev.id}
              style={{
                background: 'white', borderRadius: '10px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                borderLeft: `4px solid ${cat.color || BRAND_COLOR}`,
                overflow: 'hidden',
              }}
            >
              {/* Summary row */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0 }}>{cat.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>{ev.title}</span>
                      <span style={{ fontWeight: 700, color: cat.color || BRAND_COLOR, fontSize: '0.9rem' }}>
                        {completed.length} / {applies.length} ({pct}%)
                      </span>
                    </div>
                    <p style={{ margin: '2px 0 8px', color: '#6B7280', fontSize: '0.8rem' }}>
                      {cat.label} · {ev.questions.length} preguntas
                    </p>
                    <ProgressBar pct={pct} color={cat.color} />
                  </div>
                </div>

                {/* Expand toggle */}
                {completed.length > 0 && (
                  <button
                    onClick={() => setExpanded(isOpen ? null : ev.id)}
                    style={{
                      marginTop: '8px', background: 'none', border: 'none',
                      color: BRAND_COLOR, fontSize: '0.8rem', cursor: 'pointer',
                      padding: 0, fontWeight: 600,
                    }}
                  >
                    {isOpen ? '▲ Ocultar respuestas' : `▼ Ver ${completed.length} respuesta${completed.length !== 1 ? 's' : ''}`}
                  </button>
                )}
              </div>

              {/* Expanded: list of users who responded */}
              {isOpen && (
                <div style={{ borderTop: '1px solid #F3F4F6', padding: '0 20px 16px' }}>
                  {completed.map(u => {
                    const resp = (u.evaluaciones || {})[ev.id];
                    const name = [u.nombre, u.apellidoPaterno, u.apellidoMaterno].filter(Boolean).join(' ') || u.curp || '—';
                    return (
                      <details key={u.uid} style={{ marginTop: '12px', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.86rem', color: '#111827', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>👤 {name}</span>
                          <span style={{ color: '#6B7280', fontWeight: 400, fontSize: '0.78rem' }}>
                            {formatDate(resp?.completedAt)}
                          </span>
                        </summary>
                        <div style={{ paddingTop: '10px', paddingLeft: '8px' }}>
                          {ev.questions.map((q, idx) => {
                            const ans = resp?.answers?.[q.id];
                            const display = Array.isArray(ans) ? ans.join(', ') : (ans !== null && ans !== undefined ? String(ans) : '—');
                            return (
                              <div key={q.id} style={{ marginBottom: '8px' }}>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>
                                  {idx + 1}. {q.question}
                                </p>
                                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#111827' }}>{display || '—'}</p>
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
