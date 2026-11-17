import { useState, useRef, useEffect } from 'react';
import { EVALUACIONES, CATEGORIAS, ESCALAS, totalCampos } from '../evaluaciones';
import { claveSeguimiento, faltaParaClave } from '../lib/claveSeguimiento';
import { Button } from './ui/Button';

const BRAND_COLOR = '#1A56A4';
const BRAND_BG = '#E8F0FB';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

function escalaDe(q) {
  return ESCALAS[q.escala] || ESCALAS.intensidad5;
}

function valoresDe(esc) {
  const out = [];
  for (let n = esc.min; n <= esc.max; n++) out.push(n);
  return out;
}

export function etiquetaEscala(esc, valor) {
  if (!esc || valor === null || valor === undefined) return '';
  if (!esc.labels) return String(valor);
  const i = valor - esc.min;
  return esc.labels[i] ? `${valor} · ${esc.labels[i]}` : String(valor);
}

function hasAnswer(q, val) {
  if (val === null || val === undefined) return false;
  if (q.type === 'grid') {
    return q.rows.every(r => val[r.id] !== null && val[r.id] !== undefined);
  }
  if (q.type === 'multi') return Array.isArray(val) && val.length > 0;
  if (typeof val === 'string') return val.trim() !== '';
  return true;
}

/** Cuántos campos individuales lleva contestados (cada renglón de un grid cuenta). */
function countAnswered(questions, answers) {
  return questions.reduce((n, q) => {
    const val = answers[q.id];
    if (q.type === 'grid') {
      const obj = val || {};
      return n + q.rows.filter(r => obj[r.id] !== null && obj[r.id] !== undefined).length;
    }
    return n + (hasAnswer(q, val) ? 1 : 0);
  }, 0);
}

/* ── Renderers por tipo de pregunta ── */

function TextQuestion({ q, value, onChange }) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      aria-label={q.question}
      style={{
        width: '100%', padding: '9px 12px', borderRadius: '8px',
        border: '1px solid #D1D5DB', fontSize: '0.88rem', outline: 'none',
        boxSizing: 'border-box',
      }}
      onFocus={e => e.target.style.borderColor = BRAND_COLOR}
      onBlur={e => e.target.style.borderColor = '#D1D5DB'}
    />
  );
}

function LongtextQuestion({ q, value, onChange }) {
  return (
    <textarea
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder="Escribe tu respuesta aquí…"
      rows={3}
      aria-label={q.question}
      style={{
        width: '100%', padding: '9px 12px', borderRadius: '8px',
        border: '1px solid #D1D5DB', fontSize: '0.88rem', outline: 'none',
        resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
      }}
      onFocus={e => e.target.style.borderColor = BRAND_COLOR}
      onBlur={e => e.target.style.borderColor = '#D1D5DB'}
    />
  );
}

