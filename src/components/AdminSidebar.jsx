import { NavLink } from 'react-router-dom';

const BRAND_COLOR = '#1A56A4';

const items = [
  { to: '/admin', label: 'Participantes', icon: '👥', end: true },
  { to: '/admin/estadisticas', label: 'Estadísticas', icon: '📊' },
  { to: '/admin/nuevo', label: 'Nuevo participante', icon: '➕' },
];

export function AdminSidebar() {
  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      background: 'white',
      borderRight: '1px solid #E5E7EB',
      minHeight: 'calc(100vh - 60px)',
      padding: '20px 0',
      position: 'sticky',
      top: '60px',
      alignSelf: 'flex-start',
    }}>
      <p style={{
        margin: '0 20px 12px',
        fontSize: '0.7rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#6B7280',
      }}>Administración</p>
      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map(it => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 20px',
              fontSize: '0.88rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? BRAND_COLOR : '#374151',
              background: isActive ? '#E8F0FB' : 'transparent',
              borderLeft: `3px solid ${isActive ? BRAND_COLOR : 'transparent'}`,
              textDecoration: 'none',
            })}
          >
            <span style={{ fontSize: '1rem' }}>{it.icon}</span>
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
