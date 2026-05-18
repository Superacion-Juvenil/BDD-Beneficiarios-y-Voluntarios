export function Alert({ type = 'info', children, onDismiss }) {
  const styles = {
    info: { background: '#E8F0FB', border: '1px solid #1A56A4', color: '#1A56A4' },
    success: { background: '#D1FAE5', border: '1px solid #059669', color: '#065F46' },
    error: { background: '#FEE2E2', border: '1px solid #DC2626', color: '#991B1B' },
    warning: { background: '#FEF3C7', border: '1px solid #D97706', color: '#92400E' },
  };
  const s = styles[type] || styles.info;
  return (
    <div style={{
      ...s,
      padding: '12px 16px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      fontSize: '0.875rem',
    }}>
      <span style={{ flex: 1 }}>{children}</span>
      {onDismiss && (
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700, padding: 0 }}>
          ✕
        </button>
      )}
    </div>
  );
}
