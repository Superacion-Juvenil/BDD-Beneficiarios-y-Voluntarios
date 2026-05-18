export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: { background: '#E8F0FB', color: '#1A56A4' },
    warning: { background: '#FEF3C7', color: '#92400E' },
    danger: { background: '#FEE2E2', color: '#991B1B' },
    success: { background: '#D1FAE5', color: '#065F46' },
    gray: { background: '#F3F4F6', color: '#374151' },
  };
  const style = variants[variant] || variants.default;
  return (
    <span style={{
      ...style,
      padding: '2px 8px',
      borderRadius: '9999px',
      fontSize: '0.7rem',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}
