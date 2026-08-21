import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';

const BRAND_COLOR = '#1A56A4';

const NAV_ITEMS = [
  { path: '/admin',              label: 'Participantes', icon: '👥', exact: true },
  { path: '/admin/nuevo',        label: 'Nuevo participante', icon: '➕' },
  { path: '/admin/estadisticas', label: 'Estadísticas',  icon: '📊' },
  { path: '/admin/reportes',     label: 'Reportes',      icon: '📥' },
  { path: '/admin/evaluaciones', label: 'Evaluaciones',  icon: '📝' },
  { path: '/admin/eventos',      label: 'Eventos',       icon: '🎯' },
];

export function AdminLayout({ children, eventsBadge }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function isActive(item) {
    return item.exact ? pathname === item.path : pathname.startsWith(item.path);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column' }}>
      <Navbar showAdminBtn={false} />
      <div style={{ display: 'flex', flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '0 12px' }}>

        {/* Sidebar */}
        <aside style={{
          width: '220px', flexShrink: 0, paddingTop: '24px', paddingRight: '16px',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {NAV_ITEMS.map(item => {
            const active = isActive(item);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: active ? `${BRAND_COLOR}15` : 'transparent',
                  color: active ? BRAND_COLOR : '#374151',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.15s',
                  borderLeft: active ? `3px solid ${BRAND_COLOR}` : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F3F4F6'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.path === '/admin/eventos' && eventsBadge != null && (
                  <span style={{
                    background: '#7c3aed', color: 'white', borderRadius: '10px',
                    padding: '1px 7px', fontSize: '0.72rem', fontWeight: 700,
                  }}>{eventsBadge}</span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0, paddingTop: '24px', paddingBottom: '40px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
