export function Spinner({ size = 32, color = '#1A56A4' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '32px' }}>
      <div style={{
        width: size,
        height: size,
        border: `3px solid #E8F0FB`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
