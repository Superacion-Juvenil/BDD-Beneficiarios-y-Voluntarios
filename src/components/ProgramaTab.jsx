import { useState } from 'react';
import { Field, Input, Select, Textarea } from './ui/Field';
import { SectionTitle } from './ui/SectionTitle';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';

const PROGRAMAS = ['MJ Sec/Prepa', 'MCU', 'SU', 'Essencia', 'Escudería Real'];
const DISTRITOS = ['Norte', 'Sur', 'Poniente', 'Oriente'];
const STATUSES = ['Activo', 'Inactivo', 'Pre-alianza', 'En camino', 'Inicial', 'Alianza'];

export function ProgramaTab({ data, onSave, isAdmin }) {
  const [form, setForm] = useState({ ...data });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  const isVolunteer = form.tipoParticipante === 'Voluntario';

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      setSuccess('Información del programa guardada.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fadeIn 0.2s ease' }}>
      {success && <Alert type="success" onDismiss={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onDismiss={() => setError('')}>{error}</Alert>}

      <SectionTitle>Participación</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        <Field label="Tipo de participante">
          <Select value={form.tipoParticipante || ''} onChange={e => set('tipoParticipante', e.target.value)}>
            <option value="">Selecciona...</option>
            <option value="Beneficiario">Beneficiario</option>
            <option value="Voluntario">Voluntario</option>
          </Select>
        </Field>
        <Field label="Programa">
          <Select value={form.programa || ''} onChange={e => set('programa', e.target.value)}>
            <option value="">Selecciona...</option>
            {PROGRAMAS.map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
        </Field>
        <Field label="Distrito">
          <Select value={form.distrito || ''} onChange={e => set('distrito', e.target.value)}>
            <option value="">Selecciona...</option>
            {DISTRITOS.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
        </Field>
        <Field label="Status">
          <Select
            value={form.status || ''}
            onChange={e => set('status', e.target.value)}
            disabled={!isAdmin}
          >
            <option value="">Selecciona...</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
      </div>

      {isVolunteer ? (
        <>
          <SectionTitle>Datos del voluntario</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <Field label="Ocupación">
              <Input value={form.ocupacion || ''} onChange={e => set('ocupacion', e.target.value)} />
            </Field>
            <Field label="Empresa / Institución">
              <Input value={form.empresa || ''} onChange={e => set('empresa', e.target.value)} />
            </Field>
          </div>
          <Field label="Programas de SJ en los que ha participado">
            <Textarea
              value={form.programasSJ || ''}
              onChange={e => set('programasSJ', e.target.value)}
              placeholder="Describe los programas en los que has participado..."
            />
          </Field>
        </>
      ) : (
        <>
          <SectionTitle>Datos académicos</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <Field label="Grado escolar que cursa">
              <Input value={form.gradoEscolar || ''} onChange={e => set('gradoEscolar', e.target.value)} />
            </Field>
            <Field label="Escuela / Universidad">
              <Input value={form.escuela || ''} onChange={e => set('escuela', e.target.value)} />
            </Field>
            <Field label="Carrera (si aplica)">
              <Input value={form.carrera || ''} onChange={e => set('carrera', e.target.value)} />
            </Field>
          </div>
        </>
      )}

      <SectionTitle>Servicio</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        <Field label="Servicio dentro de Jésed / SJ">
          <Input value={form.servicio || ''} onChange={e => set('servicio', e.target.value)} />
        </Field>
        <Field label="Voluntariado externo (OSC / parroquia / escuela)">
          <Input value={form.voluntariadoExterno || ''} onChange={e => set('voluntariadoExterno', e.target.value)} placeholder="Opcional" />
        </Field>
      </div>

      <SectionTitle>Seguimiento</SectionTitle>
      <Field label="Notas de seguimiento">
        <Textarea
          value={form.notas || ''}
          onChange={e => set('notas', e.target.value)}
          placeholder="Notas del coordinador o del participante..."
        />
      </Field>

      <div style={{ marginTop: '16px' }}>
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar información del programa'}
        </Button>
      </div>
    </form>
  );
}
