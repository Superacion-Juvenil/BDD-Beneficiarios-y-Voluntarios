import { useEffect, useMemo, useState } from 'react';
import { getAllUsers } from '../hooks/useUser';
import { calcAge } from '../lib/curp';
import { AdminLayout } from './AdminLayout';
import { Spinner } from './ui/Spinner';
import { Alert } from './ui/Alert';
import { Card, HBarChart, GroupedBarChart, DonutChart } from './charts/Charts';

const BRAND_COLOR = '#1A56A4';
const MALE_COLOR = '#1A56A4';
const FEMALE_COLOR = '#DB2777';

function norm(s) {
  return (s || '').trim();
}

function countBy(items, getKey) {
  const map = new Map();
  for (const it of items) {
    const k = norm(getKey(it));
    if (!k) continue;
    map.set(k, (map.get(k) || 0) + 1);
  }
  return [...map.entries()].map(([label, value]) => ({ label, value }));
}

function ageBucket(age) {
  if (age == null) return null;
  if (age >= 13 && age <= 17) return '13–17';
  if (age >= 18 && age <= 21) return '18–21';
  if (age >= 22 && age <= 25) return '22–25';
  return null;
}

function sexOf(u) {
  const s = (u.sexo || '').toLowerCase().trim();
  if (s.startsWith('h') || s.startsWith('mas')) return 'Hombre';
  if (s.startsWith('m') || s.startsWith('f')) return 'Mujer';
  return null;
}

