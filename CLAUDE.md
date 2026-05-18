# CLAUDE.md

Guía para Claude Code al trabajar en este repositorio.

## Proyecto

Plataforma BDD de **Superación Juvenil A.B.P.** — gestión de beneficiarios y voluntarios.

## Stack

- **Build tool:** Vite 6
- **Frontend:** React 19 + React Router v7
- **Auth:** Firebase Authentication
- **DB:** Cloud Firestore (reglas en `firestore.rules`)
- **Deploy:** Vercel (frontend) — config en `vercel.json`
- **Estilos:** CSS-in-JS inline, sin librería de UI

## Comandos

```bash
npm install            # instalar dependencias
npm run dev            # dev server con HMR (http://localhost:3000)
npm run build          # build de producción (output → dist/)
npm run preview        # servir el build localmente
npm run migrate:dry    # importar Excel sin escribir
npm run migrate        # importar Excel a Firestore
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
│   └── useUser.js         # lectura/escritura de perfiles Firestore
└── lib/
    ├── firebase.js        # init Firebase
    ├── curp.js            # parser CURP + cálculo de edad
    └── validators.js      # validaciones de inputs
scripts/migrate.js         # importación masiva desde Excel
firestore.rules            # reglas de seguridad
```

## Convenciones

- **Variables de entorno:** prefijo `VITE_` para todo lo que se use en el frontend (se exponen al cliente). Se acceden vía `import.meta.env.VITE_*`. Las del script de migración van sin prefijo en `.env`.
- Componentes y archivos con JSX en `.jsx`; lógica pura sin JSX en `.js`.
- Admin se identifica por email `ADMIN@sj.internal` — no hay campo `role` en Firestore.
- La edad **nunca** se almacena, se calcula del CURP en cada render.
- Contraseñas nunca se guardan en Firestore — solo Firebase Auth.

## Notas

- **No commitear** `.env`, `serviceAccount.json`, ni archivos en `/data/` (ya en `.gitignore`).
- `vercel.json` define rewrite SPA y cabeceras de seguridad — Vercel autodetecta Vite, no se necesita config adicional.
- `xlsx` tiene CVE conocido sin fix upstream (prototype pollution / ReDoS); se usa solo en el script de migración del lado servidor, no en el frontend.

## Documentación

Ver [README.md](./README.md) para setup paso a paso, configuración de Firebase, deploy en Vercel, y detalles del script de migración.
