# CLAUDE.md

Guía para Claude Code al trabajar en este repositorio.

## Proyecto

Plataforma BDD de **Superación Juvenil A.B.P.** — gestión de beneficiarios y voluntarios.

## Stack

- **Build tool:** Vite 6
- **Frontend:** React 19 + React Router v7
- **Auth:** Supabase Auth
- **DB:** Supabase (Postgres) — esquema y RLS en `supabase/schema.sql`
- **Deploy:** Vercel (frontend) — config en `vercel.json`
- **Estilos:** CSS-in-JS inline, sin librería de UI

## Comandos

```bash
npm install            # instalar dependencias
npm run dev            # dev server con HMR (http://localhost:3000)
npm run build          # build de producción (output → dist/)
npm run preview        # servir el build localmente
npm run migrate:dry    # importar Excel sin escribir
npm run migrate        # importar Excel a Supabase
```

## Estructura

```
index.html                 # HTML root (Vite)
vite.config.js             # config de Vite
src/
├── main.jsx               # entry point
├── App.jsx                # rutas + guards de auth
├── components/            # vistas y UI
│   └── ui/                # primitivos (Badge, Alert, Button, Field, Spinner, SectionTitle)
├── hooks/
│   ├── useAuth.jsx        # contexto de sesión (JSX → .jsx)
│   └── useUser.js         # lectura/escritura de perfiles en Supabase
├── evaluaciones.js        # catálogo de las 15 evaluaciones (E1–E5) por nivel
└── lib/
    ├── supabase.js        # init Supabase (cliente principal + signupClient)
    ├── curp.js            # parser CURP + cálculo de edad
    ├── internalEmail.js   # dominio del correo interno derivado del CURP
    ├── claveSeguimiento.js # clave de seguimiento = 4 chars del CURP + programa
    ├── evalStats.js       # análisis de avance por área (puro, sin Supabase ni Excel)
    ├── reports.js         # generación de los Excel descargables
    ├── migrations.js      # migraciones de datos, versionadas en localStorage
    └── validators.js      # validaciones de inputs
scripts/migrate.js         # importación masiva desde Excel
supabase/schema.sql        # tabla profiles + RLS + trigger
```

## Convenciones

- **Variables de entorno:** prefijo `VITE_` para todo lo que se use en el frontend (se exponen al cliente). Se acceden vía `import.meta.env.VITE_*`. Las del script de migración (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) van sin prefijo en `.env`.
- Componentes y archivos con JSX en `.jsx`; lógica pura sin JSX en `.js`.
- Admin se identifica por email `documentacion@superacionjuvenil.org` — no hay campo `role` en la base.
- La edad **nunca** se almacena, se calcula del CURP en cada render.
- Contraseñas nunca se guardan en `profiles` — solo Supabase Auth.
- Columnas en la tabla `profiles` van en camelCase entre comillas (`"apellidoPaterno"`, `"docTerminos"`, etc.) para que el código JS no necesite mapeo.
- Las altas de participantes pasan por la Edge Function `create-participant` (`supabase/functions/`), que usa `auth.admin.createUser` con `email_confirm: true`. Nunca usar `signUp()` desde el frontend para esto: dispara un correo de verificación a la dirección interna del participante, que no existe, y agota el cupo de envíos de Supabase.
- El correo interno de los participantes es `CURP@participantes.superacionjuvenil.org`. **No usar dominios reservados o de prueba** (`.internal`, `.test`, `example.com`): Supabase Auth los rechaza con `email_address_invalid` y rompe altas y cambios de contraseña. El dominio está definido en `src/lib/internalEmail.js` y duplicado —porque no pueden importar ese módulo— en `supabase/functions/create-participant/index.ts`, `scripts/migrate.js` y `get_login_email_for_curp` (`supabase/schema.sql`); si cambia, hay que actualizar los cuatro.

## Notas

- **No commitear** `.env`, ni archivos en `/data/` (ya en `.gitignore`). La `service_role` key de Supabase **nunca** debe exponerse al frontend.
- `vercel.json` define rewrite SPA y cabeceras de seguridad — Vercel autodetecta Vite, no se necesita config adicional.
- `xlsx` tiene CVE conocido sin fix upstream (prototype pollution / ReDoS); se usa solo en el script de migración del lado servidor, no en el frontend.
- Las evaluaciones viven en `src/evaluaciones.js`. Cada una declara `applies`: `nivel` (secundaria / prepa / universitarios, derivado del programa vía `NIVELES`), `tipo` (Beneficiario / Voluntario) y, para la E4B, `audiencia: 'coordinador'` —esa la llena el admin desde la ficha del usuario, no el participante—. `programasExtra` suma programas que no caen en el nivel: VEM lo usa para recibir sólo la evaluación de evento de universitarios, ya que no tiene instrumentos propios. Las preguntas tipo `grid` comparten ids de renglón (`f1`…`f12`) entre la evaluación de ingreso y la de cierre del mismo nivel para poder comparar antes/después; **no cambiar esos ids**.
- La clave de seguimiento la asigna la plataforma (`src/lib/claveSeguimiento.js`): 4 primeros caracteres del CURP + `-` + programa. Se congela dentro de cada respuesta (`evaluaciones[evalId].clave`) para que siga siendo válida aunque la persona cambie de programa.
- Las respuestas guardadas bajo ids de evaluaciones que ya no están en el catálogo aparecen como "Histórico" en la ficha del usuario. Las 6 evaluaciones anteriores a noviembre de 2026 se eliminan con la migración v3 de `migrations.js`.
- El avance se mide sobre el bloque de habilidades: las 12 áreas de `AREAS_HABILIDADES` se derivan de la **posición** del renglón (`f3` y `s3` → la 3ª área), así que agregar o reordenar renglones de ese bloque cambia la medición. `evalStats.js` documenta los cortes de dominio y de cambio, y marca como muestra insuficiente cualquier corte con menos de `N_MINIMO` casos: son datos autoinformados sin prueba estadística, y el reporte lo dice explícitamente.
- El esquema SQL define un trigger `trg_enforce_profile_safe_update` que impide que un usuario no-admin modifique campos sensibles aunque la RLS le permita actualizar su fila: identidad (`id`, `curp`, `fechaNacimiento`, `sexo`, `createdAt`) y `status`. El participante **sí** elige su `tipoParticipante`, `programa` y `distrito`. Si se cambia esa lista, actualizar también `PROTECTED_FIELDS` en `ProgramaTab.jsx`.

## Documentación

Ver [README.md](./README.md) para setup paso a paso, configuración de Supabase, deploy en Vercel, y detalles del script de migración.
