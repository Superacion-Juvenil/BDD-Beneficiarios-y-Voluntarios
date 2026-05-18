-- =====================================================================
-- Esquema de Supabase para la plataforma BDD de Superación Juvenil.
-- Tabla profiles 1:1 con auth.users. Identificación de admin por email.
-- =====================================================================

-- Tabla de perfiles ---------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  "curp" text unique,
  "nombre" text,
  "apellidoPaterno" text,
  "apellidoMaterno" text,
  "fechaNacimiento" text,
  "sexo" text,
  "correo" text,
  "telefono" text,
  "calle" text,
  "colonia" text,
  "cp" text,
  "municipio" text,
  "tutorNombre" text,
  "tutorTelefono" text,
  "tutorCorreo" text,
  "tipoParticipante" text,
  "programa" text,
  "distrito" text,
  "status" text default 'Activo',
  "gradoEscolar" text,
  "escuela" text,
  "carrera" text,
  "ocupacion" text,
  "empresa" text,
  "programasSJ" text,
  "servicio" text,
  "voluntariadoExterno" text,
  "notas" text,
  "docTerminos" boolean default false,
  "docCartaResponsiva" boolean default false,
  "docCapacitacionPASI" boolean default false,
  "docFechaPASI" text,
  "mustChangePassword" boolean default true,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);

create index if not exists profiles_apellido_paterno_idx on public.profiles ("apellidoPaterno");
create index if not exists profiles_curp_idx on public.profiles ("curp");

-- Helper: ¿el usuario autenticado es admin? ---------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    lower((select email from auth.users where id = auth.uid())) = lower(coalesce(current_setting('app.admin_email', true), 'ADMIN@sj.internal')),
    false
  );
$$;

-- RLS -----------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "admin_all" on public.profiles;
drop policy if exists "owner_select" on public.profiles;
drop policy if exists "owner_update" on public.profiles;

create policy "admin_all"
  on public.profiles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "owner_select"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "owner_update"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Trigger: dueños sólo pueden modificar un subconjunto seguro de campos.
create or replace function public.enforce_profile_safe_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.id is distinct from old.id then
    raise exception 'No se permite cambiar id';
  end if;
  if new."curp" is distinct from old."curp" then
    raise exception 'No se permite cambiar CURP';
  end if;
  if new."fechaNacimiento" is distinct from old."fechaNacimiento" then
    raise exception 'No se permite cambiar fechaNacimiento';
  end if;
  if new."sexo" is distinct from old."sexo" then
    raise exception 'No se permite cambiar sexo';
  end if;
  if new."tipoParticipante" is distinct from old."tipoParticipante" then
    raise exception 'No se permite cambiar tipoParticipante';
  end if;
  if new."programa" is distinct from old."programa" then
    raise exception 'No se permite cambiar programa';
  end if;
  if new."distrito" is distinct from old."distrito" then
    raise exception 'No se permite cambiar distrito';
  end if;
  if new."status" is distinct from old."status" then
    raise exception 'No se permite cambiar status';
  end if;
  if new."createdAt" is distinct from old."createdAt" then
    raise exception 'No se permite cambiar createdAt';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_profile_safe_update on public.profiles;
create trigger trg_enforce_profile_safe_update
before update on public.profiles
for each row execute function public.enforce_profile_safe_update();
