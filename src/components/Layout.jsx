import { useAuth } from '../hooks/useAuth';
import { Sidebar } from './Sidebar';
import '../index.css';

export function Layout({ items, activeSection, onSectionChange, children }) {
  const { userData, logout } = useAuth();

  return (
    <div className="sj-layout">
      <Sidebar
        items={items}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        userData={userData}
        onLogout={logout}
      />
      <main className="sj-main">
        {children}
      </main>
    </div>
  );
}
