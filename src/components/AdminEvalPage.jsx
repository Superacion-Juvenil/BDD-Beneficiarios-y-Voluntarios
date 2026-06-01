import { useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { AdminEvalSummary } from './AdminEvalSummary';
import { Button } from './ui/Button';

export function AdminEvalPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Navbar showAdminBtn={false} />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Button variant="ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => navigate('/admin')}>
            ← Volver
          </Button>
          <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>Evaluaciones</h1>
        </div>
        <AdminEvalSummary />
      </div>
    </div>
  );
}
