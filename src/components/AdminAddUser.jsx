import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { createUserDocument } from '../hooks/useUser';
import { parseCURP, validateCURP, calcAge, isMinor, formatFechaNac } from '../lib/curp';
import { validateEmail, validatePhone, validateCP } from '../lib/validators';
import { AdminLayout } from './AdminLayout';
import { Field, Input, Select, Textarea } from './ui/Field';
import { SectionTitle } from './ui/SectionTitle';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const PROGRAMAS = ['Essencia', 'Escudería Real', 'MJ Prepa', 'MCU', 'SU', 'VEM'];
const DISTRITOS = ['Sur/TEC', 'Norte/UNI', 'Poniente/UDEM', 'Otra comunidad'];
const STATUSES = ['Activo', 'Baja', 'Graduado'];
const DEFAULT_PASSWORD = import.meta.env.VITE_DEFAULT_PASSWORD || 'SJ2025';

const emptyForm = {
  curp: '', nombre: '', apellidoPaterno: '', apellidoMaterno: '',
  fechaNacimiento: '', sexo: '', correo: '', telefono: '',
  calle: '', colonia: '', cp: '', municipio: '',
  tutorNombre: '', tutorTelefono: '', tutorCorreo: '',
  telefonoCasa: '', nombrePadre: '', telefonoPadre: '', correoPadre: '',
  nombreMadre: '', telefonoMadre: '', correoMadre: '',
  alergias: '', tallaPlayera: '', seguroMedico: '',
  tipoParticipante: 'Beneficiario', programa: '', distrito: '', status: 'Activo',
  gradoEscolar: '', escuela: '', carrera: '',
  ocupacion: '', empresa: '', programasSJ: '',
  servicio: '', voluntariadoExterno: '', notas: '',
  docTerminos: false, docCartaResponsiva: false, docCapacitacionPASI: false, docFechaPASI: '',
};

/**
 * Traduce los errores de Supabase Auth al dar de alta un participante.
 * Los participantes se registran con un correo interno derivado del CURP que
 * no es una dirección real, así que los fallos relacionados con correo no los
 * puede resolver quien captura: necesitan un ajuste en la consola de Supabase.
 */
