import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Layout } from './Layout';
import { ProfileTab } from './ProfileTab';
import { ProgramaTab } from './ProgramaTab';
import { DocumentosTab } from './DocumentosTab';
import { EvaluacionesList } from './EvaluacionesList';
import { EvalForm } from './EvalForm';
import { Spinner } from './ui/Spinner';
import { Alert } from './ui/Alert';
import { useUser } from '../hooks/useUser';
import { evaluacionesParaUsuario } from '../evaluaciones';

const BRAND_COLOR = '#1A56A4';

const PROFILE_TABS = [
  { id: 'personal',   label: 'Datos personales' },
  { id: 'programa',   label: 'Programa' },
  { id: 'documentos', label: 'Documentos' },
];

function PerfilSection({ data, user, onSave }) {
  const [activeTab, setActiveTab] = useState('personal');

  const fullName = [data.nombre, data.apellidoPaterno, data.apellidoMaterno]
    .filter(Boolean).join(' ') || 'Mi perfil';

  return (
    <div className="sj-fade">
      {/* Tarjeta de identidad */}
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
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>{fullName}</h2>
          <p style={{ margin: '2px 0 0', color: '#6B7280', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            {data.curp || user.email?.split('@')[0]}
          </p>
        </div>
      </div>

      {/* Sub-pestañas */}
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

function EvaluacionesSection({ data, openEvalId, setOpenEvalId, onSaveEval }) {
  return (
    <div className="sj-fade" style={{
      background: 'white', borderRadius: '12px', padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    }}>
      {openEvalId ? (
        <EvalForm
          evalId={openEvalId}
          userData={data}
          onSave={onSaveEval}
          onBack={() => setOpenEvalId(null)}
        />
      ) : (
        <EvaluacionesList userData={data} onOpen={setOpenEvalId} />
      )}
    </div>
  );
}

export function Dashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { userData, loading, error, saveUser, saveEvaluacion } = useUser(user?.id);
  const [section, setSection] = useState(() => sessionStorage.getItem('sj_section') || 'perfil');
  const [openEvalId, setOpenEvalId] = useState(null);
  const [emailUpdateMsg, setEmailUpdateMsg] = useState('');

  function goTo(next) {
    setSection(next);
    setOpenEvalId(null);
    sessionStorage.setItem('sj_section', next);
  }

  async function handleSave(patch) {
    await saveUser(user.id, patch);
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

  const data = userData || {};

  const pendingCount = userData
    ? evaluacionesParaUsuario(userData).filter(e => !(userData.evaluaciones || {})[e.id]?.completedAt).length
    : 0;

  const items = [
    { id: 'perfil',       icon: '👤', label: 'Perfil',       active: section === 'perfil',       onClick: () => goTo('perfil') },
    { id: 'evaluaciones', icon: '📝', label: 'Evaluaciones', active: section === 'evaluaciones', onClick: () => goTo('evaluaciones'), badge: pendingCount },
  ];

  if (isAdmin) {
    items.push({
      id: 'admin', icon: '🛠', label: 'Panel admin',
      active: false, onClick: () => navigate('/admin'),
    });
  }

  return (
    <Layout items={items} maxWidth="860px">
      {loading && <Spinner />}
      {!loading && error && <Alert type="error">{error}</Alert>}

      {!loading && !error && (
        <>
          {emailUpdateMsg && (
            <div style={{ marginBottom: '16px' }}>
              <Alert type="info" onDismiss={() => setEmailUpdateMsg('')}>{emailUpdateMsg}</Alert>
            </div>
          )}

          {section === 'perfil' && (
            <PerfilSection data={data} user={user} onSave={handleSave} />
          )}
          {section === 'evaluaciones' && (
            <EvaluacionesSection
              data={data}
              openEvalId={openEvalId}
              setOpenEvalId={setOpenEvalId}
              onSaveEval={(evalId, answers) => saveEvaluacion(user.id, evalId, answers)}
            />
          )}
        </>
      )}
    </Layout>
  );
}
