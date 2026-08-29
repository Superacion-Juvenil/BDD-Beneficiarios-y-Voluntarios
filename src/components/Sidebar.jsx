import { useAuth } from '../hooks/useAuth';

function SidebarLogo() {
  return (
    <div style={{
      padding: '18px 16px 14px',
      borderBottom: '1px solid rgba(255,255,255,0.12)',
      display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <div style={{
        width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)',
        borderRadius: '8px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="28" height="20" viewBox="0 0 52 36" fill="none" aria-hidden="true">
          <ellipse cx="10" cy="12" rx="5" ry="5" fill="white" opacity="0.9"/>
          <path d="M2 34c0-6 3.5-10 8-10s8 4 8 10H2z" fill="white" opacity="0.9"/>
          <ellipse cx="26" cy="10" rx="6" ry="6" fill="white"/>
          <path d="M17 34c0-7 4-11 9-11s9 4 9 11H17z" fill="white"/>
          <ellipse cx="42" cy="12" rx="5" ry="5" fill="white" opacity="0.9"/>
          <path d="M34 34c0-6 3.5-10 8-10s8 4 8 10H34z" fill="white" opacity="0.9"/>
        </svg>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.25 }}>
          Superación Juvenil A.B.P.
        </div>
        <div style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '1px' }}>
          Plataforma BDD
        </div>
      </div>
    </div>
  );
}

function UserInfo() {
  const { userData, isAdmin, user } = useAuth();

  const name = isAdmin
    ? 'Administrador'
    : [userData?.nombre, userData?.apellidoPaterno].filter(Boolean).join(' ')
      || user?.email?.split('@')[0]
      || 'Usuario';

  const role = isAdmin
    ? 'Administrador'
    : userData?.programa || userData?.tipoParticipante || 'Participante';

  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.12)',
      display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <div style={{
        width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
        background: 'rgba(255,255,255,0.18)',
        border: '2px solid rgba(255,255,255,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: '0.95rem',
      }}>
        {(name[0] || '?').toUpperCase()}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: '0.82rem',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{name}</div>
        <div style={{
          fontSize: '0.7rem', opacity: 0.75, marginTop: '1px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{role}</div>
      </div>
    </div>
  );
}

const itemBaseStyle = {
  display: 'flex', alignItems: 'center', gap: '10px',
  width: '100%', padding: '11px 16px',
  border: 'none', color: 'white', cursor: 'pointer',
  textAlign: 'left', fontSize: '0.85rem',
  transition: 'background 0.15s',
};

function NavItem({ icon, label, badge, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      style={{
        ...itemBaseStyle,
        background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
        borderLeft: active ? '3px solid white' : '3px solid transparent',
        fontWeight: active ? 600 : 400,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <span aria-hidden="true" style={{ fontSize: '1rem', width: '20px', textAlign: 'center', flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && (
        <span style={{
          background: 'rgba(255,255,255,0.22)', borderRadius: '10px',
          padding: '1px 7px', fontSize: '0.72rem', fontWeight: 700,
        }}>{badge}</span>
      )}
    </button>
  );
}

/**
 * Barra lateral persistente.
 * `items`: [{ id, icon, label, badge, active, onClick }]
 * `open` / `onToggle` los controla Layout para coordinar el backdrop en móvil.
 */
export function Sidebar({ items, open, onToggle, onNavigate }) {
  const { logout } = useAuth();

  return (
    <nav
      className={`sj-sidebar${open ? ' open' : ''}`}
      aria-label="Navegación principal"
    >
      <SidebarLogo />
      <UserInfo />

      <div style={{ flex: 1, padding: '8px 0' }}>
        {items.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            active={item.active}
            onClick={() => { item.onClick(); onNavigate?.(); }}
          />
        ))}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', padding: '8px 0' }}>
        <button
          onClick={logout}
          style={{ ...itemBaseStyle, background: 'transparent', borderLeft: '3px solid transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span aria-hidden="true" style={{ fontSize: '1rem', width: '20px', textAlign: 'center' }}>↩</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </nav>
  );
}
