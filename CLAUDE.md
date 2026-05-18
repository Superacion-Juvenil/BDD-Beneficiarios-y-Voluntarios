# CLAUDE.md

Guía para Claude Code al trabajar en este repositorio.

## Proyecto

Plataforma BDD de **Superación Juvenil A.B.P.** — gestión de beneficiarios y voluntarios.

## Stack

- **Frontend:** React 19 + React Router v7 (CRA / react-scripts 5)
- **Auth:** Firebase Authentication
- **DB:** Cloud Firestore (reglas en `firestore.rules`)
- **Deploy:** Vercel (frontend) — config en `vercel.json`
- **Estilos:** CSS-in-JS inline, sin librería de UI

## Comandos

```bash
npm install            # instalar dependencias
npm start              # dev server (http://localhost:3000)
npm run build          # build producción
npm test               # tests (react-scripts test, watch mode)
npm run migrate:dry    # importar Excel sin escribir
npm run migrate        # importar Excel a Firestore
```

## Estructura

```
src/
├── App.jsx                # rutas + guards de auth (entry real)
├── index.js               # bootstrap React
├── components/            # vistas y UI
│   └── ui/                # primitivos (Badge, Alert, Button, Field, Spinner, SectionTitle)
├── hooks/
│   ├── useAuth.js         # contexto de sesión
│   └── useUser.js         # lectura/escritura de perfiles Firestore
└── lib/
    ├── firebase.js        # init Firebase
    ├── curp.js            # parser CURP + cálculo de edad
    └── validators.js      # validaciones de inputs
scripts/migrate.js         # importación masiva desde Excel
firestore.rules            # reglas de seguridad
```

## Convenciones

- Componentes en `.jsx`, lógica pura en `.js`.
- Admin se identifica por email `ADMIN@sj.internal` — no hay campo `role` en Firestore.
- La edad **nunca** se almacena, se calcula del CURP en cada render.
- Variables de entorno con prefijo `REACT_APP_` para el frontend; secrets del script de migración van sin prefijo (ver `.env.example`).
- Contraseñas nunca se almacenan en Firestore — solo Firebase Auth.

## Notas importantes

- **No commitear** `.env`, `serviceAccount.json`, ni archivos en `/data/` (ya en `.gitignore`).
- El archivo `vercel.json` define rewrite SPA y cabeceras de seguridad — no modificarlo sin revisar headers.
- El proyecto fue inicializado con Create React App; quedan algunos archivos boilerplate no utilizados (`App.js`, `App.css`, `App.test.js`, `logo.svg`) — pueden eliminarse cuando se confirme.
- `react-scripts 5.0.1` con React 19 puede mostrar warnings; CRA está en modo mantenimiento.

## Documentación detallada

Ver [README.md](./README.md) para setup paso a paso, configuración de Firebase, deploy en Vercel, y detalles del script de migración.
