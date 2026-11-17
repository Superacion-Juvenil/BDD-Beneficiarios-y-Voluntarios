import { useState } from 'react';
import {
  CATEGORIAS, EVALUACIONES, NIVELES,
  evaluacionesParaUsuario, evaluacionesDeCoordinador,
  nivelDePrograma, getEvaluacion, totalCampos,
} from '../evaluaciones';
import { claveSeguimiento, faltaParaClave } from '../lib/claveSeguimiento';
import { saveEvaluacionDeUsuario } from '../hooks/useUser';
import { EvalRespuestas } from './EvalRespuestas';
import { EvalForm } from './EvalForm';
import { Button } from './ui/Button';

const BRAND_COLOR = '#1A56A4';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

function Tarjeta({ ev, resp, acciones, children }) {
  const cat = CATEGORIAS[ev.category] || {};
  const done = Boolean(resp?.completedAt);
  return (
    <details
      style={{
        background: 'white', borderRadius: '10px',
        border: '1px solid #E5E7EB',
        borderLeft: `4px solid ${cat.color || BRAND_COLOR}`,
        overflow: 'hidden',
      }}
    >
      <summary style={{
        padding: '14px 16px', cursor: 'pointer',
        listStyle: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
        <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem', flex: 1 }}>
          {ev.title}
          <span style={{ fontWeight: 400, color: '#9CA3AF', marginLeft: '6px', fontSize: '0.78rem' }}>
            {ev.codigo}
          </span>
        </span>
        {done ? (
          <span style={{
            background: '#D1FAE5', color: '#065F46', borderRadius: '999px',
            fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px',
          }}>✓ {formatDate(resp.completedAt)}</span>
        ) : (
          <span style={{
            background: '#F3F4F6', color: '#6B7280', borderRadius: '999px',
            fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px',
          }}>Pendiente</span>
        )}
      </summary>
      <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F3F4F6' }}>
        {acciones}
        {children}
      </div>
    </details>
  );
}

export function AdminUserEvals({ userData, onUpdated }) {
  const [editando, setEditando] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState(userData.evaluaciones || {});
  const [error, setError] = useState('');

  const propias = evaluacionesParaUsuario(userData);
  const deCoordinador = evaluacionesDeCoordinador(userData);
  const clave = claveSeguimiento(userData);
  const falta = faltaParaClave(userData);
  const nivel = nivelDePrograma(userData.programa);

  // Respuestas guardadas que ya no corresponden a ninguna evaluación vigente.
  const idsVigentes = new Set(EVALUACIONES.map(e => e.id));
  const historicas = Object.keys(evaluaciones).filter(id => !idsVigentes.has(id));

  async function guardarCoordinador(evalId, answers, claveSujeto) {
    const updated = await saveEvaluacionDeUsuario(
      userData.id || userData.uid, evalId, answers, claveSujeto, evaluaciones
    );
    setEvaluaciones(updated);
    if (onUpdated) onUpdated(updated);
  }

  if (editando) {
    const evActual = getEvaluacion(editando);
    return (
      <EvalForm
        evalId={editando}
        userData={{ ...userData, evaluaciones }}
        sujeto={userData}
        onSave={async (id, answers, c) => {
          try {
            await guardarCoordinador(id, answers, c);
          } catch (e) {
            setError(e.message || 'No se pudo guardar.');
            throw e;
          }
        }}
        onBack={() => setEditando(null)}
      />
    );
  }

  return (
    <div>
      {/* Clave de seguimiento */}
      <div style={{
        background: clave ? '#F3F4F6' : '#FEF9C3',
        border: `1px solid ${clave ? '#E5E7EB' : '#FDE68A'}`,
        borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>Clave de seguimiento</span>
        {clave
          ? <code style={{
              fontSize: '0.92rem', fontWeight: 700, color: '#111827', letterSpacing: '0.04em',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}>{clave}</code>
          : <span style={{ fontSize: '0.82rem', color: '#854D0E' }}>{falta}</span>}
        <span style={{ fontSize: '0.75rem', color: '#9CA3AF', marginLeft: 'auto' }}>
          {nivel ? `Nivel ${NIVELES[nivel].label}` : 'Sin nivel (programa fuera de Secundaria/Prepa/Universitarios)'}
        </span>
      </div>

      {error && (
        <div role="alert" style={{
          background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px',
          padding: '10px 14px', color: '#DC2626', fontSize: '0.85rem', marginBottom: '12px',
        }}>{error}</div>
      )}

      {propias.length === 0 && deCoordinador.length === 0 && historicas.length === 0 && (
        <p style={{ color: '#6B7280', padding: '16px 0' }}>
          No hay evaluaciones aplicables para este usuario.
        </p>
      )}

      {/* Las que responde el participante */}
      {propias.length > 0 && (
        <>
          <h3 style={{ margin: '0 0 10px', fontSize: '0.86rem', color: '#374151' }}>
            Responde el participante
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {propias.map(ev => {
              const resp = evaluaciones[ev.id];
              return (
                <Tarjeta key={ev.id} ev={ev} resp={resp}>
                  {resp?.completedAt
                    ? <EvalRespuestas ev={ev} resp={resp} />
                    : <p style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '10px' }}>
                        Sin responder. {totalCampos(ev)} respuestas · ~{ev.estimatedMinutes} min.
                      </p>}
                </Tarjeta>
              );
            })}
          </div>
        </>
      )}

      {/* Las que llena el coordinador */}
      {deCoordinador.length > 0 && (
        <>
          <h3 style={{ margin: '0 0 10px', fontSize: '0.86rem', color: '#374151' }}>
            Llena el coordinador
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {deCoordinador.map(ev => {
              const resp = evaluaciones[ev.id];
              return (
                <Tarjeta
                  key={ev.id}
                  ev={ev}
                  resp={resp}
                  acciones={
                    <div style={{ paddingTop: '12px' }}>
                      <Button onClick={() => setEditando(ev.id)}>
                        {resp?.completedAt ? 'Editar evaluación' : 'Llenar evaluación'}
                      </Button>
                    </div>
                  }
                >
                  {resp?.completedAt && <EvalRespuestas ev={ev} resp={resp} />}
                </Tarjeta>
              );
            })}
          </div>
        </>
      )}

      {/* Respuestas de evaluaciones ya retiradas del catálogo */}
      {historicas.length > 0 && (
        <>
          <h3 style={{ margin: '0 0 10px', fontSize: '0.86rem', color: '#374151' }}>
            Histórico (evaluaciones anteriores)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {historicas.map(id => {
              const resp = evaluaciones[id];
              return (
                <details key={id} style={{
                  background: 'white', borderRadius: '10px',
                  border: '1px solid #E5E7EB', borderLeft: '4px solid #9CA3AF', overflow: 'hidden',
                }}>
                  <summary style={{
                    padding: '14px 16px', cursor: 'pointer', listStyle: 'none',
                    display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>🗂</span>
                    <span style={{ fontWeight: 700, color: '#6B7280', fontSize: '0.9rem', flex: 1 }}>{id}</span>
                    <span style={{
                      background: '#F3F4F6', color: '#6B7280', borderRadius: '999px',
                      fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px',
                    }}>{formatDate(resp?.completedAt)}</span>
                  </summary>
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F3F4F6' }}>
                    <EvalRespuestas ev={null} resp={resp} />
                  </div>
                </details>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
