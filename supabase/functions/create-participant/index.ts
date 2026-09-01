// Alta de participantes desde el panel de administración.
//
// Se hace aquí y no en el frontend porque `signUp()` dispara un correo de
// confirmación a la dirección interna del participante, que no es una dirección
// real: nadie puede confirmarla y cada intento consume el cupo de envíos de
// Supabase, que acaba respondiendo 429 y bloqueando las altas.
//
// `admin.createUser({ email_confirm: true })` crea la cuenta ya confirmada y no
// envía ningún correo, pero necesita la service_role key, que nunca debe llegar
// al navegador. De ahí que viva en una Edge Function.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const ADMIN_EMAIL = (Deno.env.get('ADMIN_EMAIL') ?? 'documentacion@superacionjuvenil.org').toLowerCase();

// Dominio del correo interno derivado del CURP. Debe coincidir con
// INTERNAL_EMAIL_DOMAIN en src/lib/internalEmail.js, que explica por qué ya no
// se usa sj.internal (Supabase Auth rechaza los dominios reservados).
const INTERNAL_EMAIL_DOMAIN = 'participantes.superacionjuvenil.org';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  // 1. Verificar que quien llama es el administrador.
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'unauthorized', message: 'Falta el token de sesión.' }, 401);
  }

  const caller = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: callerData, error: callerErr } = await caller.auth.getUser();
  if (callerErr || !callerData?.user) {
    return json({ error: 'unauthorized', message: 'Sesión inválida o expirada.' }, 401);
  }
  if ((callerData.user.email ?? '').toLowerCase() !== ADMIN_EMAIL) {
    return json({ error: 'forbidden', message: 'Solo el administrador puede dar de alta participantes.' }, 403);
  }

  // 2. Validar la entrada.
  let body: { curp?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request', message: 'Cuerpo de la petición inválido.' }, 400);
  }

  const curp = (body.curp ?? '').trim().toUpperCase();
  const password = body.password ?? '';

  if (!/^[A-Z0-9]{18}$/.test(curp)) {
    return json({ error: 'invalid_curp', message: 'El CURP debe tener 18 caracteres alfanuméricos.' }, 400);
  }
  if (password.length < 6) {
    return json({ error: 'invalid_password', message: 'La contraseña debe tener al menos 6 caracteres.' }, 400);
  }

  // 3. Crear la cuenta ya confirmada, sin enviar correo.
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.auth.admin.createUser({
    email: `${curp}@${INTERNAL_EMAIL_DOMAIN}`,
    password,
    email_confirm: true,
  });

  if (error) {
    const msg = (error.message ?? '').toLowerCase();
    const alreadyExists =
      msg.includes('already') || msg.includes('duplicate') || error.status === 422;
    return json(
      {
        error: alreadyExists ? 'already_registered' : 'create_failed',
        message: error.message,
      },
      alreadyExists ? 409 : 500,
    );
  }

  const uid = data?.user?.id;
  if (!uid) return json({ error: 'create_failed', message: 'No se recibió el id del nuevo usuario.' }, 500);

  return json({ uid });
});
