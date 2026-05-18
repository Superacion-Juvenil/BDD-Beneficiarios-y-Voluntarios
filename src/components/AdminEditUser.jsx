import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserByUid, updateUserData } from '../hooks/useUser';
import { Navbar } from './Navbar';
import { ProfileTab } from './ProfileTab';
import { ProgramaTab } from './ProgramaTab';
import { DocumentosTab } from './DocumentosTab';
import { Spinner } from './ui/Spinner';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';

const BRAND_COLOR = '#1A56A4';
const TABS = [
  { id: 'personal', label: 'Datos personales' },
  { id: 'programa', label: 'Programa' },
  { id: 'documentos', label: 'Documentos' },
];

export function AdminEditUser() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    getUserByUid(uid)
      .then(data => {
        if (!data) setError('Usuario no encontrado.');
        else setUserData(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [uid]);

  async function handleSave(patch) {
    await updateUserData(uid, patch);
    setUserData(prev => ({ ...prev, ...patch }));
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Navbar showAdminBtn />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Button variant="ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => navigate('/admin')}>
            ← Volver
          </Button>
          <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>
            Editar participante
          </h1>
          {userData && (
            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#6B7280' }}>
              {userData.curp}
            </span>
          )}
        </div>

        {loading && <Spinner />}
        {error && <Alert type="error">{error}</Alert>}

        {userData && (
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '14px 20px', border: 'none', cursor: 'pointer',
                    fontWeight: activeTab === tab.id ? 700 : 500, fontSize: '0.88rem', whiteSpace: 'nowrap',
                    color: activeTab === tab.id ? BRAND_COLOR : '#6B7280', background: 'transparent',
                    borderBottom: activeTab === tab.id ? `3px solid ${BRAND_COLOR}` : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div style={{ padding: '20px 24px' }}>
              {activeTab === 'personal' && (
                <ProfileTab data={userData} onSave={handleSave} isAdmin readOnlyCURP={false} />
              )}
              {activeTab === 'programa' && (
                <ProgramaTab data={userData} onSave={handleSave} isAdmin />
              )}
              {activeTab === 'documentos' && (
                <DocumentosTab data={userData} onSave={handleSave} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
