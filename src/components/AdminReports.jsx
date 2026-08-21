import { useEffect, useState } from 'react';
import { getAllUsers } from '../hooks/useUser';
import { AdminLayout } from './AdminLayout';
import { Spinner } from './ui/Spinner';
import { Alert } from './ui/Alert';
import {
  reporteDirectorio,
  reporteMenores,
  reporteDocumentacion,
  reporteSinRoble,
  reportePorTipo,
  reporteEstadisticas,
} from '../lib/reports';

const BRAND = '#1A56A4';

function ReportCard({ icon, title, description, count, action, actionLabel, color = BRAND }) {
  return (
    <div style={{
      background: 'white', borderRadius: '12px', padding: '18px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      borderTop: `4px solid ${color}`,
      display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: `${color}18`, color, fontSize: '1.3rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#111827' }}>{title}</h3>
          <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '0.82rem', lineHeight: 1.4 }}>{description}</p>
          {count != null && (
            <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#374151', fontWeight: 600 }}>
              {count} {count === 1 ? 'registro' : 'registros'}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={action}
        style={{
          padding: '9px 14px', borderRadius: '8px', border: 'none',
          background: color, color: 'white', fontWeight: 600, fontSize: '0.85rem',
          cursor: 'pointer', alignSelf: 'flex-start',
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

export function AdminReports() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const menores = users.filter(u => {
    const d = u.fechaNacimiento;
    if (!d) return false;
    const [y, m, dd] = d.split('-').map(Number);
    if (!y) return false;
    const today = new Date();
    let age = today.getFullYear() - y;
    const mm = today.getMonth() + 1;
    if (mm < m || (mm === m && today.getDate() < dd)) age--;
    return age < 18;
  }).length;
  const sinRoble = users.filter(u => !u.docCapacitacionPASI).length;
  const docsPendientes = users.filter(u => !u.docTerminos || !u.docCartaResponsiva || !u.docCapacitacionPASI).length;
  const beneficiarios = users.filter(u => u.tipoParticipante === 'Beneficiario').length;
  const voluntarios = users.filter(u => u.tipoParticipante === 'Voluntario').length;

  return (
    <AdminLayout>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#111827' }}>Reportes descargables</h1>
        <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '0.9rem' }}>
          Descarga la información en Excel para compartirla con coordinadores u otras áreas.
        </p>
      </div>

      {error && <Alert type="error" style={{ marginBottom: '16px' }}>{error}</Alert>}

      {loading ? <Spinner /> : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px',
        }}>
          <ReportCard
            icon="📇"
            title="Directorio general"
            description="Todos los participantes con datos de contacto, separados por programa en pestañas."
            count={users.length}
            actionLabel="Descargar Excel"
            action={() => reporteDirectorio(users)}
          />
          <ReportCard
            icon="📊"
            title="Estadísticas globales"
            description="Resumen con conteos por programa, distrito, municipio, escuela, carrera y sexo."
            count={users.length}
            actionLabel="Descargar Excel"
            color="#0891B2"
            action={() => reporteEstadisticas(users)}
          />
          <ReportCard
            icon="🧒"
            title="Menores de edad"
            description="Menores con datos completos de padre, madre, teléfono de casa, alergias y seguro médico."
            count={menores}
            color="#D97706"
            actionLabel="Descargar Excel"
            action={() => reporteMenores(users)}
          />
          <ReportCard
            icon="📝"
            title="Documentación pendiente"
            description="Hojas separadas por documento faltante: Términos, Carta responsiva y Fundación Roble."
            count={docsPendientes}
            color="#DC2626"
            actionLabel="Descargar Excel"
            action={() => reporteDocumentacion(users)}
          />
          <ReportCard
            icon="🎓"
            title="Sin capacitación Fundación Roble"
            description="Personas que aún no han tomado el curso PASI, listas para invitar a la siguiente sesión."
            count={sinRoble}
            color="#B91C1C"
            actionLabel="Descargar Excel"
            action={() => reporteSinRoble(users)}
          />
          <ReportCard
            icon="🌱"
            title="Beneficiarios"
            description="Sólo beneficiarios con escuela, grado y carrera."
            count={beneficiarios}
            color="#059669"
            actionLabel="Descargar Excel"
            action={() => reportePorTipo(users, 'Beneficiario')}
          />
          <ReportCard
            icon="🤝"
            title="Voluntarios"
            description="Sólo voluntarios con ocupación, empresa y voluntariado externo."
            count={voluntarios}
            color="#7C3AED"
            actionLabel="Descargar Excel"
            action={() => reportePorTipo(users, 'Voluntario')}
          />
        </div>
      )}
    </AdminLayout>
  );
}
