import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { validateCURP } from '../lib/curp';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';
import { Field, Input } from './ui/Field';

const BRAND_COLOR = '#1A56A4';
const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'documentacion@superacionjuvenil.org').toLowerCase();

export function Login() {
  const { loginWithCURP, loginAdminWithMagicLink, requestCURPOTP, verifyOTP } = useAuth();

  const [isAdminLogin, setIsAdminLogin] = useState(false);

  // Admin OTP
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhase, setAdminPhase] = useState('request'); // 'request' | 'sent'

  // Participante
  const [curp, setCurp] = useState('');
  const [password, setPassword] = useState('');
  const [participantMode, setParticipantMode] = useState('password'); // 'password' | 'otp'
  const [otpPhase, setOtpPhase] = useState('request'); // 'request' | 'verify'
  const [otpEmail, setOtpEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function switchTab(toAdmin) {
    setIsAdminLogin(toAdmin);
    setError('');
    setAdminPhase('request');
    setOtpPhase('request');
    setOtpEmail('');
    setOtpToken('');
  }

  async function handleAdminMagicLink(e) {
    e.preventDefault();
    setError('');
    if (!adminEmail.trim()) { setError('Ingresa tu correo.'); return; }
    setLoading(true);
    try {
      await loginAdminWithMagicLink(adminEmail.trim());
      setAdminPhase('sent');
    } catch {
      setError('No se pudo enviar el enlace. Verifica que el correo sea correcto.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordLogin(e) {
    e.preventDefault();
    setError('');
    const curpError = validateCURP(curp);
    if (curpError) { setError(curpError); return; }
    if (!password) { setError('Ingresa tu contraseña.'); return; }
    setLoading(true);
    try {
      await loginWithCURP(curp, password);
    } catch (err) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('invalid login credentials') || msg.includes('invalid credentials') || msg.includes('email not confirmed')) {
        setError('CURP o contraseña incorrectos.');
      } else if (msg.includes('too many requests') || msg.includes('rate limit')) {
        setError('Demasiados intentos. Espera unos minutos e intenta de nuevo.');
      } else {
        setError('Error al iniciar sesión. Verifica tu conexión.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestOTP(e) {
    e.preventDefault();
    setError('');
    const curpError = validateCURP(curp);
    if (curpError) { setError(curpError); return; }
    setLoading(true);
    try {
      const email = await requestCURPOTP(curp);
      setOtpEmail(email);
      setOtpPhase('verify');
    } catch (err) {
      if (err.message === 'NO_EMAIL') {
        setError('No tienes un correo registrado. Inicia sesión con tu contraseña y agrégalo en tu perfil.');
      } else {
        setError('No se pudo enviar el código. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();
    setError('');
    if (!otpToken.trim()) { setError('Ingresa el código.'); return; }
    setLoading(true);
    try {
      await verifyOTP(otpEmail, otpToken.trim());
    } catch {
      setError('Código incorrecto o expirado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const logoBlock = (
    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
      <div style={{
        width: '80px', height: '80px', background: BRAND_COLOR, borderRadius: '50%',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
      }}>
        <svg width="52" height="36" viewBox="0 0 52 36" fill="none">
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
  );

  const tabToggle = (
    <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '8px', padding: '4px', marginBottom: '24px' }}>
      {[['Participante', false], ['Administrador', true]].map(([label, adminVal]) => {
        const active = isAdminLogin === adminVal;
        return (
          <button
            key={label}
            onClick={() => switchTab(adminVal)}
            style={{
              flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
              background: active ? 'white' : 'transparent',
              color: active ? BRAND_COLOR : '#6B7280',
              boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A56A4 0%, #0E3A72 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '40px 36px',
        width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {logoBlock}
        {tabToggle}

        {isAdminLogin ? (
          adminPhase === 'sent' ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📧</div>
              <p style={{ fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>Revisa tu correo</p>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0 }}>
                Enviamos un enlace de acceso a <strong>{adminEmail}</strong>. Haz clic en él para entrar.
              </p>
              <button
                onClick={() => { setAdminPhase('request'); setError(''); }}
                style={{ marginTop: '16px', background: 'none', border: 'none', color: BRAND_COLOR, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >
                Volver a intentar
              </button>
            </div>
          ) : (
            <form onSubmit={handleAdminMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {error && <Alert type="error">{error}</Alert>}
              <Field label="Correo de administrador" required>
                <Input
                  type="email"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder={ADMIN_EMAIL}
                  autoComplete="email"
                />
              </Field>
              <Button type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Enviando...' : 'Enviar enlace de acceso'}
              </Button>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>
                Recibirás un enlace de un solo uso en tu correo.
              </p>
            </form>
          )
        ) : (
          <>
            {/* Modo: contraseña vs código */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[['password', 'Contraseña'], ['otp', 'Código por correo']].map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => { setParticipantMode(mode); setError(''); setOtpPhase('request'); setOtpToken(''); }}
                  style={{
                    flex: 1, padding: '7px',
                    border: `2px solid ${participantMode === mode ? BRAND_COLOR : '#E5E7EB'}`,
                    borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                    background: participantMode === mode ? `${BRAND_COLOR}12` : 'transparent',
                    color: participantMode === mode ? BRAND_COLOR : '#6B7280',
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {participantMode === 'password' ? (
              <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {error && <Alert type="error">{error}</Alert>}
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
                <Button type="submit" disabled={loading} style={{ marginTop: '8px', width: '100%' }}>
                  {loading ? 'Ingresando...' : 'Iniciar sesión'}
                </Button>
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>
                  Tu usuario es tu CURP. Contraseña temporal: SJ2025
                </p>
              </form>
            ) : otpPhase === 'verify' ? (
              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {error && <Alert type="error">{error}</Alert>}
                <Alert type="info">
                  Enviamos un código de 6 dígitos a <strong>{otpEmail}</strong>
                </Alert>
                <Field label="Código de verificación" required>
                  <Input
                    value={otpToken}
                    onChange={e => setOtpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="one-time-code"
                    style={{ fontFamily: 'monospace', letterSpacing: '0.3em', fontSize: '1.2rem', textAlign: 'center' }}
                  />
                </Field>
                <Button type="submit" disabled={loading || otpToken.length < 6} style={{ width: '100%' }}>
                  {loading ? 'Verificando...' : 'Verificar código'}
                </Button>
                <button
                  type="button"
                  onClick={() => { setOtpPhase('request'); setOtpToken(''); setError(''); }}
                  style={{ background: 'none', border: 'none', color: BRAND_COLOR, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                >
                  Reenviar código
                </button>
              </form>
            ) : (
              <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {error && <Alert type="error">{error}</Alert>}
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
                <Button type="submit" disabled={loading} style={{ width: '100%' }}>
                  {loading ? 'Enviando...' : 'Enviar código a mi correo'}
                </Button>
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>
                  Solo disponible si tienes un correo registrado en tu perfil.
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
