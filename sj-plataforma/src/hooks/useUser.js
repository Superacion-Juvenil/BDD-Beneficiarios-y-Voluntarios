import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useUser(uid) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const ref = doc(db, 'users', uid);
    getDoc(ref)
      .then(snap => {
        if (snap.exists()) setUserData(snap.data());
        else setError('Perfil no encontrado');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [uid]);

  async function saveUser(uid, data) {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
    setUserData(prev => ({ ...prev, ...data }));
  }

  return { userData, setUserData, loading, error, saveUser };
}

export async function getAllUsers() {
  const q = query(collection(db, 'users'), orderBy('apellidoPaterno'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

export async function getUserByUid(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
}

export async function updateUserData(uid, data) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
}

export async function createUserDocument(uid, data) {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, {
    ...data,
    mustChangePassword: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
