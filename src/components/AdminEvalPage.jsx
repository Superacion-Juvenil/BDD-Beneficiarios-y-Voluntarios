import { AdminLayout } from './AdminLayout';
import { AdminEvalSummary } from './AdminEvalSummary';

export function AdminEvalPage() {
  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>Evaluaciones</h1>
      </div>
      <AdminEvalSummary />
    </AdminLayout>
  );
}
