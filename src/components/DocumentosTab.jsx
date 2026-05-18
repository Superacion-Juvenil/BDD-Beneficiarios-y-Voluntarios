import { useState } from 'react';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';
import { Field, Input } from './ui/Field';

const BRAND_COLOR = '#1A56A4';

function DocCard({ id, title, description, checked, onChange, extra }) {
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

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  const pending = [!form.docTerminos, !form.docCartaResponsiva, !form.docCapacitacionPASI].filter(Boolean).length;

  async function handleSave(e) {
    e.preventDefault();
    if (form.docCapacitacionPASI && !form.docFechaPASI) {
      setError('Ingresa la fecha de capacitación PASI.');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        docTerminos: form.docTerminos,
        docCartaResponsiva: form.docCartaResponsiva,
        docCapacitacionPASI: form.docCapacitacionPASI,
        docFechaPASI: form.docFechaPASI,
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
          Tienes <strong>{pending} {pending === 1 ? 'documento pendiente' : 'documentos pendientes'}</strong>. Haz clic en cada tarjeta para confirmar.
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
        />
        <DocCard
          id="pasi"
          title="Capacitación Fundación Roble (PASI)"
          description='He completado la capacitación de Prevención del Abuso Sexual Infantil.'
          checked={form.docCapacitacionPASI}
          onChange={val => set('docCapacitacionPASI', val)}
          extra={
            <Field label="Fecha de capacitación" required>
              <Input
                type="date"
                value={form.docFechaPASI || ''}
                onChange={e => set('docFechaPASI', e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </Field>
          }
        />
      </div>

      <div style={{ marginTop: '8px' }}>
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar documentos'}
        </Button>
      </div>
    </form>
  );
}
