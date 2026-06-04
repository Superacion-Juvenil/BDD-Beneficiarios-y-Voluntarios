import { Navbar } from './Navbar';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Navbar showAdminBtn={false} />
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <AdminSidebar />
        <main style={{ flex: 1, minWidth: 0, padding: '24px 16px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
