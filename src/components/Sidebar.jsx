import { useState } from 'react';
import '../index.css';

const BRAND = '#1A56A4';

function SidebarLogo() {
  return (
    <div style={{
      padding: '20px 16px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.12)',
      display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <div style={{
        width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)',
        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="28" height="20" viewBox="0 0 52 36" fill="none">
          <ellipse cx="10" cy="12" rx="5" ry="5" fill="white" opacity="0.9"/>
          <path d="M2 34c0-6 3.5-10 8-10s8 4 8 10H2z" fill="white" opacity="0.9"/>
          <ellipse cx="26" cy="10" rx="6" ry="6" fill="white"/>
          <path d="M17 34c0-7 4-11 9-11s9 4 9 11H17z" fill="white"/>
          <ellipse cx="42" cy="12" rx="5" ry="5" fill="white" opacity="0.9"/>
          <path d="M34 34c0-6 3.5-10 8-10s8 4 8 10H34z" fill="white" opacity="0.9"/>
        </svg>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.82rem', lineHeight: 1.2 }}>Superación Juvenil A.B.P.</div>
        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '1px' }}>Plataforma BDD</div>
      </div>
    </div>
  );
}

function UserInfo({ userData, isAdmin }) {
  const name = isAdmin
    ? 'Administrador'
    : [userData?.nombre, userData?.apellidoPaterno].filter(Boolean).join(' ') || 'Usuario';

  const role = isAdmin
    ? 'Admin'
    : userData?.tipoParticipante || userData?.programa || 'Participante';

  const initial = (name[0] || '?').toUpperCase();

  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.12)',
      display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <div style={{
        width: '38px', height: '38px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.18)',
        border: '2px solid rgba(255,255,255,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: '0.95rem', flexShrink: 0,
      }}>
        {initial}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </div>
        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {role}
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, badge, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        width: '100%', padding: '11px 16px',
        background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
        border: 'none',
        borderLeft: active ? '3px solid white' : '3px solid transparent',
        color: 'white', cursor: 'pointer', textAlign: 'left',
        fontSize: '0.85rem', fontWeight: active ? 600 : 400,
        transition: 'background 0.15s, border-left 0.15s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ fontSize: '1rem', width: '20px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && (
        <span style={{
          background: 'rgba(255,255,255,0.22)', borderRadius: '10px',
          padding: '1px 7px', fontSize: '0.72rem', fontWeight: 700,
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

export function Sidebar({ activeSection, onSectionChange, isAdmin, userData, onLogout, badges = {} }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function select(section) {
    onSectionChange(section);
    setMobileOpen(false);
  }

  const userItems = [
    { id: 'perfil',       icon: '👤', label: 'Perfil' },
    { id: 'evaluaciones', icon: '📝', label: 'Evaluaciones', badge: badges.evaluaciones },
  ];

  const adminItems = [
    { id: 'usuarios',     icon: '👥', label: 'Usuarios',     badge: badges.usuarios },
    { id: 'agregar',      icon: '➕', label: 'Agregar' },
    { id: 'evaluaciones', icon: '📝', label: 'Evaluaciones', badge: badges.evaluaciones },
    { id: 'eventos',      icon: '🎯', label: 'Eventos',      badge: badges.eventos },
  ];

  const items = isAdmin ? adminItems : userItems;

  return (
    <>
      {/* Hamburger */}
      <button
        className="sj-burger"
        aria-label="Menú"
        onClick={() => setMobileOpen(o => !o)}
      >
        ☰
      </button>

      {/* Backdrop */}
      <div
        className={`sj-backdrop${mobileOpen ? ' open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar — add .open class on mobile when open */}
      <nav
        className={`sj-sidebar${mobileOpen ? ' open' : ''}`}
        aria-label="Navegación principal"
      >
        <SidebarLogo />
        <UserInfo userData={userData} isAdmin={isAdmin} />

        <div style={{ flex: 1, padding: '8px 0' }}>
          {items.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              active={activeSection === item.id}
              onClick={() => select(item.id)}
            />
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', padding: '8px 0' }}>
          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '11px 16px',
              background: 'transparent', border: 'none',
              borderLeft: '3px solid transparent',
              color: 'white', cursor: 'pointer', fontSize: '0.85rem',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: '1rem', width: '20px', textAlign: 'center' }}>↩</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </nav>
    </>
  );
}
