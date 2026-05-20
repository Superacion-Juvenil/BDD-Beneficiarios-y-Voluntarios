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
└── lib/
    ├── supabase.js        # init Supabase (cliente principal + signupClient)
    ├── curp.js            # parser CURP + cálculo de edad
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
- `createSignupClient()` en `src/lib/supabase.js` retorna un cliente sin persistencia de sesión — usarlo siempre que se cree un usuario desde el admin para no reemplazar la sesión del admin.

## Notas

- **No commitear** `.env`, ni archivos en `/data/` (ya en `.gitignore`). La `service_role` key de Supabase **nunca** debe exponerse al frontend.
- `vercel.json` define rewrite SPA y cabeceras de seguridad — Vercel autodetecta Vite, no se necesita config adicional.
- `xlsx` tiene CVE conocido sin fix upstream (prototype pollution / ReDoS); se usa solo en el script de migración del lado servidor, no en el frontend.
- El esquema SQL define un trigger `trg_enforce_profile_safe_update` que impide que un usuario no-admin modifique campos sensibles (CURP, programa, status, etc.) aunque la RLS le permita actualizar su fila.

## Documentación

Ver [README.md](./README.md) para setup paso a paso, configuración de Supabase, deploy en Vercel, y detalles del script de migración.
