import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserDocument } from '../hooks/useUser';
import { parseCURP, validateCURP, calcAge, isMinor, formatFechaNac } from '../lib/curp';
import { validateEmail, validatePhone, validateCP } from '../lib/validators';
import { Navbar } from './Navbar';
import { Field, Input, Select, Textarea } from './ui/Field';
import { SectionTitle } from './ui/SectionTitle';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const PROGRAMAS = ['MJ Sec/Prepa', 'MCU', 'SU', 'Essencia', 'Escudería Real'];
const DISTRITOS = ['Norte', 'Sur', 'Poniente', 'Oriente'];
const STATUSES = ['Activo', 'Inactivo', 'Pre-alianza', 'En camino', 'Inicial', 'Alianza'];
const DEFAULT_PASSWORD = process.env.REACT_APP_DEFAULT_PASSWORD || 'SJ2025';

const emptyForm = {
  curp: '', nombre: '', apellidoPaterno: '', apellidoMaterno: '',
  fechaNacimiento: '', sexo: '', correo: '', telefono: '',
  calle: '', colonia: '', cp: '', municipio: '',
  tutorNombre: '', tutorTelefono: '', tutorCorreo: '',
  tipoParticipante: 'Beneficiario', programa: '', distrito: '', status: 'Activo',
  gradoEscolar: '', escuela: '', carrera: '',
  ocupacion: '', empresa: '', programasSJ: '',
  servicio: '', voluntariadoExterno: '', notas: '',
  docTerminos: false, docCartaResponsiva: false, docCapacitacionPASI: false, docFechaPASI: '',
};

