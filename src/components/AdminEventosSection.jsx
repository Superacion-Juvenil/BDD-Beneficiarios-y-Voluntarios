import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, updateUserData } from '../hooks/useUser';
import { Navbar } from './Navbar';
import { Spinner } from './ui/Spinner';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';
import { RegistrarEventoForm } from './RegistrarEventoForm';
import { HistorialEventos } from './HistorialEventos';

const BRAND_COLOR = '#1A56A4';

export function AdminEventosSection() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('registrar');
  const [toast, setToast] = useState('');

  useEffect(() => {
    getAllUsers()
      .then(data => {
        setUsers(data.map(u => ({ ...u, eventos: u.eventos || [] })));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalEventos = useMemo(() => users.reduce((sum, u) => sum + (u.eventos || []).length, 0), [users]);

  async function handleRegister(entries) {
    // entries: [{ curp: uid, eventData }]
    await Promise.all(entries.map(({ curp: uid, eventData }) => {
      const user = users.find(u => u.uid === uid);
      const currentEventos = user?.eventos || [];
      return updateUserData(uid, { eventos: [...currentEventos, eventData] });
    }));
    // Update local state
    setUsers(prev => prev.map(u => {
      const entry = entries.find(e => e.curp === u.uid);
      if (!entry) return u;
      return { ...u, eventos: [...(u.eventos || []), entry.eventData] };
    }));
    const n = entries.length;
    setToast(`✓ Evento registrado para ${n} participante${n !== 1 ? 's' : ''}`);
    setTimeout(() => setToast(''), 4000);
  }

  async function handleUpdate(uid, evId, newComment) {
    const user = users.find(u => u.uid === uid);
    if (!user) throw new Error('Usuario no encontrado');
    const newEventos = (user.eventos || []).map(ev => ev.id === evId ? { ...ev, comentarios: newComment } : ev);
    await updateUserData(uid, { eventos: newEventos });
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, eventos: newEventos } : u));
  }

  async function handleDelete(uid, evId) {
    const user = users.find(u => u.uid === uid);
    if (!user) throw new Error('Usuario no encontrado');
    const newEventos = (user.eventos || []).filter(ev => ev.id !== evId);
    await updateUserData(uid, { eventos: newEventos });
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, eventos: newEventos } : u));
  }

  const tabs = [
    { id: 'registrar', label: '➕ Registrar evento' },
    { id: 'historial', label: `📋 Historial (${totalEventos})` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Navbar showAdminBtn />
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Button variant="ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => navigate('/admin')}>
            ← Volver
          </Button>
          <h1 style={{ margin: 0, fontSize: '1.3rem', color: '#111827' }}>
            🎯 Eventos
          </h1>
          <span style={{
            background: '#7c3aed', color: 'white', borderRadius: '12px',
            padding: '2px 10px', fontSize: '0.78rem', fontWeight: 700,
          }}>{totalEventos}</span>
        </div>

        {error && <Alert type="error" style={{ marginBottom: '16px' }}>{error}</Alert>}
        {toast && (
          <div role="status" style={{ marginBottom: '16px' }}>
            <Alert type="success">{toast}</Alert>
          </div>
        )}

        {loading ? <Spinner /> : (
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '14px 20px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                    fontWeight: activeTab === tab.id ? 700 : 500, fontSize: '0.88rem',
                    color: activeTab === tab.id ? BRAND_COLOR : '#6B7280', background: 'transparent',
                    borderBottom: activeTab === tab.id ? `3px solid ${BRAND_COLOR}` : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >{tab.label}</button>
              ))}
            </div>
            <div style={{ padding: '20px 24px' }}>
              {activeTab === 'registrar' && (
                <RegistrarEventoForm users={users} onRegister={handleRegister} />
              )}
              {activeTab === 'historial' && (
                <HistorialEventos users={users} onUpdate={handleUpdate} onDelete={handleDelete} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
