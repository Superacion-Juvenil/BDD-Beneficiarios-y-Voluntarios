import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from '../hooks/useUser';
import { calcAge, isMinor } from '../lib/curp';
import { Navbar } from './Navbar';
import { Spinner } from './ui/Spinner';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';

const BRAND_COLOR = '#1A56A4';

function StatCard({ label, value, color = BRAND_COLOR }) {
  return (
    <div style={{
      background: 'white', borderRadius: '10px', padding: '16px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      borderTop: `4px solid ${color}`,
    }}>
      <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ margin: '6px 0 0', fontSize: '2rem', fontWeight: 700, color: '#111827' }}>{value}</p>
    </div>
  );
}

export function AdminPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const beneficiarios = users.filter(u => u.tipoParticipante === 'Beneficiario').length;
    const voluntarios = users.filter(u => u.tipoParticipante === 'Voluntario').length;
    const menores = users.filter(u => isMinor(u.fechaNacimiento)).length;
    const docsPendientes = users.filter(u => !u.docTerminos || !u.docCartaResponsiva || !u.docCapacitacionPASI).length;
    return { total, beneficiarios, voluntarios, menores, docsPendientes };
  }, [users]);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u => {
      const name = `${u.nombre || ''} ${u.apellidoPaterno || ''} ${u.apellidoMaterno || ''}`.toLowerCase();
      return (
        name.includes(q) ||
        (u.curp || '').toLowerCase().includes(q) ||
        (u.programa || '').toLowerCase().includes(q) ||
        (u.municipio || '').toLowerCase().includes(q) ||
        (u.distrito || '').toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Navbar showAdminBtn={false} />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#111827' }}>Panel de Administración</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Ver mi perfil</Button>
            <Button onClick={() => navigate('/admin/nuevo')}>+ Nuevo participante</Button>
          </div>
        </div>

        {error && <Alert type="error" style={{ marginBottom: '16px' }}>{error}</Alert>}

        {loading ? <Spinner /> : (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <StatCard label="Total participantes" value={stats.total} />
              <StatCard label="Beneficiarios" value={stats.beneficiarios} color="#059669" />
              <StatCard label="Voluntarios" value={stats.voluntarios} color="#7C3AED" />
              <StatCard label="Menores de edad" value={stats.menores} color="#D97706" />
              <StatCard label="Docs pendientes" value={stats.docsPendientes} color="#DC2626" />
            </div>

            {/* Search */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <input
                  type="search"
                  placeholder="Buscar por nombre, CURP, programa, municipio, distrito..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    flex: 1, minWidth: '220px', padding: '9px 14px', borderRadius: '8px',
                    border: '1px solid #E5E7EB', fontSize: '0.88rem', outline: 'none',
                  }}
                />
                <span style={{ color: '#6B7280', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                  {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* User list */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      {['Participante', 'CURP', 'Programa', 'Distrito', 'Edad', 'Estado', ''].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>No se encontraron participantes</td></tr>
                    )}
                    {filtered.map((u, i) => {
                      const age = calcAge(u.fechaNacimiento);
                      const minor = isMinor(u.fechaNacimiento);
                      const docsPending = !u.docTerminos || !u.docCartaResponsiva || !u.docCapacitacionPASI;
                      const name = [u.nombre, u.apellidoPaterno, u.apellidoMaterno].filter(Boolean).join(' ') || '—';
                      const initials = [u.nombre?.[0], u.apellidoPaterno?.[0]].filter(Boolean).join('').toUpperCase() || '?';
                      return (
                        <tr key={u.uid} style={{ borderTop: '1px solid #F3F4F6', background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '32px', height: '32px', background: BRAND_COLOR,
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                              }}>{initials}</div>
                              <span style={{ fontWeight: 500, color: '#111827' }}>{name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: '0.78rem', color: '#6B7280' }}>{u.curp || '—'}</td>
                          <td style={{ padding: '10px 16px', color: '#374151' }}>{u.programa || '—'}</td>
                          <td style={{ padding: '10px 16px', color: '#374151' }}>{u.distrito || '—'}</td>
                          <td style={{ padding: '10px 16px', color: '#374151' }}>{age !== null ? `${age} a` : '—'}</td>
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {minor && <Badge variant="warning">Menor</Badge>}
                              {docsPending && <Badge variant="danger">Docs</Badge>}
                              {u.status && <Badge>{u.status}</Badge>}
                            </div>
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <Button variant="secondary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => navigate(`/admin/editar/${u.uid}`)}>
                              Editar
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
