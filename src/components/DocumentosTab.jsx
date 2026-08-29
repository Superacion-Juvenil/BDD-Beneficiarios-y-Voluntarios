import { useState, useEffect } from 'react';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';
import { Field, Input } from './ui/Field';

const BRAND_COLOR = '#1A56A4';

const CARTAS_RESPONSIVAS = [
  { id: 'secundaria',    label: 'Secundaria',    url: '/documentos/carta-responsiva-secundaria.pdf' },
  { id: 'prepa',         label: 'Preparatoria',  url: '/documentos/carta-responsiva-prepa.pdf' },
  { id: 'universitarios', label: 'Universidad',  url: '/documentos/carta-responsiva-universitarios.pdf' },
];

function CartasResponsivas() {
  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        marginTop: '10px', padding: '12px',
        background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px',
      }}
    >
      <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#374151', fontWeight: 600 }}>
        Consulta la carta que corresponde a tu nivel antes de confirmar:
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {CARTAS_RESPONSIVAS.map(carta => (
          <a
            key={carta.id}
            href={carta.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '7px 12px', borderRadius: '7px',
              border: `1px solid ${BRAND_COLOR}`, background: 'white',
              color: BRAND_COLOR, fontSize: '0.8rem', fontWeight: 600,
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >
            <span aria-hidden="true">📄</span>
            {carta.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function DocCard({ id, title, description, checked, onChange, extra, aside }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!checked); } }}
      style={{
        padding: '16px',
        borderRadius: '10px',
        border: `2px solid ${checked ? BRAND_COLOR : '#E5E7EB'}`,
        background: checked ? '#E8F0FB' : 'white',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        userSelect: 'none',
      }}
    >
      <div style={{
        width: '22px', height: '22px', minWidth: '22px',
        borderRadius: '6px',
        border: `2px solid ${checked ? BRAND_COLOR : '#D1D5DB'}`,
        background: checked ? BRAND_COLOR : 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
        marginTop: '2px',
      }}>
        {checked && (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{title}</p>
        <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '0.82rem', lineHeight: 1.4 }}>{description}</p>
        {aside}
        {checked && extra && (
          <div onClick={e => e.stopPropagation()} style={{ marginTop: '10px' }}>
            {extra}
          </div>
        )}
      </div>
    </div>
  );
}

export function DocumentosTab({ data, onSave }) {
  const [form, setForm] = useState({
    docTerminos: data.docTerminos || false,
    docCartaResponsiva: data.docCartaResponsiva || false,
    docCapacitacionPASI: data.docCapacitacionPASI || false,
    docFechaPASI: data.docFechaPASI || '',
    ...data,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (data && (data.id || data.uid || data.curp)) {
      setForm({
        docTerminos: data.docTerminos || false,
        docCartaResponsiva: data.docCartaResponsiva || false,
        docCapacitacionPASI: data.docCapacitacionPASI || false,
        docFechaPASI: data.docFechaPASI || '',
        ...data,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, data?.uid, data?.curp]);

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  const pending = [!form.docTerminos, !form.docCartaResponsiva, !form.docCapacitacionPASI].filter(Boolean).length;

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    if (form.docCapacitacionPASI && !form.docFechaPASI) {
      setError('Ingresa la fecha en que tomaste la capacitación de Fundación Roble.');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        docTerminos: form.docTerminos,
        docCartaResponsiva: form.docCartaResponsiva,
        docCapacitacionPASI: form.docCapacitacionPASI,
        docFechaPASI: form.docCapacitacionPASI ? form.docFechaPASI : '',
      });
      setSuccess('Documentos actualizados correctamente.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'fadeIn 0.2s ease' }}>
      {success && <Alert type="success" onDismiss={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onDismiss={() => setError('')}>{error}</Alert>}

      {pending > 0 && (
        <Alert type="warning">
          Tienes <strong>{pending} {pending === 1 ? 'documento pendiente' : 'documentos pendientes'}</strong>. Marca los que ya completaste y guarda los cambios; no necesitas tenerlos todos para guardar.
        </Alert>
      )}
      {pending === 0 && (
        <Alert type="success">Todos los documentos están completados.</Alert>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <DocCard
          id="terminos"
          title="Términos y condiciones"
          description='Acepto los términos y condiciones de Superación Juvenil A.B.P.'
          checked={form.docTerminos}
          onChange={val => set('docTerminos', val)}
        />
        <DocCard
          id="carta"
          title="Carta responsiva y uso de imagen"
          description='Autorizo el uso de mi imagen en materiales de Superación Juvenil A.B.P.'
          checked={form.docCartaResponsiva}
          onChange={val => set('docCartaResponsiva', val)}
          aside={<CartasResponsivas />}
        />
        <div style={{
          padding: '16px',
          borderRadius: '10px',
          border: `2px solid ${form.docCapacitacionPASI ? BRAND_COLOR : '#E5E7EB'}`,
          background: form.docCapacitacionPASI ? '#E8F0FB' : 'white',
          transition: 'all 0.2s',
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>
            Capacitación Fundación Roble (PASI)
          </p>
          <p style={{ margin: '4px 0 12px', color: '#6B7280', fontSize: '0.82rem', lineHeight: 1.4 }}>
            Prevención del Abuso Sexual Infantil.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem', color: '#111827' }}>
              <input
                type="radio"
                name="pasi-status"
                checked={form.docCapacitacionPASI === true}
                onChange={() => set('docCapacitacionPASI', true)}
                style={{ accentColor: BRAND_COLOR }}
              />
              Ya tomé la capacitación
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem', color: '#111827' }}>
              <input
                type="radio"
                name="pasi-status"
                checked={form.docCapacitacionPASI === false}
                onChange={() => { set('docCapacitacionPASI', false); set('docFechaPASI', ''); }}
                style={{ accentColor: BRAND_COLOR }}
              />
              Aún no la he tomado
            </label>
          </div>

          {form.docCapacitacionPASI && (
            <div style={{ marginTop: '12px' }}>
              <Field label="Fecha en que la tomé" required>
                <Input
                  type="date"
                  value={form.docFechaPASI || ''}
                  onChange={e => set('docFechaPASI', e.target.value)}
                />
              </Field>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '8px' }}>
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar documentos'}
        </Button>
      </div>
    </form>
  );
}
