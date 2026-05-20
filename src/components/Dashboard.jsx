import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Navbar } from './Navbar';
import { ProfileTab } from './ProfileTab';
import { ProgramaTab } from './ProgramaTab';
import { DocumentosTab } from './DocumentosTab';
import { Spinner } from './ui/Spinner';
import { Alert } from './ui/Alert';
import { useUser } from '../hooks/useUser';

const BRAND_COLOR = '#1A56A4';

const TABS = [
  { id: 'personal', label: 'Datos personales' },
  { id: 'programa', label: 'Programa' },
  { id: 'documentos', label: 'Documentos' },
];

export function Dashboard() {
  const { user } = useAuth();
  const { userData, loading, error, saveUser } = useUser(user?.uid);
  const [activeTab, setActiveTab] = useState('personal');
  const [emailUpdateMsg, setEmailUpdateMsg] = useState('');

  async function handleSave(patch) {
    await saveUser(user.uid, patch);
    // Si el usuario agregó/cambió su correo, sincronizarlo con Supabase Auth
    // para habilitar el inicio de sesión con código OTP en el futuro.
    if (patch.correo && patch.correo !== user.email) {
      const { error: authErr } = await supabase.auth.updateUser({ email: patch.correo });
      if (!authErr) {
        setEmailUpdateMsg(`Te enviamos un correo a ${patch.correo} para confirmar tu dirección. Una vez confirmado podrás iniciar sesión con código.`);
        setTimeout(() => setEmailUpdateMsg(''), 10000);
      }
    }
  }

  if (loading) return (
    <>
      <Navbar />
      <Spinner />
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <div style={{ padding: '24px' }}>
        <Alert type="error">{error}</Alert>
      </div>
    </>
  );

  const data = userData || {};

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Navbar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 16px' }}>
        {emailUpdateMsg && (
          <div style={{ marginBottom: '16px' }}>
            <Alert type="info" onDismiss={() => setEmailUpdateMsg('')}>{emailUpdateMsg}</Alert>
          </div>
        )}

        {/* Header card */}
        <div style={{
          background: 'white', borderRadius: '12px', padding: '20px 24px',
          marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <div style={{
            width: '52px', height: '52px', background: BRAND_COLOR,
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '1.3rem', flexShrink: 0,
          }}>
            {(data.nombre?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>
              {[data.nombre, data.apellidoPaterno, data.apellidoMaterno].filter(Boolean).join(' ') || 'Mi perfil'}
            </h2>
            <p style={{ margin: '2px 0 0', color: '#6B7280', fontSize: '0.85rem', fontFamily: 'monospace' }}>
              {data.curp || user.email?.split('@')[0]}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          background: 'white', borderRadius: '12px', overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '14px 20px', border: 'none', cursor: 'pointer',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: '0.88rem', whiteSpace: 'nowrap',
                  color: activeTab === tab.id ? BRAND_COLOR : '#6B7280',
                  background: 'transparent',
                  borderBottom: activeTab === tab.id ? `3px solid ${BRAND_COLOR}` : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ padding: '20px 24px' }}>
            {activeTab === 'personal' && <ProfileTab data={data} onSave={handleSave} />}
            {activeTab === 'programa' && <ProgramaTab data={data} onSave={handleSave} />}
            {activeTab === 'documentos' && <DocumentosTab data={data} onSave={handleSave} />}
          </div>
        </div>
      </div>
    </div>
  );
}
