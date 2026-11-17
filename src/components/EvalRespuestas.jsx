import { ESCALAS } from '../evaluaciones';

/** Texto legible de una respuesta simple (no grid). */
export function textoRespuesta(q, ans) {
  if (ans === null || ans === undefined || ans === '') return '—';
  if (Array.isArray(ans)) return ans.length ? ans.join(', ') : '—';
  if (q?.type === 'scale') {
    const esc = ESCALAS[q.escala] || ESCALAS.intensidad5;
    if (!esc.labels) return `${ans} / ${esc.max}`;
    const label = esc.labels[ans - esc.min];
    return label ? `${ans} · ${label}` : String(ans);
  }
  return String(ans);
}

function GridRespuesta({ q, ans }) {
  const esc = ESCALAS[q.escala] || ESCALAS.intensidad5;
  const val = ans || {};
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4px' }}>
      <tbody>
        {q.rows.map((row, i) => {
          const v = val[row.id];
          const label = v === null || v === undefined
            ? '—'
            : (esc.labels ? (esc.labels[v - esc.min] || v) : v);
          return (
            <tr key={row.id} style={{ background: i % 2 === 0 ? '#F9FAFB' : 'white' }}>
              <td style={{ padding: '4px 8px', fontSize: '0.8rem', color: '#374151', lineHeight: 1.35 }}>
                {row.text}
              </td>
              <td style={{
                padding: '4px 8px', fontSize: '0.8rem', color: '#111827',
                fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right', width: '1%',
              }}>
                {v === null || v === undefined ? '—' : `${v} · ${label}`}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/**
 * Respuestas de una evaluación, en modo lectura.
 *
 * `ev` puede ser null cuando la respuesta guardada pertenece a una evaluación
 * que ya no está en el catálogo (p. ej. las anteriores a la actualización de
 * noviembre de 2026). En ese caso se muestran los datos crudos para no
 * perderlos de vista.
 */
export function EvalRespuestas({ ev, resp }) {
  const answers = resp?.answers || {};

  if (!ev) {
    const entradas = Object.entries(answers);
    if (entradas.length === 0) {
      return <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>Sin respuestas guardadas.</p>;
    }
    return (
      <div>
        <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: '#92400E' }}>
          Evaluación retirada del catálogo. Se muestran las respuestas tal como se guardaron.
        </p>
        {entradas.map(([k, v]) => (
          <div key={k} style={{ marginBottom: '8px' }}>
            <p style={{ margin: 0, fontSize: '0.76rem', color: '#6B7280', fontWeight: 600 }}>{k}</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#111827' }}>
              {Array.isArray(v)
                ? (v.length ? v.join(', ') : '—')
                : (typeof v === 'object' && v !== null
                    ? Object.entries(v).map(([rk, rv]) => `${rk}: ${rv}`).join(' · ')
                    : String(v ?? '—'))}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {ev.questions.map((q, idx) => (
        <div key={q.id} style={{ marginTop: '10px' }}>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
            {idx + 1}. {q.question}
          </p>
          {q.type === 'grid'
            ? <GridRespuesta q={q} ans={answers[q.id]} />
            : (
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#111827' }}>
                {textoRespuesta(q, answers[q.id])}
              </p>
            )}
        </div>
      ))}
    </div>
  );
}
