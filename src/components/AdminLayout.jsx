import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './Layout';

const NAV_ITEMS = [
  { id: 'participantes', path: '/admin',              label: 'Usuarios',           icon: '👥', exact: true },
  { id: 'nuevo',         path: '/admin/nuevo',        label: 'Agregar',            icon: '➕' },
  { id: 'estadisticas',  path: '/admin/estadisticas', label: 'Estadísticas',       icon: '📊' },
  { id: 'evaluaciones',  path: '/admin/evaluaciones', label: 'Evaluaciones',       icon: '📝' },
  { id: 'eventos',       path: '/admin/eventos',      label: 'Eventos',            icon: '🎯' },
];

export function AdminLayout({ children, usersBadge, evalsBadge, eventsBadge }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const badges = {
    participantes: usersBadge,
    evaluaciones: evalsBadge,
    eventos: eventsBadge,
  };

  const items = NAV_ITEMS.map(item => ({
    id: item.id,
    icon: item.icon,
    label: item.label,
    badge: badges[item.id],
    active: item.exact ? pathname === item.path : pathname.startsWith(item.path),
    onClick: () => navigate(item.path),
  }));

  return <Layout items={items} maxWidth="1280px">{children}</Layout>;
}
