import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { validatePassword } from '../lib/validators';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';
import { Field, Input } from './ui/Field';

const BRAND_COLOR = '#1A56A4';

export function ChangePassword() {
  const { changePassword, logout, userData } = useAuth();
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const passError = validatePassword(newPass);
    if (passError) { setError(passError); return; }
    if (newPass !== confirmPass) { setError('Las contraseñas no coinciden.'); return; }
    if (newPass === 'SJ2025') { setError('Debes elegir una contraseña diferente a la temporal.'); return; }
    setLoading(true);
    try {
      await changePassword(newPass);
    } catch (err) {
      setError('Error al cambiar la contraseña: ' + err.message);
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
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px', height: '56px', background: '#FEF3C7', borderRadius: '50%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', marginBottom: '12px',
          }}>🔒</div>
          <h2 style={{ color: BRAND_COLOR, margin: 0, fontSize: '1.3rem' }}>Cambia tu contraseña</h2>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '6px' }}>
            Bienvenido/a, <strong>{userData?.nombre || 'usuario'}</strong>.<br/>
            Por seguridad, debes crear una contraseña propia antes de continuar.
          </p>
        </div>

        <Alert type="warning" style={{ marginBottom: '16px' }}>
          Tu contraseña temporal <strong>SJ2025</strong> debe ser reemplazada para proteger tu cuenta.
        </Alert>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
          {error && <Alert type="error">{error}</Alert>}
          <Field label="Nueva contraseña" required>
            <Input
              type="password"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirmar contraseña" required>
            <Input
              type="password"
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              placeholder="Repite tu nueva contraseña"
              autoComplete="new-password"
            />
          </Field>
          <Button type="submit" disabled={loading} style={{ marginTop: '8px', width: '100%' }}>
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </Button>
          <button
            type="button"
            onClick={logout}
            style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
