export function Field({ label, error, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
          {label}{required && <span style={{ color: '#DC2626' }}> *</span>}
        </label>
      )}
      {children}
      {error && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{error}</span>}
    </div>
  );
}

export const inputStyle = {
  padding: '9px 12px',
  borderRadius: '6px',
  border: '1px solid #D1D5DB',
  fontSize: '0.9rem',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.15s',
};

export const readOnlyStyle = {
  ...inputStyle,
  background: '#F3F4F6',
  color: '#6B7280',
  cursor: 'default',
};

export function Input({ readOnly, error, style: extraStyle, ...props }) {
  return (
    <input
      {...props}
      readOnly={readOnly}
      style={{
        ...(readOnly ? readOnlyStyle : inputStyle),
        borderColor: error ? '#DC2626' : '#D1D5DB',
        ...extraStyle,
      }}
      onFocus={e => { if (!readOnly) e.target.style.borderColor = '#1A56A4'; }}
      onBlur={e => { e.target.style.borderColor = error ? '#DC2626' : '#D1D5DB'; }}
    />
  );
}

export function Select({ error, ...props }) {
  return (
    <select
      {...props}
      style={{
        ...inputStyle,
        borderColor: error ? '#DC2626' : '#D1D5DB',
        background: 'white',
      }}
    />
  );
}

export function Textarea({ readOnly, ...props }) {
  return (
    <textarea
      {...props}
      readOnly={readOnly}
      rows={3}
      style={{
        ...(readOnly ? readOnlyStyle : inputStyle),
        resize: 'vertical',
        fontFamily: 'inherit',
      }}
    />
  );
}
