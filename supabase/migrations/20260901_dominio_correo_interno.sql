-- Cambio del dominio del correo interno de los participantes:
--   @sj.internal  →  @participantes.superacionjuvenil.org
--
-- El 31 de agosto de 2026 Supabase Auth empezó a rechazar `sj.internal` con
-- `email_address_invalid` ("Example and test domains are currently not
-- supported"): `.internal` es un TLD reservado por ICANN. Eso rompió el alta de
-- participantes y, en las cuentas ya existentes, el cambio de contraseña
-- (`PUT /user`). El inicio de sesión (`POST /token`) no valida el dominio, por
-- eso seguía funcionando. Ver src/lib/internalEmail.js.
--
-- IMPORTANTE: ejecutar solo cuando el build que intenta iniciar sesión con los
-- dos dominios (src/hooks/useAuth.jsx) ya esté en producción. El build anterior
-- compone el correo con @sj.internal y dejaría fuera a todos los participantes.
--
-- Es idempotente: correrlo de nuevo no afecta a las cuentas ya migradas.

begin;

update auth.users
set email = split_part(email, '@', 1) || '@participantes.superacionjuvenil.org',
    raw_user_meta_data = case
      when raw_user_meta_data ? 'email'
        then jsonb_set(
          raw_user_meta_data,
          '{email}',
          to_jsonb(split_part(email, '@', 1) || '@participantes.superacionjuvenil.org')
        )
      else raw_user_meta_data
    end,
    updated_at = now()
where email like '%@sj.internal';

update auth.identities
set identity_data = jsonb_set(
      identity_data,
      '{email}',
      to_jsonb(split_part(identity_data->>'email', '@', 1) || '@participantes.superacionjuvenil.org')
    ),
    updated_at = now()
where identity_data->>'email' like '%@sj.internal';

commit;
