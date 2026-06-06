import { CATEGORIAS, evaluacionesParaUsuario } from '../evaluaciones';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function AdminUserEvals({ userData }) {
  const evalList = evaluacionesParaUsuario(userData);
  const evals = userData.evaluaciones || {};

  if (evalList.length === 0) {
    return <p style={{ color: '#6B7280', padding: '16px 0' }}>No hay evaluaciones aplicables para este usuario.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {evalList.map(ev => {
        const cat = CATEGORIAS[ev.category] || {};
        const resp = evals[ev.id];
        const done = Boolean(resp?.completedAt);

        return (
          <details
            key={ev.id}
            style={{
              background: 'white', borderRadius: '10px',
              border: '1px solid #E5E7EB',
              borderLeft: `4px solid ${cat.color || '#1A56A4'}`,
              overflow: 'hidden',
            }}
          >
            <summary style={{
              padding: '14px 16px', cursor: done ? 'pointer' : 'default',
              listStyle: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
              <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem', flex: 1 }}>{ev.title}</span>
              {done ? (
                <span style={{
                  background: '#D1FAE5', color: '#065F46', borderRadius: '999px',
                  fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px',
                }}>
                  ✓ {formatDate(resp.completedAt)}
                </span>
              ) : (
                <span style={{
                  background: '#F3F4F6', color: '#6B7280', borderRadius: '999px',
                  fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px',
                }}>
                  Pendiente
                </span>
              )}
            </summary>

            {done && (
              <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F3F4F6' }}>
                {ev.questions.map((q, idx) => {
                  const ans = resp.answers?.[q.id];
                  const display = Array.isArray(ans) ? ans.join(', ') : (ans !== null && ans !== undefined ? String(ans) : '—');
                  return (
                    <div key={q.id} style={{ marginTop: '10px' }}>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
                        {idx + 1}. {q.question}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#111827' }}>{display || '—'}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </details>
        );
      })}
    </div>
  );
}
