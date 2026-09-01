/**
 * Correo interno de los participantes.
 *
 * No capturamos la dirección real al dar de alta (muchos no tienen), pero
 * Supabase Auth exige un email por cuenta, así que se deriva del CURP.
 *
 * El dominio original era `sj.internal`. El 31 de agosto de 2026 Supabase Auth
 * empezó a rechazarlo con `email_address_invalid` ("Example and test domains are
 * currently not supported"): `.internal` es un TLD reservado por ICANN para uso
 * privado y nunca resuelve en Internet. Eso rompió las altas y, para las
 * cuentas ya existentes, los cambios de contraseña (`PUT /user`). El dominio
 * actual es un subdominio propio; no necesita registros MX ni buzón real: nunca
 * se envía correo a estas direcciones (las cuentas se crean con
 * `email_confirm: true`).
 *
 * Si esto cambia, hay que actualizarlo también en
 * `supabase/functions/create-participant/index.ts`, en `scripts/migrate.js` y
 * en `get_login_email_for_curp` (`supabase/schema.sql`), que no pueden importar
 * este módulo.
 */
export const INTERNAL_EMAIL_DOMAIN = 'participantes.superacionjuvenil.org';

/** Dominio anterior. Solo para que una cuenta sin migrar aún pueda entrar. */
export const LEGACY_INTERNAL_EMAIL_DOMAIN = 'sj.internal';

export function internalEmailForCURP(curp, domain = INTERNAL_EMAIL_DOMAIN) {
  return `${(curp || '').trim().toUpperCase()}@${domain}`;
}
