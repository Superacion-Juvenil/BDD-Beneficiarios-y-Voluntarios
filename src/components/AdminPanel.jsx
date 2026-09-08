import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from '../hooks/useUser';
import { calcAge, isMinor } from '../lib/curp';
import { AdminLayout } from './AdminLayout';
import { Spinner } from './ui/Spinner';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';
import { Select } from './ui/Field';

const BRAND_COLOR = '#1A56A4';

// Valor centinela para "este campo está vacío". Se necesita porque la cadena
// vacía ya significa "sin filtro" en los <select>.
const SIN_ASIGNAR = '__sin_asignar__';

const FILTROS_INICIALES = {
  programa: '', distrito: '', tipo: '', status: '', edad: '', docs: '',
};

function coincideCampo(valor, filtro) {
  if (!filtro) return true;
  const v = (valor || '').trim();
  return filtro === SIN_ASIGNAR ? v === '' : v === filtro;
}

/**
 * Zona de un distrito, para agrupar en el filtro las variantes que conviven
 * en la base. El catálogo actual nombra las zonas como "Zona/Campus"
 * ("Norte/UNI"), pero hay registros previos con sólo la zona ("Norte"): son
 * el mismo distrito escrito de dos formas. Tomando la parte anterior a la
 * diagonal, una sola opción del filtro alcanza a ambos.
 *
 * Sólo aplica al filtro de distrito: la tabla sigue mostrando el valor tal
 * como está guardado, y la base no se modifica. La regla no se generaliza a
 * otros campos porque ahí la diagonal no significa lo mismo (el programa
 * heredado "MJ Sec/Prepa" no es una zona "MJ Sec").
 */
function zonaDistrito(distrito) {
  const v = (distrito || '').trim();
  if (!v) return '';
  return v.split('/')[0].trim();
}

function SelectFiltro({ etiqueta, valor, onChange, children }) {
  const activo = Boolean(valor);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '130px' }}>
      <span style={{
        fontSize: '0.68rem', fontWeight: 600, color: '#9CA3AF',
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>{etiqueta}</span>
      <Select
        value={valor}
        onChange={onChange}
        style={{
          fontSize: '0.82rem', padding: '6px 8px',
          borderColor: activo ? BRAND_COLOR : '#D1D5DB',
          background: activo ? '#EFF6FF' : 'white',
          fontWeight: activo ? 600 : 400,
        }}
      >
        {children}
      </Select>
    </label>
  );
}

/**
 * Fecha corta para la tabla ("07 sep 2026"). El resto de la app usa el mes
 * completo, pero aquí la columna convive con otras siete y el formato largo
 * la desborda. La fecha y hora exactas van en el title de la celda.
 */
