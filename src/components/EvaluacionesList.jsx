import { CATEGORIAS, evaluacionesParaUsuario, totalCampos } from '../evaluaciones';
import { claveSeguimiento, faltaParaClave } from '../lib/claveSeguimiento';

const BRAND_COLOR = '#1A56A4';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

function CategoryBadge({ category }) {
  const cat = CATEGORIAS[category];
  if (!cat) return null;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '999px',
      fontSize: '0.72rem', fontWeight: 600,
      color: cat.color, background: cat.bg,
    }}>
      {cat.label}
    </span>
  );
}

export function EvaluacionesList({ userData, onOpen }) {
  const evalList = evaluacionesParaUsuario(userData);
  const evals = userData.evaluaciones || {};
  const clave = claveSeguimiento(userData);
  const falta = faltaParaClave(userData);

  return (
    <div>
      {/* Intro card */}
      <div style={{
        background: '#E8F0FB', border: `1px solid #c5d8f5`, borderRadius: '10px',
        padding: '16px 20px', marginBottom: '20px',
        display: 'flex', alignItems: 'flex-start', gap: '12px',
      }}>
        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>📝</span>
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: BRAND_COLOR, fontSize: '0.95rem' }}>Mis evaluaciones</p>
          <p style={{ margin: '4px 0 0', color: '#374151', fontSize: '0.84rem' }}>
            Estas evaluaciones nos ayudan a conocerte mejor y a brindarte el apoyo que necesitas. Respóndelas con sinceridad; tus respuestas son confidenciales.
          </p>
        </div>
      </div>

      {/* Clave de seguimiento asignada por la plataforma */}
      <div style={{
        background: clave ? '#F3F4F6' : '#FEF9C3',
        border: `1px solid ${clave ? '#E5E7EB' : '#FDE68A'}`,
        borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>Tu clave de seguimiento</span>
          {clave
            ? <code style={{
                fontSize: '0.95rem', fontWeight: 700, color: '#111827', letterSpacing: '0.04em',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}>{clave}</code>
            : <span style={{ fontSize: '0.83rem', color: '#854D0E' }}>{falta}</span>}
        </div>
        <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#6B7280' }}>
          La asigna la plataforma y se guarda sola con cada respuesta: no tienes que escribirla.
        </p>
      </div>

      {evalList.length === 0 && (
        <p style={{ color: '#6B7280', textAlign: 'center', padding: '32px 0' }}>
          No hay evaluaciones disponibles para tu perfil en este momento.
          {!userData.programa && ' Elige tu programa en la pestaña "Programa" para que aparezcan las de tu nivel.'}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {evalList.map(ev => {
          const cat = CATEGORIAS[ev.category] || {};
          const resp = evals[ev.id];
          const done = Boolean(resp?.completedAt);

          return (
            <div
              key={ev.id}
              onClick={() => onOpen(ev.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onOpen(ev.id)}
              style={{
                background: 'white', borderRadius: '10px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                borderLeft: `4px solid ${cat.color || BRAND_COLOR}`,
                padding: '16px 20px', cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                display: 'flex', alignItems: 'flex-start', gap: '14px',
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
              <span style={{ fontSize: '1.5rem', lineHeight: 1, flexShrink: 0, marginTop: '2px' }}>{cat.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>{ev.title}</span>
                  <span style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600 }}>{ev.codigo}</span>
                  {done ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: '#D1FAE5', color: '#065F46', borderRadius: '999px',
                      fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
                    }}>✓ Completada</span>
                  ) : (
                    <span style={{
                      background: '#FEF9C3', color: '#854D0E', borderRadius: '999px',
                      fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
                    }}>Pendiente</span>
                  )}
                </div>
                <p style={{ margin: '0 0 6px', color: '#6B7280', fontSize: '0.83rem', lineHeight: 1.4 }}>{ev.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '0.78rem', color: '#9CA3AF' }}>
                  <span>📋 {totalCampos(ev)} respuestas</span>
                  <span>⏱ ~{ev.estimatedMinutes} min</span>
                  <CategoryBadge category={ev.category} />
                  {done && <span>Completada el {formatDate(resp.completedAt)} · Toca para ver o editar</span>}
                </div>
              </div>
              <span style={{ color: '#9CA3AF', fontSize: '1.1rem', flexShrink: 0, alignSelf: 'center' }}>→</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
