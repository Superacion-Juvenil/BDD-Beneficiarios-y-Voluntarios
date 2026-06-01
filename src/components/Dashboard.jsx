import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Layout } from './Layout';
import { ProfileTab } from './ProfileTab';
import { ProgramaTab } from './ProgramaTab';
import { DocumentosTab } from './DocumentosTab';
import { Spinner } from './ui/Spinner';
import { Alert } from './ui/Alert';
import { useUser } from '../hooks/useUser';

const BRAND_COLOR = '#1A56A4';

const PROFILE_TABS = [
  { id: 'personal',   label: 'Datos personales' },
  { id: 'programa',   label: 'Programa' },
  { id: 'documentos', label: 'Documentos' },
];

function getInitialSection() {
  return sessionStorage.getItem('sj_section') || 'perfil';
}

function PerfilSection({ data, onSave, user }) {
  const [activeTab, setActiveTab] = useState('personal');

  const fullName = [data.nombre, data.apellidoPaterno, data.apellidoMaterno].filter(Boolean).join(' ') || 'Mi perfil';
  const initial = (data.nombre?.[0] || '?').toUpperCase();

  return (
    <div className="sj-fade">
      {/* Identity card */}
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
          {initial}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>{fullName}</h2>
          <p style={{ margin: '2px 0 0', color: '#6B7280', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            {data.curp || user.email?.split('@')[0]}
          </p>
        </div>
      </div>

      {/* Sub-tabs + content */}
      <div style={{
        background: 'white', borderRadius: '12px', overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
          {PROFILE_TABS.map(tab => (
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
          {activeTab === 'personal'   && <ProfileTab data={data} onSave={onSave} />}
          {activeTab === 'programa'   && <ProgramaTab data={data} onSave={onSave} />}
          {activeTab === 'documentos' && <DocumentosTab data={data} onSave={onSave} />}
        </div>
      </div>
    </div>
  );
}

function EvaluacionesSection() {
  return (
    <div className="sj-fade" style={{
      background: 'white', borderRadius: '12px', padding: '40px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textAlign: 'center', color: '#6B7280',
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📝</div>
      <p style={{ margin: 0, fontSize: '0.95rem' }}>Las evaluaciones estarán disponibles próximamente.</p>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const { userData, loading, error, saveUser } = useUser(user?.uid);
  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [emailUpdateMsg, setEmailUpdateMsg] = useState('');

  function handleSectionChange(section) {
    setActiveSection(section);
    sessionStorage.setItem('sj_section', section);
  }

  async function handleSave(patch) {
    await saveUser(user.uid, patch);
    if (patch.correo && patch.correo !== user.email) {
      const { error: authErr } = await supabase.auth.updateUser({ email: patch.correo });
      if (!authErr) {
        setEmailUpdateMsg(`Te enviamos un correo a ${patch.correo} para confirmar tu dirección. Una vez confirmado podrás iniciar sesión con código.`);
        setTimeout(() => setEmailUpdateMsg(''), 10000);
      }
    }
  }

  if (loading) return (
    <Layout activeSection={activeSection} onSectionChange={handleSectionChange} badges={{}}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Spinner />
      </div>
    </Layout>
  );

  if (error) return (
    <Layout activeSection={activeSection} onSectionChange={handleSectionChange} badges={{}}>
      <div style={{ padding: '24px' }}>
        <Alert type="error">{error}</Alert>
      </div>
    </Layout>
  );

  const data = userData || {};

  return (
    <Layout activeSection={activeSection} onSectionChange={handleSectionChange} badges={{}}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 16px' }}>
        {emailUpdateMsg && (
          <div style={{ marginBottom: '16px' }}>
            <Alert type="info" onDismiss={() => setEmailUpdateMsg('')}>{emailUpdateMsg}</Alert>
          </div>
        )}
        {activeSection === 'perfil'       && <PerfilSection data={data} onSave={handleSave} user={user} />}
        {activeSection === 'evaluaciones' && <EvaluacionesSection />}
      </div>
    </Layout>
  );
}
