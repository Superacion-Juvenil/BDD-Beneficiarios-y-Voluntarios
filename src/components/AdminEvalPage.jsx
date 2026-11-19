import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { AdminEvalSummary } from './AdminEvalSummary';
import { AdminEvalPreview } from './AdminEvalPreview';

const BRAND_COLOR = '#1A56A4';

const TABS = [
  { id: 'resumen', label: 'Avance de participantes' },
  { id: 'preview', label: 'Vista previa de los cuestionarios' },
];

export function AdminEvalPage() {
  const [tab, setTab] = useState('resumen');

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>Evaluaciones</h1>
      </div>

      <div style={{
        display: 'flex', gap: '4px', marginBottom: '20px',
        borderBottom: '1px solid #E5E7EB', overflowX: 'auto',
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 16px', border: 'none', background: 'transparent',
              cursor: 'pointer', whiteSpace: 'nowrap',
              fontSize: '0.87rem', fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? BRAND_COLOR : '#6B7280',
              borderBottom: tab === t.id ? `3px solid ${BRAND_COLOR}` : '3px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'resumen' ? <AdminEvalSummary /> : <AdminEvalPreview />}
    </AdminLayout>
  );
}
