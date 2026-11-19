import { useState } from 'react';
import { EVALUACIONES, CATEGORIAS, NIVELES, totalCampos } from '../evaluaciones';
import { EvalForm } from './EvalForm';

const BRAND = '#1A56A4';

/** A quién le aparece la evaluación, en una frase. */
function quienLaVe(ev) {
  const a = ev.applies || {};
  if (a.audiencia === 'coordinador') return 'La llena el coordinador desde la ficha del servidor';

  const partes = [];
  if (a.nivel) {
    const programas = [...NIVELES[a.nivel].programas, ...(a.programasExtra || [])];
    partes.push(`${NIVELES[a.nivel].label} (${programas.join(', ')})`);
  }
  if (a.programa?.length) partes.push(a.programa.join(', '));
  if (a.tipo?.length) partes.push(a.tipo.length === 1 ? `${a.tipo[0]}s` : a.tipo.join(' y '));
  return partes.join(' · ') || 'Todos los participantes';
}

/** Agrupa el catálogo por nivel, dejando al final las que no son de nivel. */
function porGrupo() {
  const grupos = new Map();
  for (const clave of Object.keys(NIVELES)) grupos.set(NIVELES[clave].label, []);
  grupos.set('Servidores y voluntarios', []);

  for (const ev of EVALUACIONES) {
    const destino = ev.applies?.nivel ? NIVELES[ev.applies.nivel].label : 'Servidores y voluntarios';
    grupos.get(destino).push(ev);
  }
  return [...grupos.entries()].filter(([, lista]) => lista.length > 0);
}

export function AdminEvalPreview() {
  const [abierta, setAbierta] = useState(null);

  if (abierta) {
    return <EvalForm evalId={abierta} preview onBack={() => setAbierta(null)} />;
  }

  return (
    <div>
      <div style={{
        background: '#E8F0FB', border: '1px solid #c5d8f5', borderRadius: '10px',
        padding: '14px 18px', marginBottom: '20px',
        display: 'flex', alignItems: 'flex-start', gap: '12px',
      }}>
        <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>👁</span>
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: BRAND, fontSize: '0.93rem' }}>
            Vista previa de las evaluaciones
          </p>
          <p style={{ margin: '4px 0 0', color: '#374151', fontSize: '0.83rem', lineHeight: 1.45 }}>
            Abre cualquier cuestionario en blanco, tal como lo ve el participante. Puedes marcar
            respuestas para probarlo: no se guarda nada ni se altera el expediente de nadie.
          </p>
        </div>
      </div>

      {porGrupo().map(([grupo, lista]) => (
        <div key={grupo} style={{ marginBottom: '24px' }}>
          <h3 style={{
            margin: '0 0 10px', fontSize: '0.88rem', color: '#374151',
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{grupo}</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {lista.map(ev => {
              const cat = CATEGORIAS[ev.category] || {};
              return (
                <div
                  key={ev.id}
                  onClick={() => setAbierta(ev.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setAbierta(ev.id)}
                  style={{
                    background: 'white', borderRadius: '10px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    borderLeft: `4px solid ${cat.color || BRAND}`,
                    padding: '14px 18px', cursor: 'pointer',
                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.13)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                  }}
                >
                  <span style={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0, marginTop: '2px' }}>
                    {cat.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.93rem' }}>
                        {ev.title}
                      </span>
                      <span style={{ color: '#9CA3AF', fontSize: '0.74rem', fontWeight: 600 }}>
                        {ev.codigo}
                      </span>
                      <span style={{
                        padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem',
                        fontWeight: 600, color: cat.color, background: cat.bg,
                      }}>{cat.label}</span>
                    </div>
                    <p style={{ margin: '4px 0 6px', color: '#6B7280', fontSize: '0.82rem', lineHeight: 1.4 }}>
                      {ev.description}
                    </p>
                    <div style={{
                      display: 'flex', gap: '12px', flexWrap: 'wrap',
                      fontSize: '0.76rem', color: '#9CA3AF',
                    }}>
                      <span>📋 {ev.questions.length} preguntas · {totalCampos(ev)} respuestas</span>
                      <span>⏱ ~{ev.estimatedMinutes} min</span>
                      <span>👥 {quienLaVe(ev)}</span>
                    </div>
                  </div>
                  <span style={{ color: '#9CA3AF', fontSize: '1.1rem', flexShrink: 0, alignSelf: 'center' }}>→</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
