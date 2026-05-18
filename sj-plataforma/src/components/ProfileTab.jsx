import { useState, useEffect } from 'react';
import { parseCURP, calcAge, isMinor, formatFechaNac } from '../lib/curp';
import { validateEmail, validatePhone, validateCP } from '../lib/validators';
import { Field, Input, SectionTitleComp } from './ui/Field';
import { SectionTitle } from './ui/SectionTitle';
import { Badge } from './ui/Badge';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';

export function ProfileTab({ data, onSave, isAdmin, readOnlyCURP = true }) {
  const [form, setForm] = useState({ ...data });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  // Recalculate from CURP whenever it changes
  useEffect(() => {
    if (form.curp && form.curp.length === 18) {
      const parsed = parseCURP(form.curp);
      if (parsed) {
        setForm(prev => ({ ...prev, fechaNacimiento: parsed.fechaNac, sexo: parsed.sex }));
      }
    }
  }, [form.curp]);

  const age = calcAge(form.fechaNacimiento);
  const minor = isMinor(form.fechaNacimiento);

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.nombre?.trim()) e.nombre = 'Nombre requerido';
    if (!form.apellidoPaterno?.trim()) e.apellidoPaterno = 'Apellido paterno requerido';
    const emailErr = validateEmail(form.correo);
    if (emailErr) e.correo = emailErr;
    const phoneErr = validatePhone(form.telefono);
    if (phoneErr) e.telefono = phoneErr;
    const cpErr = validateCP(form.cp);
    if (cpErr) e.cp = cpErr;
    if (minor) {
      if (!form.tutorNombre?.trim()) e.tutorNombre = 'Nombre del tutor requerido';
      if (!form.tutorTelefono?.trim()) e.tutorTelefono = 'Teléfono del tutor requerido';
    }
    return e;
  }

  async function handleSave(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSaving(true);
    try {
      await onSave(form);
      setSuccess('Datos guardados correctamente.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setErrors({ general: 'Error al guardar: ' + err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fadeIn 0.2s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {success && <Alert type="success" onDismiss={() => setSuccess('')}>{success}</Alert>}
      {errors.general && <Alert type="error">{errors.general}</Alert>}

      <SectionTitle>Identificación</SectionTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        <Field label="CURP" required>
          <Input
            value={form.curp || ''}
            onChange={e => set('curp', e.target.value.toUpperCase())}
            readOnly={readOnlyCURP && !isAdmin}
            maxLength={18}
            style={{ fontFamily: 'monospace', letterSpacing: '0.08em' }}
          />
        </Field>
        <Field label="Fecha de nacimiento">
          <Input value={form.fechaNacimiento ? formatFechaNac(form.fechaNacimiento) : ''} readOnly />
        </Field>
        <Field label="Sexo">
          <Input value={form.sexo || ''} readOnly />
        </Field>
        <Field label="Edad">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Input value={age !== null ? `${age} años` : ''} readOnly style={{ flex: 1 }} />
            {minor && <Badge variant="warning">Menor de edad</Badge>}
          </div>
        </Field>
      </div>

      <SectionTitle>Nombre</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
        <Field label="Nombre(s)" required error={errors.nombre}>
          <Input value={form.nombre || ''} onChange={e => set('nombre', e.target.value)} error={errors.nombre} />
        </Field>
        <Field label="Apellido Paterno" required error={errors.apellidoPaterno}>
          <Input value={form.apellidoPaterno || ''} onChange={e => set('apellidoPaterno', e.target.value)} error={errors.apellidoPaterno} />
        </Field>
        <Field label="Apellido Materno">
          <Input value={form.apellidoMaterno || ''} onChange={e => set('apellidoMaterno', e.target.value)} />
        </Field>
      </div>

      <SectionTitle>Contacto</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        <Field label="Correo electrónico" error={errors.correo}>
          <Input type="email" value={form.correo || ''} onChange={e => set('correo', e.target.value)} error={errors.correo} />
        </Field>
        <Field label="Teléfono" error={errors.telefono}>
          <Input value={form.telefono || ''} onChange={e => set('telefono', e.target.value)} maxLength={10} error={errors.telefono} />
        </Field>
      </div>

      <SectionTitle>Domicilio</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        <Field label="Calle y número" style={{ gridColumn: 'span 2' }}>
          <Input value={form.calle || ''} onChange={e => set('calle', e.target.value)} />
        </Field>
        <Field label="Colonia">
          <Input value={form.colonia || ''} onChange={e => set('colonia', e.target.value)} />
        </Field>
        <Field label="C.P." error={errors.cp}>
          <Input value={form.cp || ''} onChange={e => set('cp', e.target.value)} maxLength={5} error={errors.cp} />
        </Field>
        <Field label="Municipio">
          <Input value={form.municipio || ''} onChange={e => set('municipio', e.target.value)} />
        </Field>
      </div>

      {/* Tutor section - only when minor */}
      {minor && (
        <>
          <SectionTitle>Datos del tutor / padre</SectionTitle>
          <Alert type="warning">Este participante es menor de edad. Los datos del tutor son obligatorios.</Alert>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <Field label="Nombre del padre o tutor" required error={errors.tutorNombre}>
              <Input value={form.tutorNombre || ''} onChange={e => set('tutorNombre', e.target.value)} error={errors.tutorNombre} />
            </Field>
            <Field label="Teléfono del tutor" required error={errors.tutorTelefono}>
              <Input value={form.tutorTelefono || ''} onChange={e => set('tutorTelefono', e.target.value)} maxLength={10} error={errors.tutorTelefono} />
            </Field>
            <Field label="Correo del tutor">
              <Input type="email" value={form.tutorCorreo || ''} onChange={e => set('tutorCorreo', e.target.value)} />
            </Field>
          </div>
        </>
      )}

      <div style={{ marginTop: '16px' }}>
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar datos personales'}
        </Button>
      </div>
    </form>
  );
}