export function AdminAddUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null);
  const [generalError, setGeneralError] = useState('');

  function set(key, val) {
    if (key === 'curp') {
      const upper = val.toUpperCase();
      setForm(prev => {
        const next = { ...prev, curp: upper };
        if (upper.length === 18) {
          const parsed = parseCURP(upper);
          if (parsed) { next.fechaNacimiento = parsed.fechaNac; next.sexo = parsed.sex; }
        }
        return next;
      });
    } else {
      setForm(prev => ({ ...prev, [key]: val }));
    }
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  const age = calcAge(form.fechaNacimiento);
  const minor = isMinor(form.fechaNacimiento);
  const isVolunteer = form.tipoParticipante === 'Voluntario';

  function validate() {
    const e = {};
    const curpErr = validateCURP(form.curp);
    if (curpErr) e.curp = curpErr;
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

  async function handleSubmit(e) {
    e.preventDefault();
    setGeneralError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const email = `${form.curp}@sj.internal`;
      const cred = await createUserWithEmailAndPassword(auth, email, DEFAULT_PASSWORD);
      await createUserDocument(cred.user.uid, { ...form });
      setCreated({ uid: cred.user.uid, curp: form.curp, password: DEFAULT_PASSWORD });
      setForm(emptyForm);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setGeneralError(`El CURP ${form.curp} ya tiene una cuenta registrada.`);
      } else {
        setGeneralError('Error al crear usuario: ' + err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Navbar showAdminBtn />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Button variant="ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => navigate('/admin')}>
            ← Volver
          </Button>
          <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>Nuevo participante</h1>
        </div>

        {created && (
          <Alert type="success" onDismiss={() => setCreated(null)}>
            <strong>Cuenta creada exitosamente.</strong><br />
            <span style={{ fontFamily: 'monospace' }}>CURP: {created.curp}</span><br />
            <span>Contraseña temporal: <strong>{created.password}</strong></span><br />
            El participante debe cambiar su contraseña en el primer acceso.
          </Alert>
        )}
        {generalError && <Alert type="error" onDismiss={() => setGeneralError('')}>{generalError}</Alert>}

        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SectionTitle>Identificación</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <Field label="CURP" required error={errors.curp}>
              <Input value={form.curp} onChange={e => set('curp', e.target.value)} maxLength={18} style={{ fontFamily: 'monospace', letterSpacing: '0.08em' }} error={errors.curp} />
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
                {minor && <Badge variant="warning">Menor</Badge>}
              </div>
            </Field>
          </div>

          <SectionTitle>Nombre</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
            <Field label="Nombre(s)" required error={errors.nombre}>
              <Input value={form.nombre} onChange={e => set('nombre', e.target.value)} error={errors.nombre} />
            </Field>
            <Field label="Apellido Paterno" required error={errors.apellidoPaterno}>
              <Input value={form.apellidoPaterno} onChange={e => set('apellidoPaterno', e.target.value)} error={errors.apellidoPaterno} />
            </Field>
            <Field label="Apellido Materno">
              <Input value={form.apellidoMaterno} onChange={e => set('apellidoMaterno', e.target.value)} />
            </Field>
          </div>

          <SectionTitle>Contacto</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <Field label="Correo electrónico" error={errors.correo}>
              <Input type="email" value={form.correo} onChange={e => set('correo', e.target.value)} error={errors.correo} />
            </Field>
            <Field label="Teléfono" error={errors.telefono}>
              <Input value={form.telefono} onChange={e => set('telefono', e.target.value)} maxLength={10} error={errors.telefono} />
            </Field>
          </div>

          <SectionTitle>Domicilio</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <Field label="Calle y número">
              <Input value={form.calle} onChange={e => set('calle', e.target.value)} />
            </Field>
            <Field label="Colonia">
              <Input value={form.colonia} onChange={e => set('colonia', e.target.value)} />
            </Field>
            <Field label="C.P." error={errors.cp}>
              <Input value={form.cp} onChange={e => set('cp', e.target.value)} maxLength={5} error={errors.cp} />
            </Field>
            <Field label="Municipio">
              <Input value={form.municipio} onChange={e => set('municipio', e.target.value)} />
            </Field>
          </div>

          {minor && (
            <>
              <SectionTitle>Datos del tutor / padre</SectionTitle>
              <Alert type="warning">Participante menor de edad — datos del tutor obligatorios.</Alert>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <Field label="Nombre del padre o tutor" required error={errors.tutorNombre}>
                  <Input value={form.tutorNombre} onChange={e => set('tutorNombre', e.target.value)} error={errors.tutorNombre} />
                </Field>
                <Field label="Teléfono del tutor" required error={errors.tutorTelefono}>
                  <Input value={form.tutorTelefono} onChange={e => set('tutorTelefono', e.target.value)} maxLength={10} error={errors.tutorTelefono} />
                </Field>
                <Field label="Correo del tutor">
                  <Input type="email" value={form.tutorCorreo} onChange={e => set('tutorCorreo', e.target.value)} />
                </Field>
              </div>
            </>
          )}

          <SectionTitle>Programa</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
            <Field label="Tipo de participante">
              <Select value={form.tipoParticipante} onChange={e => set('tipoParticipante', e.target.value)}>
                <option value="Beneficiario">Beneficiario</option>
                <option value="Voluntario">Voluntario</option>
              </Select>
            </Field>
            <Field label="Programa">
              <Select value={form.programa} onChange={e => set('programa', e.target.value)}>
                <option value="">Selecciona...</option>
                {PROGRAMAS.map(p => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
            <Field label="Distrito">
              <Select value={form.distrito} onChange={e => set('distrito', e.target.value)}>
                <option value="">Selecciona...</option>
                {DISTRITOS.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>

          {isVolunteer ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <Field label="Ocupación"><Input value={form.ocupacion} onChange={e => set('ocupacion', e.target.value)} /></Field>
                <Field label="Empresa / Institución"><Input value={form.empresa} onChange={e => set('empresa', e.target.value)} /></Field>
              </div>
              <Field label="Programas SJ en los que ha participado">
                <Textarea value={form.programasSJ} onChange={e => set('programasSJ', e.target.value)} />
              </Field>
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <Field label="Grado escolar"><Input value={form.gradoEscolar} onChange={e => set('gradoEscolar', e.target.value)} /></Field>
              <Field label="Escuela / Universidad"><Input value={form.escuela} onChange={e => set('escuela', e.target.value)} /></Field>
              <Field label="Carrera"><Input value={form.carrera} onChange={e => set('carrera', e.target.value)} /></Field>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <Field label="Servicio dentro de Jésed / SJ"><Input value={form.servicio} onChange={e => set('servicio', e.target.value)} /></Field>
            <Field label="Voluntariado externo"><Input value={form.voluntariadoExterno} onChange={e => set('voluntariadoExterno', e.target.value)} /></Field>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <Button type="submit" disabled={saving}>
              {saving ? 'Creando cuenta...' : 'Crear participante'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/admin')}>Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
