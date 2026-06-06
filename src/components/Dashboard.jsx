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

const SECTIONS = [
  { id: 'personal',   icon: '👤', label: 'Datos personales' },
  { id: 'programa',   icon: '📋', label: 'Programa' },
  { id: 'documentos', icon: '📄', label: 'Documentos' },
];

function getInitialSection() {
  const saved = sessionStorage.getItem('sj_section');
  return SECTIONS.some(s => s.id === saved) ? saved : 'personal';
}

function IdentityCard({ data, user }) {
  const fullName = [data.nombre, data.apellidoPaterno, data.apellidoMaterno].filter(Boolean).join(' ') || 'Mi perfil';
  const initial = (data.nombre?.[0] || '?').toUpperCase();

  return (
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
    <Layout items={SECTIONS} activeSection={activeSection} onSectionChange={handleSectionChange}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Spinner />
      </div>
    </Layout>
  );

  if (error) return (
    <Layout items={SECTIONS} activeSection={activeSection} onSectionChange={handleSectionChange}>
      <div style={{ padding: '24px' }}>
        <Alert type="error">{error}</Alert>
      </div>
    </Layout>
  );

  const data = userData || {};

  return (
    <Layout items={SECTIONS} activeSection={activeSection} onSectionChange={handleSectionChange}>
      <div className="sj-fade" style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 16px' }}>
        {emailUpdateMsg && (
          <div style={{ marginBottom: '16px' }}>
            <Alert type="info" onDismiss={() => setEmailUpdateMsg('')}>{emailUpdateMsg}</Alert>
          </div>
        )}

        <IdentityCard data={data} user={user} />

        <div style={{
          background: 'white', borderRadius: '12px', overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '20px 24px',
        }}>
          {activeSection === 'personal'   && <ProfileTab data={data} onSave={handleSave} />}
          {activeSection === 'programa'   && <ProgramaTab data={data} onSave={handleSave} />}
          {activeSection === 'documentos' && <DocumentosTab data={data} onSave={handleSave} />}
        </div>
      </div>
    </Layout>
  );
}
