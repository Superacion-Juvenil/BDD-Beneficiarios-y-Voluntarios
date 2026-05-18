import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function withUid(row) {
  if (!row) return null;
  return { uid: row.id, ...row };
}

export function useUser(uid) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    let active = true;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) setError(err.message);
        else if (!data) setError('Perfil no encontrado');
        else setUserData(withUid(data));
      })
      .catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [uid]);

  async function saveUser(targetUid, data) {
    const patch = { ...data, updatedAt: new Date().toISOString() };
    const { error: err } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', targetUid);
    if (err) throw err;
    setUserData(prev => ({ ...prev, ...patch }));
  }

  return { userData, setUserData, loading, error, saveUser };
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('apellidoPaterno', { ascending: true });
  if (error) throw error;
  return (data || []).map(withUid);
}

export async function getUserByUid(uid) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .maybeSingle();
  if (error) throw error;
  return withUid(data);
}

export async function updateUserData(uid, data) {
  const patch = { ...data, updatedAt: new Date().toISOString() };
  const { error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', uid);
  if (error) throw error;
}

export async function createUserDocument(uid, data) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: uid,
      ...data,
      mustChangePassword: true,
      createdAt: now,
      updatedAt: now,
    });
  if (error) throw error;
}
