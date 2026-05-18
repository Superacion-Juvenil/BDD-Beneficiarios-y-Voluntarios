export function Button({ children, variant = 'primary', disabled, style: extra, ...props }) {
  const base = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'opacity 0.15s, transform 0.1s',
    opacity: disabled ? 0.6 : 1,
  };
  const variants = {
    primary: { background: '#1A56A4', color: 'white' },
    secondary: { background: '#E8F0FB', color: '#1A56A4' },
    danger: { background: '#DC2626', color: 'white' },
    ghost: { background: 'transparent', color: '#1A56A4', border: '1px solid #1A56A4' },
  };
  return (
    <button
      {...props}
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...extra }}
      onMouseEnter={e => { if (!disabled) e.target.style.opacity = '0.85'; }}
      onMouseLeave={e => { if (!disabled) e.target.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}