function describeSignupError(err, curp) {
  const code = err?.code || err?.error_code || '';
  const msg = (err?.message || '').toLowerCase();

  if (code === 'over_email_send_rate_limit' || msg.includes('email rate limit')) {
    return 'Supabase bloqueó el alta porque se alcanzó el límite de correos por hora. ' +
      'Esto ocurre cuando la confirmación por correo sigue activada: cada alta intenta ' +
      'enviar un correo a una dirección interna que no existe. Pide que se desactive ' +
      '"Confirm email" en Authentication → Providers → Email; mientras tanto, habrá que esperar una hora.';
  }

  if (code === 'email_address_invalid' || (msg.includes('email address') && msg.includes('invalid'))) {
    return `Supabase rechazó el correo interno generado para el CURP ${curp}. ` +
      'No es un dato que hayas capturado mal: el dominio interno que usa la plataforma ' +
      'está siendo rechazado. Repórtalo para revisar la configuración de Auth.';
  }

  if (code === 'already_registered' || msg.includes('already registered') ||
      msg.includes('already been registered') || msg.includes('duplicate') ||
      msg.includes('user already')) {
    return `El CURP ${curp} ya tiene una cuenta registrada.`;
  }

  if (code === 'forbidden' || code === 'unauthorized') {
    return 'Tu sesión no tiene permiso para dar de alta participantes. ' +
      'Vuelve a iniciar sesión como administrador e inténtalo de nuevo.';
  }

  if (msg.includes('function not found') || msg.includes('failed to send a request')) {
    return 'No se encontró el servicio de alta de participantes. ' +
      'Hace falta desplegar la función create-participant en Supabase.';
  }

  if (msg.includes('password')) {
    return 'La contraseña por defecto no cumple los requisitos configurados en Supabase. ' +
      'Revisa VITE_DEFAULT_PASSWORD o la política de contraseñas del proyecto.';
  }

  if (msg.includes('failed to fetch') || msg.includes('networkerror')) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo; ' +
      'los datos capturados siguen en el formulario.';
  }

  return 'Error al crear usuario: ' + (err?.message || 'desconocido');
}

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
    // Estos cuatro los protege el trigger trg_enforce_profile_safe_update: el
    // participante no puede corregirlos después desde su perfil, así que si no
    // se capturan aquí la cuenta queda incompleta y solo un admin puede
    // arreglarla.
    if (!form.tipoParticipante) e.tipoParticipante = 'Selecciona el tipo de participante';
    if (!form.programa) e.programa = 'Selecciona el programa';
    if (!form.distrito) e.distrito = 'Selecciona la zona o distrito';
    if (!form.status) e.status = 'Selecciona el status';
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
    if (Object.keys(errs).length) {
      setErrors(errs);
      // Los campos obligatorios están repartidos por todo el formulario, así
      // que sin este aviso el botón parecería no hacer nada.
      setGeneralError('Faltan campos obligatorios por llenar. Revisa los marcados en rojo.');
      return;
    }

    setSaving(true);
    try {
      // La cuenta se crea en una Edge Function con la API de admin, que la deja
      // ya confirmada y no envía correo de verificación. Hacerlo con signUp()
      // desde aquí dispararía un correo a una dirección interna inexistente.
      const { data, error: fnErr } = await supabase.functions.invoke('create-participant', {
        body: { curp: form.curp, password: DEFAULT_PASSWORD },
      });

      // functions.invoke envuelve los errores HTTP; el detalle viene en el cuerpo.
      if (fnErr) {
        let detail = null;
        try { detail = await fnErr.context?.json(); } catch { /* sin cuerpo JSON */ }
        throw Object.assign(new Error(detail?.message || fnErr.message), { code: detail?.error });
      }
      if (data?.error) throw Object.assign(new Error(data.message || data.error), { code: data.error });

      const newUid = data?.uid;
      if (!newUid) throw new Error('No se recibió el id del nuevo usuario.');
      await createUserDocument(newUid, { ...form });
      setCreated({ uid: newUid, curp: form.curp, password: DEFAULT_PASSWORD });
      setForm(emptyForm);
    } catch (err) {
      setGeneralError(describeSignupError(err, form.curp));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
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
              <SectionTitle>Datos de los padres / tutor</SectionTitle>
              <Alert type="warning">Participante menor de edad — datos del padre o tutor obligatorios.</Alert>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <Field label="Teléfono de casa">
                  <Input value={form.telefonoCasa} onChange={e => set('telefonoCasa', e.target.value)} maxLength={10} />
                </Field>
              </div>

              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#374151', marginTop: '6px' }}>Padre</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <Field label="Nombre del padre" required error={errors.tutorNombre}>
                  <Input value={form.nombrePadre} onChange={e => { set('nombrePadre', e.target.value); set('tutorNombre', e.target.value); }} error={errors.tutorNombre} />
                </Field>
                <Field label="Teléfono del padre" required error={errors.tutorTelefono}>
                  <Input value={form.telefonoPadre} onChange={e => { set('telefonoPadre', e.target.value); set('tutorTelefono', e.target.value); }} maxLength={10} error={errors.tutorTelefono} />
                </Field>
                <Field label="Correo del padre">
                  <Input type="email" value={form.correoPadre} onChange={e => { set('correoPadre', e.target.value); set('tutorCorreo', e.target.value); }} />
                </Field>
              </div>

              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#374151', marginTop: '6px' }}>Madre</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <Field label="Nombre de la madre">
                  <Input value={form.nombreMadre} onChange={e => set('nombreMadre', e.target.value)} />
                </Field>
                <Field label="Teléfono de la madre">
                  <Input value={form.telefonoMadre} onChange={e => set('telefonoMadre', e.target.value)} maxLength={10} />
                </Field>
                <Field label="Correo de la madre">
                  <Input type="email" value={form.correoMadre} onChange={e => set('correoMadre', e.target.value)} />
                </Field>
              </div>

              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#374151', marginTop: '6px' }}>Información adicional</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <Field label="Alergias">
                  <Input value={form.alergias} onChange={e => set('alergias', e.target.value)} />
                </Field>
                <Field label="Talla de playera">
                  <Input value={form.tallaPlayera} onChange={e => set('tallaPlayera', e.target.value)} />
                </Field>
                <Field label="Seguro médico / emergencia">
                  <Input value={form.seguroMedico} onChange={e => set('seguroMedico', e.target.value)} />
                </Field>
              </div>
            </>
          )}

          <SectionTitle>Programa</SectionTitle>
          <p style={{ margin: '-4px 0 4px', fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.45 }}>
            El participante no puede editar estos datos desde su perfil, así que hay que
            capturarlos aquí.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
            <Field label="Tipo de participante" required error={errors.tipoParticipante}>
              <Select
                value={form.tipoParticipante}
                onChange={e => set('tipoParticipante', e.target.value)}
                error={errors.tipoParticipante}
              >
                <option value="">Selecciona...</option>
                <option value="Beneficiario">Beneficiario</option>
                <option value="Voluntario">Voluntario</option>
              </Select>
            </Field>
            <Field label="Programa" required error={errors.programa}>
              <Select
                value={form.programa}
                onChange={e => set('programa', e.target.value)}
                error={errors.programa}
              >
                <option value="">Selecciona...</option>
                {PROGRAMAS.map(p => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
            <Field label="Zona/Distrito" required error={errors.distrito}>
              <Select
                value={form.distrito}
                onChange={e => set('distrito', e.target.value)}
                error={errors.distrito}
              >
                <option value="">Selecciona...</option>
                {DISTRITOS.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
            </Field>
            <Field label="Status" required error={errors.status}>
              <Select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                error={errors.status}
              >
                <option value="">Selecciona...</option>
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
    </AdminLayout>
  );
}
