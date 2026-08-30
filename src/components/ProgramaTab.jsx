import { useState } from 'react';
import { Field, Input, Select, Textarea } from './ui/Field';
import { SectionTitle } from './ui/SectionTitle';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';

const PROGRAMAS = ['Essencia', 'Escudería Real', 'MJ Prepa', 'MCU', 'SU', 'VEM'];
const DISTRITOS = ['Sur/TEC', 'Norte/UNI', 'Poniente/UDEM', 'Otra comunidad'];
const STATUSES = ['Activo', 'Baja', 'Graduado'];

// Campos que el trigger trg_enforce_profile_safe_update (supabase/schema.sql)
// solo deja modificar a un admin. Mantener esta lista alineada con el trigger:
// el participante sí elige su tipo, programa y distrito, pero no su status.
const PROTECTED_FIELDS = ['status'];

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
      // Los campos de PROTECTED_FIELDS solo los puede tocar un admin: la base
      // los defiende con un trigger y rechaza el update completo si cambian.
      // Para un participante ni siquiera se envían, así que un valor arrastrado
      // en el formulario no puede tumbar el guardado del resto.
      const patch = { ...form };
      if (!isAdmin) {
        for (const field of PROTECTED_FIELDS) delete patch[field];
      }
      await onSave(patch);
      setSuccess('Información del programa guardada.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = err?.message || '';
      setError(
        msg.includes('No se permite cambiar')
          ? 'Ese dato lo administra la coordinación de Superación Juvenil y no se puede ' +
            'cambiar desde aquí. Los demás cambios no se guardaron; avísale a tu coordinador.'
          : 'Error al guardar: ' + (msg || 'desconocido'),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fadeIn 0.2s ease' }}>
      {success && <Alert type="success" onDismiss={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onDismiss={() => setError('')}>{error}</Alert>}

      <SectionTitle>Participación</SectionTitle>
      {!isAdmin && (
        <p style={{ margin: '-4px 0 4px', fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.45 }}>
          El status lo administra la coordinación de Superación Juvenil. Si es incorrecto,
          avísale a tu coordinador.
        </p>
      )}
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
        <Field label="Zona/Distrito">
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
