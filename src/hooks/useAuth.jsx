import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'ADMIN@sj.internal').toLowerCase();

async function loadProfile(supabaseUser) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUser.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    let active = true;

    async function applySession(session) {
      const supabaseUser = session?.user || null;
      if (!supabaseUser) {
        if (!active) return;
        setUser(null);
        setUserData(null);
        setIsAdmin(false);
        setMustChangePassword(false);
        setLoading(false);
        return;
      }

      const email = (supabaseUser.email || '').toLowerCase();
      if (email === ADMIN_EMAIL) {
        if (!active) return;
        setUser(supabaseUser);
        setIsAdmin(true);
        setUserData({ nombre: 'Administrador', isAdmin: true });
        setMustChangePassword(false);
        setLoading(false);
        return;
      }

      try {
        const profile = await loadProfile(supabaseUser);
        if (!active) return;
        setUser(supabaseUser);
        setIsAdmin(false);
        setUserData(profile);
        setMustChangePassword(profile?.mustChangePassword === true);
      } catch (e) {
        console.error('Error fetching user profile', e);
        if (!active) return;
        setUser(supabaseUser);
        setIsAdmin(false);
        setUserData(null);
        setMustChangePassword(false);
      } finally {
        if (active) setLoading(false);
      }
    }

    supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function loginWithCURP(curp, password) {
    const email = `${curp.toUpperCase()}@sj.internal`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  async function changePassword(newPassword) {
    const { data: updated, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    const uid = updated?.user?.id;
    if (uid) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ mustChangePassword: false, updatedAt: new Date().toISOString() })
        .eq('id', uid);
      if (profileError) throw profileError;
    }
    setMustChangePassword(false);
  }

  return (
    <AuthContext.Provider value={{ user, userData, isAdmin, mustChangePassword, loading, loginWithCURP, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
