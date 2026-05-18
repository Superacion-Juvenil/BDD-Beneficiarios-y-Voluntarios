export function SectionTitle({ children }) {
  return (
    <h3 style={{
      fontSize: '0.75rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: '#1A56A4',
      borderBottom: '2px solid #E8F0FB',
      paddingBottom: '6px',
      margin: '20px 0 12px',
    }}>
      {children}
    </h3>
  );
}
