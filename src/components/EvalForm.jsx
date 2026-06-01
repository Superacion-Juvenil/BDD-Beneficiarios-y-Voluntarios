import { useState, useRef, useEffect } from 'react';
import { EVALUACIONES, CATEGORIAS } from '../evaluaciones';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';

const BRAND_COLOR = '#1A56A4';
const BRAND_BG = '#E8F0FB';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

function hasAnswer(type, val) {
  if (val === null || val === undefined) return false;
  if (type === 'multi') return Array.isArray(val) && val.length > 0;
  if (typeof val === 'string') return val.trim() !== '';
  return true;
}

function countAnswered(questions, answers) {
  return questions.filter(q => hasAnswer(q.type, answers[q.id])).length;
}

/* ── Question renderers ── */

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

function ScaleQuestion({ q, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }} role="radiogroup" aria-label={q.question}>
      <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>1</span>
      {[1, 2, 3, 4, 5].map(n => {
        const sel = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={sel}
            aria-label={`${n}`}
            style={{
              width: '44px', height: '44px', borderRadius: '8px',
              border: sel ? `2px solid ${BRAND_COLOR}` : '2px solid #D1D5DB',
              background: sel ? BRAND_COLOR : 'white',
              color: sel ? 'white' : '#374151',
              fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.1s',
            }}
          >
            {n}
          </button>
        );
      })}
      <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>5</span>
    </div>
  );
}

function QuestionCard({ q, idx, answers, onChange, errorId }) {
  const isError = errorId === q.id;
  return (
    <div style={{
      background: 'white', borderRadius: '10px',
      boxShadow: isError ? `0 0 0 2px #DC2626` : '0 1px 3px rgba(0,0,0,0.08)',
      padding: '18px 20px', marginBottom: '12px',
    }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
        <div style={{
          width: '26px', height: '26px', borderRadius: '50%', background: BRAND_COLOR,
          color: 'white', fontWeight: 700, fontSize: '0.8rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px',
        }}>{idx + 1}</div>
        <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: '0.9rem', lineHeight: 1.4 }}>
          {q.question}
          {q.required && (
            <span aria-label="obligatorio" style={{ color: '#DC2626', marginLeft: '4px' }}>*</span>
          )}
        </p>
      </div>
      <div style={{ paddingLeft: '38px' }}>
        {q.type === 'text' && <TextQuestion q={q} value={answers[q.id]} onChange={v => onChange(q.id, v)} />}
        {q.type === 'longtext' && <LongtextQuestion q={q} value={answers[q.id]} onChange={v => onChange(q.id, v)} />}
        {q.type === 'single' && <SingleQuestion q={q} value={answers[q.id]} onChange={v => onChange(q.id, v)} />}
        {q.type === 'multi' && <MultiQuestion q={q} value={answers[q.id]} onChange={v => onChange(q.id, v)} />}
        {q.type === 'scale' && <ScaleQuestion q={q} value={answers[q.id]} onChange={v => onChange(q.id, v)} />}
        {isError && (
          <p role="alert" style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#DC2626' }}>
            Por favor responde esta pregunta.
          </p>
        )}
      </div>
    </div>
  );
}

export function EvalForm({ evalId, userData, onSave, onBack }) {
  const ev = EVALUACIONES.find(e => e.id === evalId);
  const cat = ev ? (CATEGORIAS[ev.category] || {}) : {};
  const existing = (userData.evaluaciones || {})[evalId];

  const [answers, setAnswers] = useState(existing?.answers || {});
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorQid, setErrorQid] = useState(null);
  const [toast, setToast] = useState('');
  const questionRefs = useRef({});

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  if (!ev) return <p style={{ color: '#6B7280' }}>Evaluación no encontrada.</p>;

  function setAnswer(qid, val) {
    setAnswers(prev => ({ ...prev, [qid]: val }));
    if (errorQid === qid) setErrorQid(null);
  }

  const answered = countAnswered(ev.questions, answers);

  async function handleSave() {
    for (const q of ev.questions) {
      if (q.required && !hasAnswer(q.type, answers[q.id])) {
        setErrorMsg(`Por favor responde la pregunta: "${q.question}"`);
        setErrorQid(q.id);
        const el = questionRefs.current[q.id];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    setErrorMsg('');
    setErrorQid(null);
    setSaving(true);
    try {
      await onSave(evalId, answers);
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
      {/* Toast */}
      {toast && (
        <div role="alert" style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          background: '#065F46', color: 'white', padding: '12px 24px', borderRadius: '10px',
          fontSize: '0.9rem', fontWeight: 600, zIndex: 1000, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>{toast}</div>
      )}

      {/* Header */}
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
              {cat.label} · {ev.questions.length} preguntas · ~{ev.estimatedMinutes} min
            </p>
            <p style={{ margin: 0, color: '#374151', fontSize: '0.85rem' }}>{ev.description}</p>
          </div>
        </div>
        {existing?.completedAt && (
          <div style={{
            marginTop: '12px', padding: '10px 14px', borderRadius: '8px',
            background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: '0.83rem', color: '#1E40AF',
          }}>
            Ya respondiste esta evaluación el {formatDate(existing.completedAt)}. Puedes actualizar tus respuestas si lo deseas.
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

      {/* Questions */}
      {ev.questions.map((q, idx) => (
        <div key={q.id} ref={el => { questionRefs.current[q.id] = el; }}>
          <QuestionCard q={q} idx={idx} answers={answers} onChange={setAnswer} errorId={errorQid} />
        </div>
      ))}

      {/* Footer */}
      <div style={{
        position: 'sticky', bottom: 0,
        background: 'white', borderTop: '1px solid #E5E7EB',
        padding: '12px 20px', marginTop: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px', flexWrap: 'wrap', zIndex: 10,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)', borderRadius: '0 0 10px 10px',
      }}>
        <span style={{ fontSize: '0.83rem', color: '#6B7280' }}>
          {answered} de {ev.questions.length} preguntas respondidas
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
