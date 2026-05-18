import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { validateCURP } from '../lib/curp';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';
import { Field, Input } from './ui/Field';

const BRAND_COLOR = '#1A56A4';

export function Login() {
  const { loginWithCURP } = useAuth();
  const [curp, setCurp] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (isAdminLogin) {
      setLoading(true);
      try {
        await loginWithCURP('ADMIN', adminPassword);
      } catch {
        setError('Credenciales de administrador incorrectas.');
      } finally {
        setLoading(false);
      }
      return;
    }

    const curpError = validateCURP(curp);
    if (curpError) { setError(curpError); return; }
    if (!password) { setError('Ingresa tu contraseña.'); return; }

    setLoading(true);
    try {
      await loginWithCURP(curp, password);
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('CURP o contraseña incorrectos.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Espera unos minutos e intenta de nuevo.');
      } else {
        setError('Error al iniciar sesión. Verifica tu conexión.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A56A4 0%, #0E3A72 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px 36px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: BRAND_COLOR,
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}>
            <svg width="52" height="36" viewBox="0 0 52 36" fill="none">
              {/* Three white silhouettes */}
              <ellipse cx="10" cy="12" rx="5" ry="5" fill="white" opacity="0.9"/>
              <path d="M2 34c0-6 3.5-10 8-10s8 4 8 10H2z" fill="white" opacity="0.9"/>
              <ellipse cx="26" cy="10" rx="6" ry="6" fill="white"/>
              <path d="M17 34c0-7 4-11 9-11s9 4 9 11H17z" fill="white"/>
              <ellipse cx="42" cy="12" rx="5" ry="5" fill="white" opacity="0.9"/>
              <path d="M34 34c0-6 3.5-10 8-10s8 4 8 10H34z" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: BRAND_COLOR, margin: 0 }}>
            Superación Juvenil A.B.P.
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '4px' }}>
            Plataforma de Gestión
          </p>
        </div>

        {/* Toggle admin/user */}
        <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '8px', padding: '4px', marginBottom: '24px' }}>
          <button
            onClick={() => { setIsAdminLogin(false); setError(''); }}
            style={{
              flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
              background: !isAdminLogin ? 'white' : 'transparent',
              color: !isAdminLogin ? BRAND_COLOR : '#6B7280',
              boxShadow: !isAdminLogin ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Participante
          </button>
          <button
            onClick={() => { setIsAdminLogin(true); setError(''); }}
            style={{
              flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
              background: isAdminLogin ? 'white' : 'transparent',
              color: isAdminLogin ? BRAND_COLOR : '#6B7280',
              boxShadow: isAdminLogin ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Administrador
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && <Alert type="error">{error}</Alert>}

          {isAdminLogin ? (
            <Field label="Contraseña de administrador" required>
              <Input
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="Contraseña de administrador"
                autoComplete="current-password"
              />
            </Field>
          ) : (
            <>
              <Field label="CURP" required>
                <Input
                  value={curp}
                  onChange={e => setCurp(e.target.value.toUpperCase())}
                  placeholder="Ej. GARC850101HDFRZN09"
                  maxLength={18}
                  autoComplete="username"
                  style={{ fontFamily: 'monospace', letterSpacing: '0.08em' }}
                />
              </Field>
              <Field label="Contraseña" required>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                />
              </Field>
            </>
          )}

          <Button type="submit" disabled={loading} style={{ marginTop: '8px', width: '100%' }}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '20px' }}>
          {isAdminLogin
            ? 'Acceso exclusivo para administradores del sistema.'
            : 'Tu usuario es tu CURP. Contraseña temporal: SJ2025'}
        </p>
      </div>
    </div>
  );
}