function SingleQuestion({ q, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} role="radiogroup" aria-label={q.question}>
      {q.options.map(opt => {
        const selected = value === opt;
        return (
          <label
            key={opt}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
              border: selected ? `2px solid ${BRAND_COLOR}` : '2px solid #E5E7EB',
              background: selected ? BRAND_BG : 'white',
              transition: 'all 0.1s',
            }}
          >
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
              border: selected ? `5px solid ${BRAND_COLOR}` : '2px solid #9CA3AF',
              background: 'white', boxSizing: 'border-box',
            }} />
            <input type="radio" name={q.id} value={opt} checked={selected} onChange={() => onChange(opt)} style={{ display: 'none' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: selected ? 700 : 400, color: '#111827' }}>{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

function MultiQuestion({ q, value = [], onChange }) {
  const [chipError, setChipError] = useState('');
  const max = q.maxSelect;

  function toggle(opt) {
    const arr = value || [];
    if (arr.includes(opt)) {
      onChange(arr.filter(o => o !== opt));
    } else {
      if (max && arr.length >= max) {
        setChipError(`Selecciona hasta ${max} opciones`);
        setTimeout(() => setChipError(''), 2500);
        return;
      }
      onChange([...arr, opt]);
    }
  }

  return (
    <div>
      {max && (
        <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#6B7280' }}>
          Selecciona hasta {max} opciones
        </p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }} role="group" aria-label={q.question}>
        {q.options.map(opt => {
          const sel = (value || []).includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              aria-pressed={sel}
              style={{
                padding: '6px 14px', borderRadius: '999px', cursor: 'pointer',
                border: sel ? `2px solid ${BRAND_COLOR}` : '2px solid #D1D5DB',
                background: sel ? BRAND_COLOR : 'white',
                color: sel ? 'white' : '#374151',
                fontSize: '0.83rem', fontWeight: sel ? 600 : 400,
                transition: 'all 0.1s',
              }}
            >
              {sel ? `✓ ${opt}` : opt}
            </button>
          );
        })}
      </div>
      {chipError && (
        <p role="alert" style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#DC2626' }}>{chipError}</p>
      )}
    </div>
  );
}

/** Botonera de una escala. Compacta cuando va dentro de un grid. */
function EscalaBotones({ esc, value, onChange, compact, ariaLabel }) {
  const valores = valoresDe(esc);
  const size = compact ? 36 : 44;
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      style={{ display: 'flex', alignItems: 'flex-start', gap: compact ? '5px' : '8px', flexWrap: 'wrap' }}
    >
      {valores.map(n => {
        const sel = value === n;
        const label = esc.labels ? esc.labels[n - esc.min] : null;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={sel}
            aria-label={label ? `${n}, ${label}` : `${n}`}
            title={label || undefined}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              minWidth: `${size}px`, maxWidth: compact ? `${size}px` : '96px',
              padding: compact ? '0' : '0 2px',
              border: 'none', background: 'none', cursor: 'pointer',
            }}
          >
            <span style={{
              width: `${size}px`, height: `${size}px`, borderRadius: '8px',
              border: sel ? `2px solid ${BRAND_COLOR}` : '2px solid #D1D5DB',
              background: sel ? BRAND_COLOR : 'white',
              color: sel ? 'white' : '#374151',
              fontSize: compact ? '0.85rem' : '1rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.1s', boxSizing: 'border-box',
            }}>{n}</span>
            {label && !compact && (
              <span style={{
                fontSize: '0.68rem', lineHeight: 1.2, textAlign: 'center',
                color: sel ? BRAND_COLOR : '#9CA3AF', fontWeight: sel ? 700 : 400,
              }}>{label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ScaleQuestion({ q, value, onChange }) {
  const esc = escalaDe(q);
  return (
    <div>
      <EscalaBotones esc={esc} value={value} onChange={onChange} ariaLabel={q.question} />
      {!esc.labels && (esc.minLabel || esc.maxLabel) && (
        <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>
          {esc.min} = {esc.minLabel} · {esc.max} = {esc.maxLabel}
        </p>
      )}
    </div>
  );
}

/** Leyenda "1 Nunca · 2 Rara vez · …" que encabeza un grid. */
function LeyendaEscala({ esc }) {
  if (!esc.labels) {
    return (
      <p style={{ margin: '0 0 10px', fontSize: '0.75rem', color: '#6B7280' }}>
        {esc.min} = {esc.minLabel} · {esc.max} = {esc.maxLabel}
      </p>
    );
  }
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '2px 12px',
      margin: '0 0 10px', fontSize: '0.75rem', color: '#6B7280', lineHeight: 1.5,
    }}>
      {esc.labels.map((l, i) => (
        <span key={l} style={{ whiteSpace: 'nowrap' }}>
          <strong style={{ color: '#374151' }}>{esc.min + i}</strong> {l}
        </span>
      ))}
    </div>
  );
}

function GridQuestion({ q, value = {}, onChange, errorRows }) {
  const esc = escalaDe(q);
  const val = value || {};

  return (
    <div>
      <LeyendaEscala esc={esc} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {q.rows.map((row, i) => {
          const falta = errorRows?.has(row.id);
          return (
            <div
              key={row.id}
              style={{
                display: 'flex', flexWrap: 'wrap', gap: '6px 12px',
                alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 10px', borderRadius: '8px',
                background: falta ? '#FEF2F2' : (i % 2 === 0 ? '#F9FAFB' : 'white'),
                border: falta ? '1px solid #FECACA' : '1px solid transparent',
              }}
            >
              <span style={{ fontSize: '0.84rem', color: '#111827', flex: '1 1 240px', lineHeight: 1.35 }}>
                {row.text}
              </span>
              <EscalaBotones
                esc={esc}
                value={val[row.id]}
                onChange={n => onChange({ ...val, [row.id]: n })}
                compact
                ariaLabel={row.text}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuestionCard({ q, idx, answers, onChange, errorId, errorRows }) {
  const isError = errorId === q.id;
  const val = answers[q.id];

  return (
    <div style={{
      background: 'white', borderRadius: '10px',
      boxShadow: isError ? '0 0 0 2px #DC2626' : '0 1px 3px rgba(0,0,0,0.08)',
      padding: '18px 20px', marginBottom: '12px',
    }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
        <div style={{
          width: '26px', height: '26px', borderRadius: '50%', background: BRAND_COLOR,
          color: 'white', fontWeight: 700, fontSize: '0.8rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px',
        }}>{idx + 1}</div>
        <div>
          <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: '0.9rem', lineHeight: 1.4 }}>
            {q.question}
            {q.required && (
              <span aria-label="obligatorio" style={{ color: '#DC2626', marginLeft: '4px' }}>*</span>
            )}
          </p>
          {q.help && (
            <p style={{ margin: '4px 0 0', fontSize: '0.79rem', color: '#6B7280', lineHeight: 1.4 }}>{q.help}</p>
          )}
        </div>
      </div>
      <div style={{ paddingLeft: '38px' }}>
        {q.type === 'text' && <TextQuestion q={q} value={val} onChange={v => onChange(q.id, v)} />}
        {q.type === 'longtext' && <LongtextQuestion q={q} value={val} onChange={v => onChange(q.id, v)} />}
        {q.type === 'single' && <SingleQuestion q={q} value={val} onChange={v => onChange(q.id, v)} />}
        {q.type === 'multi' && <MultiQuestion q={q} value={val} onChange={v => onChange(q.id, v)} />}
        {q.type === 'scale' && <ScaleQuestion q={q} value={val} onChange={v => onChange(q.id, v)} />}
        {q.type === 'grid' && (
          <GridQuestion q={q} value={val} onChange={v => onChange(q.id, v)} errorRows={isError ? errorRows : null} />
        )}
        {isError && (
          <p role="alert" style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#DC2626' }}>
            {q.type === 'grid' ? 'Faltan renglones por responder.' : 'Por favor responde esta pregunta.'}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Formulario de una evaluación.
 *
 * `sujeto` es la persona a la que se refiere la evaluación (de ahí sale la
 * clave de seguimiento). Normalmente es el mismo `userData`; en la evaluación
 * del coordinador es el servidor evaluado.
 */
export function EvalForm({ evalId, userData, sujeto, onSave, onBack }) {
  const ev = EVALUACIONES.find(e => e.id === evalId);
  const cat = ev ? (CATEGORIAS[ev.category] || {}) : {};
  const persona = sujeto || userData;
  const existing = (userData.evaluaciones || {})[evalId];
  const clave = claveSeguimiento(persona);
  const falta = faltaParaClave(persona);

  const [answers, setAnswers] = useState(existing?.answers || {});
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorQid, setErrorQid] = useState(null);
  const [errorRows, setErrorRows] = useState(null);
  const [toast, setToast] = useState('');
  const questionRefs = useRef({});

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  if (!ev) return <p style={{ color: '#6B7280' }}>Evaluación no encontrada.</p>;

  function setAnswer(qid, val) {
    setAnswers(prev => ({ ...prev, [qid]: val }));
    if (errorQid === qid) { setErrorQid(null); setErrorRows(null); }
  }

  const answered = countAnswered(ev.questions, answers);
  const total = totalCampos(ev);

  async function handleSave() {
    for (const q of ev.questions) {
      if (!q.required || hasAnswer(q, answers[q.id])) continue;
      setErrorMsg(
        q.type === 'grid'
          ? `Faltan renglones por responder en: "${q.question}"`
          : `Por favor responde la pregunta: "${q.question}"`
      );
      setErrorQid(q.id);
      if (q.type === 'grid') {
        const obj = answers[q.id] || {};
        setErrorRows(new Set(q.rows.filter(r => obj[r.id] === undefined || obj[r.id] === null).map(r => r.id)));
      } else {
        setErrorRows(null);
      }
      const el = questionRefs.current[q.id];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrorMsg('');
    setErrorQid(null);
    setErrorRows(null);
    setSaving(true);
    try {
      await onSave(evalId, answers, clave);
      setToast('✓ Evaluación guardada. ¡Gracias por tu tiempo!');
      setTimeout(() => {
        setToast('');
        onBack();
      }, 1800);
    } catch (e) {
      setErrorMsg(e.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {toast && (
        <div role="alert" style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          background: '#065F46', color: 'white', padding: '12px 24px', borderRadius: '10px',
          fontSize: '0.9rem', fontWeight: 600, zIndex: 1000, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>{toast}</div>
      )}

      {/* Encabezado */}
      <div style={{
        background: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        padding: '16px 20px', marginBottom: '16px',
        borderLeft: `4px solid ${cat.color || BRAND_COLOR}`,
      }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '0.85rem', padding: '0 0 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          ← Volver
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{cat.icon}</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>{ev.title}</h2>
            <p style={{ margin: '2px 0 4px', color: '#6B7280', fontSize: '0.82rem' }}>
              {ev.codigo} · {cat.label} · {total} respuestas · ~{ev.estimatedMinutes} min
            </p>
            <p style={{ margin: 0, color: '#374151', fontSize: '0.85rem' }}>{ev.intro || ev.description}</p>
          </div>
        </div>

        {/* Clave de seguimiento asignada por la plataforma */}
        <div style={{
          marginTop: '12px', padding: '10px 14px', borderRadius: '8px',
          background: clave ? '#F3F4F6' : '#FEF9C3',
          border: `1px solid ${clave ? '#E5E7EB' : '#FDE68A'}`,
          display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
            Clave de seguimiento
          </span>
          {clave ? (
            <code style={{
              fontSize: '0.92rem', fontWeight: 700, color: '#111827',
              letterSpacing: '0.04em', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}>{clave}</code>
          ) : (
            <span style={{ fontSize: '0.82rem', color: '#854D0E' }}>{falta}</span>
          )}
          {clave && falta && (
            <span style={{ fontSize: '0.78rem', color: '#854D0E' }}>{falta}</span>
          )}
        </div>

        {existing?.completedAt && (
          <div style={{
            marginTop: '12px', padding: '10px 14px', borderRadius: '8px',
            background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: '0.83rem', color: '#1E40AF',
          }}>
            Ya se respondió esta evaluación el {formatDate(existing.completedAt)}. Puedes actualizar las respuestas si lo deseas.
          </div>
        )}
      </div>

      {errorMsg && (
        <div style={{ marginBottom: '12px' }}>
          <div role="alert" style={{
            background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px',
            padding: '10px 14px', color: '#DC2626', fontSize: '0.85rem',
          }}>{errorMsg}</div>
        </div>
      )}

      {ev.questions.map((q, idx) => (
        <div key={q.id} ref={el => { questionRefs.current[q.id] = el; }}>
          <QuestionCard
            q={q} idx={idx} answers={answers} onChange={setAnswer}
            errorId={errorQid} errorRows={errorRows}
          />
        </div>
      ))}

      {/* Pie */}
      <div style={{
        position: 'sticky', bottom: 0,
        background: 'white', borderTop: '1px solid #E5E7EB',
        padding: '12px 20px', marginTop: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px', flexWrap: 'wrap', zIndex: 10,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)', borderRadius: '0 0 10px 10px',
      }}>
        <span style={{ fontSize: '0.83rem', color: '#6B7280' }}>
          {answered} de {total} respuestas
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="ghost" onClick={onBack} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar evaluación'}
          </Button>
        </div>
      </div>
    </div>
  );
}
