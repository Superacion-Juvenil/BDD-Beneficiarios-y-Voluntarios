import { useAuth } from '../hooks/useAuth';
import { Sidebar } from './Sidebar';
import '../index.css';

export function Layout({ activeSection, onSectionChange, badges, children }) {
  const { userData, isAdmin, logout } = useAuth();

  return (
    <div className="sj-layout">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        isAdmin={isAdmin}
        userData={userData}
        onLogout={logout}
        badges={badges}
      />
      <main className="sj-main">
        {children}
      </main>
    </div>
  );
}
