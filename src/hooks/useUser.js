import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function withUid(row) {
  if (!row) return null;
  return { uid: row.id, ...row };
}

/**
 * Entrada que se guarda en profiles.evaluaciones para una evaluación.
 * `clave` es la clave de seguimiento vigente al momento de responder: se
 * congela aquí para que la respuesta siga identificable aunque la persona
 * cambie de programa después.
 */
function entradaEvaluacion(answers, clave) {
  const entrada = { completedAt: new Date().toISOString(), answers };
  if (clave) entrada.clave = clave;
  return entrada;
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
    // Excluir campos que no son columnas reales de 'profiles' (uid es alias local, id es la PK,
    // evaluaciones se maneja aparte) para evitar "column not found" del schema cache.
    const { uid: _uid, id: _id, evaluaciones: _ev, ...clean } = data;
    const patch = { ...clean, updatedAt: new Date().toISOString() };
    const { error: err } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', targetUid);
    if (err) throw err;
    setUserData(prev => ({ ...prev, ...patch }));
  }

  async function saveEvaluacion(targetUid, evalId, answers, clave) {
    const current = (userData?.evaluaciones) || {};
    const updated = {
      ...current,
      [evalId]: entradaEvaluacion(answers, clave),
    };
    const patch = { evaluaciones: updated, updatedAt: new Date().toISOString() };
    const { error: err } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', targetUid);
    if (err) throw err;
    setUserData(prev => ({ ...prev, evaluaciones: updated }));
  }

  return { userData, setUserData, loading, error, saveUser, saveEvaluacion };
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
  const { uid: _uid, id: _id, evaluaciones: _ev, ...clean } = data;
  const patch = { ...clean, updatedAt: new Date().toISOString() };
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

/**
 * Guarda una evaluación sobre otro usuario (la llena el coordinador).
 * Devuelve el objeto `evaluaciones` actualizado para refrescar la vista.
 */
export async function saveEvaluacionDeUsuario(uid, evalId, answers, clave, evaluacionesActuales) {
  const updated = {
    ...(evaluacionesActuales || {}),
    [evalId]: entradaEvaluacion(answers, clave),
  };
  const { error } = await supabase
    .from('profiles')
    .update({ evaluaciones: updated, updatedAt: new Date().toISOString() })
    .eq('id', uid);
  if (error) throw error;
  return updated;
}