function StatCard({ label, value, color = BRAND_COLOR }) {
  return (
    <div style={{
      background: 'white', borderRadius: '10px', padding: '14px 18px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderTop: `4px solid ${color}`,
    }}>
      <p style={{ margin: 0, fontSize: '0.72rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ margin: '6px 0 0', fontSize: '1.8rem', fontWeight: 700, color: '#111827' }}>{value}</p>
    </div>
  );
}

export function AdminStats() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const data = useMemo(() => {
    const total = users.length;
    const beneficiarios = users.filter(u => u.tipoParticipante === 'Beneficiario');
    const voluntarios = users.filter(u => u.tipoParticipante === 'Voluntario');
    const activos = users.filter(u => (u.status || 'Activo') === 'Activo').length;

    // Programa × Sexo
    const programaSet = new Set(users.map(u => norm(u.programa)).filter(Boolean));
    const programas = [...programaSet].sort();
    const programaValuesH = {}, programaValuesM = {};
    for (const p of programas) {
      programaValuesH[p] = users.filter(u => norm(u.programa) === p && sexOf(u) === 'Hombre').length;
      programaValuesM[p] = users.filter(u => norm(u.programa) === p && sexOf(u) === 'Mujer').length;
    }

    // Sexo total
    const totalH = users.filter(u => sexOf(u) === 'Hombre').length;
    const totalM = users.filter(u => sexOf(u) === 'Mujer').length;

    // Edad × Sexo
    const buckets = ['13–17', '18–21', '22–25'];
    const edadH = {}, edadM = {};
    for (const b of buckets) { edadH[b] = 0; edadM[b] = 0; }
    for (const u of users) {
      const b = ageBucket(calcAge(u.fechaNacimiento));
      if (!b) continue;
      const sx = sexOf(u);
      if (sx === 'Hombre') edadH[b]++;
      else if (sx === 'Mujer') edadM[b]++;
    }

    // Distritos
    const distritos = countBy(users, u => u.distrito);

    // Municipios
    const municipios = countBy(users, u => u.municipio);

    // Beneficiarios con voluntariado activo (externo o servicio registrado)
    const benefConVol = beneficiarios.filter(u => norm(u.voluntariadoExterno) || norm(u.servicio) || norm(u.programasSJ)).length;

    // Escuelas (beneficiarios)
    const escuelas = countBy(beneficiarios, u => u.escuela);

    // Carreras (beneficiarios)
    const carreras = countBy(beneficiarios, u => u.carrera);

    // Ocupación (voluntarios)
    const ocupaciones = countBy(voluntarios, u => u.ocupacion);

    // Grado escolar
    const grados = countBy(users, u => u.gradoEscolar);

    // Documentación completa
    const docsCompletos = users.filter(u => u.docTerminos && u.docCartaResponsiva && u.docCapacitacionPASI).length;

    // Menores vs mayores
    const menores = users.filter(u => {
      const a = calcAge(u.fechaNacimiento);
      return a !== null && a < 18;
    }).length;

    return {
      total, beneficiarios: beneficiarios.length, voluntarios: voluntarios.length, activos,
      programas, programaValuesH, programaValuesM,
      totalH, totalM,
      edadBuckets: buckets, edadH, edadM,
      distritos, municipios,
      benefConVol,
      escuelas, carreras, ocupaciones, grados,
      docsCompletos, menores,
    };
  }, [users]);

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#111827' }}>Estadísticas</h1>
        <span style={{ color: '#6B7280', fontSize: '0.82rem' }}>{users.length} registros analizados</span>
      </div>

      {error && <Alert type="error" style={{ marginBottom: '16px' }}>{error}</Alert>}

      {loading ? <Spinner /> : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <StatCard label="Total" value={data.total} />
            <StatCard label="Beneficiarios" value={data.beneficiarios} color="#059669" />
            <StatCard label="Voluntarios" value={data.voluntarios} color="#7C3AED" />
            <StatCard label="Activos" value={data.activos} color="#0891B2" />
            <StatCard label="Hombres" value={data.totalH} color={MALE_COLOR} />
            <StatCard label="Mujeres" value={data.totalM} color={FEMALE_COLOR} />
            <StatCard label="Menores de edad" value={data.menores} color="#D97706" />
            <StatCard label="Benef. con voluntariado" value={data.benefConVol} color="#DB2777" />
            <StatCard label="Docs completos" value={data.docsCompletos} color="#65A30D" />
          </div>

          {/* Charts grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            <Card title="Hombres y mujeres por programa" subtitle="Distribución por sexo en cada programa">
              <GroupedBarChart
                categories={data.programas}
                series={[
                  { name: 'Hombres', color: MALE_COLOR, values: data.programaValuesH },
                  { name: 'Mujeres', color: FEMALE_COLOR, values: data.programaValuesM },
                ]}
              />
            </Card>

            <Card title="Distribución total por sexo" subtitle="Sobre el total de participantes">
              <DonutChart data={[
                { label: 'Hombres', value: data.totalH, color: MALE_COLOR },
                { label: 'Mujeres', value: data.totalM, color: FEMALE_COLOR },
              ]} />
            </Card>

            <Card title="Edad por sexo" subtitle="Bloques 13–17, 18–21, 22–25">
              <GroupedBarChart
                categories={data.edadBuckets}
                series={[
                  { name: 'Hombres', color: MALE_COLOR, values: data.edadH },
                  { name: 'Mujeres', color: FEMALE_COLOR, values: data.edadM },
                ]}
                height={200}
              />
            </Card>

            <Card title="Tipo de participante" subtitle="Beneficiarios vs voluntarios">
              <DonutChart data={[
                { label: 'Beneficiarios', value: data.beneficiarios, color: '#059669' },
                { label: 'Voluntarios', value: data.voluntarios, color: '#7C3AED' },
              ]} />
            </Card>

            <Card title="Participantes por distrito" subtitle="Top distritos">
              <HBarChart data={data.distritos} color="#1A56A4" />
            </Card>

            <Card title="Participantes por municipio" subtitle="Top municipios">
              <HBarChart data={data.municipios} color="#0891B2" />
            </Card>

            <Card title="Beneficiarios por escuela" subtitle="Top escuelas">
              <HBarChart data={data.escuelas} color="#059669" />
            </Card>

            <Card title="Beneficiarios por carrera" subtitle="Top carreras">
              <HBarChart data={data.carreras} color="#65A30D" />
            </Card>

            <Card title="Voluntarios por ocupación" subtitle="Top ocupaciones">
              <HBarChart data={data.ocupaciones} color="#7C3AED" />
            </Card>

            <Card title="Grado escolar" subtitle="Distribución académica">
              <HBarChart data={data.grados} color="#D97706" />
            </Card>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
