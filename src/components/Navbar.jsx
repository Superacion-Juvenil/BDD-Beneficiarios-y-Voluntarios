import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';

const BRAND_COLOR = '#1A56A4';

export function Navbar({ onAdminClick, showAdminBtn }) {
  const { userData, isAdmin, logout, user } = useAuth();

  const displayName = isAdmin
    ? 'Administrador'
    : userData
      ? `${userData.nombre || ''} ${userData.apellidoPaterno || ''}`.trim()
      : user?.email?.split('@')[0] || 'Usuario';

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <nav style={{
      background: BRAND_COLOR,
      color: 'white',
      padding: '0 20px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo + Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="26" height="18" viewBox="0 0 52 36" fill="none">
            <ellipse cx="10" cy="12" rx="5" ry="5" fill="white" opacity="0.9"/>
            <path d="M2 34c0-6 3.5-10 8-10s8 4 8 10H2z" fill="white" opacity="0.9"/>
            <ellipse cx="26" cy="10" rx="6" ry="6" fill="white"/>
            <path d="M17 34c0-7 4-11 9-11s9 4 9 11H17z" fill="white"/>
            <ellipse cx="42" cy="12" rx="5" ry="5" fill="white" opacity="0.9"/>
            <path d="M34 34c0-6 3.5-10 8-10s8 4 8 10H34z" fill="white" opacity="0.9"/>
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
          Superación Juvenil A.B.P.
        </span>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {showAdminBtn && (
          <Button variant="ghost" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', padding: '6px 14px', fontSize: '0.8rem' }} onClick={onAdminClick}>
            Panel Admin
          </Button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.8rem',
          }}>
            {initials || '?'}
          </div>
          <span style={{ fontSize: '0.85rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayName}
          </span>
        </div>
        <button
          onClick={logout}
          style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: 'white', padding: '6px 12px', borderRadius: '6px',
            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
          }}
        >
          Salir
        </button>
      </div>
    </nav>
  );
}