function formatActualizado(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function tituloActualizado(iso) {
  if (!iso) return 'Sin registro de actualización';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Sin registro de actualización';
  return d.toLocaleString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function tieneDocsPendientes(u) {
  return !u.docTerminos || !u.docCartaResponsiva || !u.docCapacitacionPASI;
}

function calcularStats(lista) {
  return {
    total: lista.length,
    beneficiarios: lista.filter(u => u.tipoParticipante === 'Beneficiario').length,
    voluntarios: lista.filter(u => u.tipoParticipante === 'Voluntario').length,
    menores: lista.filter(u => isMinor(u.fechaNacimiento)).length,
    docsPendientes: lista.filter(tieneDocsPendientes).length,
    eventos: lista.reduce((sum, u) => sum + (u.eventos || []).length, 0),
  };
}

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
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);

  const setFiltro = (campo, valor) => setFiltros(prev => ({ ...prev, [campo]: valor }));
  const limpiarFiltros = () => { setFiltros(FILTROS_INICIALES); setSearch(''); };

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Totales de toda la base. Alimentan los badges de la barra lateral, que
  // son navegación y no deben moverse con los filtros de esta pantalla.
  const totales = useMemo(() => calcularStats(users), [users]);

  /**
   * Las opciones se derivan de los datos, no del catálogo fijo de la app,
   * porque la base tiene valores heredados que el catálogo ya no lista
   * (por ejemplo "Norte" además de "Norte/UNI"). Si se armaran del catálogo,
   * esos participantes quedarían inalcanzables desde el filtro.
   */
  const opciones = useMemo(() => {
    const distintos = (campo, normaliza = v => v) => {
      const vals = new Set();
      let hayVacios = false;
      users.forEach(u => {
        const v = normaliza((u[campo] || '').trim()).trim();
        if (v) vals.add(v); else hayVacios = true;
      });
      return {
        valores: [...vals].sort((a, b) => a.localeCompare(b, 'es')),
        hayVacios,
      };
    };
    return {
      programa: distintos('programa'),
      distrito: distintos('distrito', zonaDistrito),
      tipo: distintos('tipoParticipante'),
      status: distintos('status'),
    };
  }, [users]);

  const filtrosActivos = useMemo(
    () => Object.values(filtros).filter(Boolean).length + (search.trim() ? 1 : 0),
    [filtros, search],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(u => {
      if (q) {
        const name = `${u.nombre || ''} ${u.apellidoPaterno || ''} ${u.apellidoMaterno || ''}`.toLowerCase();
        const coincide = (
          name.includes(q) ||
          (u.curp || '').toLowerCase().includes(q) ||
          (u.programa || '').toLowerCase().includes(q) ||
          (u.municipio || '').toLowerCase().includes(q) ||
          (u.distrito || '').toLowerCase().includes(q)
        );
        if (!coincide) return false;
      }

      if (!coincideCampo(u.programa, filtros.programa)) return false;
      if (!coincideCampo(zonaDistrito(u.distrito), filtros.distrito)) return false;
      if (!coincideCampo(u.tipoParticipante, filtros.tipo)) return false;
      if (!coincideCampo(u.status, filtros.status)) return false;

      if (filtros.edad) {
        const menor = isMinor(u.fechaNacimiento);
        if (filtros.edad === 'menores' && !menor) return false;
        if (filtros.edad === 'mayores' && menor) return false;
      }

      if (filtros.docs) {
        const pendientes = tieneDocsPendientes(u);
        if (filtros.docs === 'pendientes' && !pendientes) return false;
        if (filtros.docs === 'completos' && pendientes) return false;
      }

      return true;
    });
  }, [users, search, filtros]);

  // Indicadores de lo que está en pantalla: se recalculan con cada filtro.
  const stats = useMemo(() => calcularStats(filtered), [filtered]);

  return (
    <AdminLayout
      usersBadge={loading ? null : totales.total}
      eventsBadge={loading ? null : totales.eventos}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#111827' }}>Panel de Administración</h1>
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>Ver mi perfil</Button>
      </div>

      {error && <Alert type="error" style={{ marginBottom: '16px' }}>{error}</Alert>}

      {loading ? <Spinner /> : (
        <>
          {/* Stats — reflejan el resultado del filtrado, no toda la base */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
              <StatCard
                label={filtrosActivos > 0 ? 'Participantes filtrados' : 'Total participantes'}
                value={stats.total}
              />
              <StatCard label="Beneficiarios" value={stats.beneficiarios} color="#059669" />
              <StatCard label="Voluntarios" value={stats.voluntarios} color="#7C3AED" />
              <StatCard label="Menores de edad" value={stats.menores} color="#D97706" />
              <StatCard label="Docs pendientes" value={stats.docsPendientes} color="#DC2626" />
              <StatCard label="Eventos" value={stats.eventos} color="#7c3aed" />
            </div>
            {filtrosActivos > 0 && (
              <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: '#6B7280' }}>
                Los indicadores corresponden a los {stats.total} participantes filtrados,
                de {totales.total} en total.{' '}
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  style={{
                    background: 'none', border: 'none', padding: 0, font: 'inherit',
                    color: BRAND_COLOR, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
                  }}
                >
                  Ver todos
                </button>
              </p>
            )}
          </div>

          {/* Search */}
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
                  <strong style={{ color: '#111827' }}>{filtered.length}</strong> de {users.length}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <SelectFiltro etiqueta="Programa" valor={filtros.programa} onChange={e => setFiltro('programa', e.target.value)}>
                  <option value="">Todos</option>
                  {opciones.programa.valores.map(v => <option key={v} value={v}>{v}</option>)}
                  {opciones.programa.hayVacios && <option value={SIN_ASIGNAR}>(sin asignar)</option>}
                </SelectFiltro>

                <SelectFiltro etiqueta="Distrito" valor={filtros.distrito} onChange={e => setFiltro('distrito', e.target.value)}>
                  <option value="">Todos</option>
                  {opciones.distrito.valores.map(v => <option key={v} value={v}>{v}</option>)}
                  {opciones.distrito.hayVacios && <option value={SIN_ASIGNAR}>(sin asignar)</option>}
                </SelectFiltro>

                <SelectFiltro etiqueta="Tipo" valor={filtros.tipo} onChange={e => setFiltro('tipo', e.target.value)}>
                  <option value="">Todos</option>
                  {opciones.tipo.valores.map(v => <option key={v} value={v}>{v}</option>)}
                  {opciones.tipo.hayVacios && <option value={SIN_ASIGNAR}>(sin asignar)</option>}
                </SelectFiltro>

                <SelectFiltro etiqueta="Status" valor={filtros.status} onChange={e => setFiltro('status', e.target.value)}>
                  <option value="">Todos</option>
                  {opciones.status.valores.map(v => <option key={v} value={v}>{v}</option>)}
                  {opciones.status.hayVacios && <option value={SIN_ASIGNAR}>(sin asignar)</option>}
                </SelectFiltro>

                <SelectFiltro etiqueta="Edad" valor={filtros.edad} onChange={e => setFiltro('edad', e.target.value)}>
                  <option value="">Todas</option>
                  <option value="menores">Menores de edad</option>
                  <option value="mayores">Mayores de edad</option>
                </SelectFiltro>

                <SelectFiltro etiqueta="Documentos" valor={filtros.docs} onChange={e => setFiltro('docs', e.target.value)}>
                  <option value="">Todos</option>
                  <option value="pendientes">Con pendientes</option>
                  <option value="completos">Completos</option>
                </SelectFiltro>

                {filtrosActivos > 0 && (
                  <Button
                    variant="ghost"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={limpiarFiltros}
                  >
                    Limpiar ({filtrosActivos})
                  </Button>
                )}
              </div>
            </div>

            {/* User list */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Participante', 'CURP', 'Programa', 'Distrito', 'Edad', 'Estado', 'Actualizado', ''].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                      No se encontraron participantes
                      {filtrosActivos > 0 && ' con los filtros aplicados'}
                    </td></tr>
                  )}
                  {filtered.map((u, i) => {
                    const age = calcAge(u.fechaNacimiento);
                    const minor = isMinor(u.fechaNacimiento);
                    const docsPending = tieneDocsPendientes(u);
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
                        <td
                          style={{ padding: '10px 16px', color: '#6B7280', whiteSpace: 'nowrap' }}
                          title={tituloActualizado(u.updatedAt)}
                        >
                          {formatActualizado(u.updatedAt)}
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
    </AdminLayout>
  );
}
