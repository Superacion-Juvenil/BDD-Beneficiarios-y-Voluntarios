import { useState, useEffect, createContext, useContext } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Admin is identified by the special email prefix
        const adminEmail = (process.env.REACT_APP_ADMIN_EMAIL || 'ADMIN@sj.internal').toLowerCase();
        if (firebaseUser.email.toLowerCase() === adminEmail) {
          setIsAdmin(true);
          setUserData({ nombre: 'Administrador', isAdmin: true });
          setMustChangePassword(false);
        } else {
          setIsAdmin(false);
          try {
            const ref = doc(db, 'users', firebaseUser.uid);
            const snap = await getDoc(ref);
            if (snap.exists()) {
              const data = snap.data();
              setUserData(data);
              setMustChangePassword(data.mustChangePassword === true);
            }
          } catch (e) {
            console.error('Error fetching user data', e);
          }
        }
      } else {
        setUser(null);
        setUserData(null);
        setIsAdmin(false);
        setMustChangePassword(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // CURP login: constructs internal email as CURP@sj.internal
  async function loginWithCURP(curp, password) {
    const email = `${curp.toUpperCase()}@sj.internal`;
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
  }

  async function changePassword(newPassword) {
    await updatePassword(auth.currentUser, newPassword);
    // Clear the mustChangePassword flag in Firestore
    const { doc: firestoreDoc, updateDoc } = await import('firebase/firestore');
    const ref = firestoreDoc(db, 'users', auth.currentUser.uid);
    await updateDoc(ref, { mustChangePassword: false });
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
