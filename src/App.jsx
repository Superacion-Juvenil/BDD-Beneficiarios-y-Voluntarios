import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Login } from './components/Login';
import { ChangePassword } from './components/ChangePassword';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { AdminEditUser } from './components/AdminEditUser';
import { AdminAddUser } from './components/AdminAddUser';
import { Spinner } from './components/ui/Spinner';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, mustChangePassword, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (mustChangePassword) return <Navigate to="/cambiar-password" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function AdminRedirect() {
  const { isAdmin, loading } = useAuth();
  if (loading) return <Spinner />;
  return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>;
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/cambiar-password" element={<ChangePassword />} />
      <Route path="/" element={<AdminRedirect />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>
      } />
      <Route path="/admin/editar/:uid" element={
        <ProtectedRoute adminOnly><AdminEditUser /></ProtectedRoute>
      } />
      <Route path="/admin/nuevo" element={
        <ProtectedRoute adminOnly><AdminAddUser /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
