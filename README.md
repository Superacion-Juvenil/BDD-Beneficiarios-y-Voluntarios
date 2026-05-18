# Plataforma BDD — Superación Juvenil A.B.P.

Sistema de gestión de participantes (beneficiarios y voluntarios) para Superación Juvenil A.B.P.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + React Router v7 (Vite) |
| Auth | Supabase Auth |
| Base de datos | Supabase (Postgres + RLS) |
| Deploy | Vercel (frontend) + Supabase (backend) |
| Estilos | CSS-in-JS (sin dependencias extra) |

---

## Configuración rápida

### 1. Clonar y dependencias

```bash
git clone <repo>
cd BDD-Beneficiarios-y-Voluntarios
npm install
```

### 2. Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto.
2. En **Project Settings → API** copia:
   - `Project URL` → `VITE_SUPABASE_URL` y `SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`
   - `service_role` (secreta) → `SUPABASE_SERVICE_ROLE_KEY` (solo para el script de migración, **nunca** exponer al frontend)
3. En **Authentication → Providers** habilita **Email** (Email/Password).
4. Ejecuta el esquema SQL en **SQL Editor**:
   ```sql
   -- copia el contenido de supabase/schema.sql y ejecútalo
   ```

### 3. Variables de entorno

```bash
cp .env.example .env
# Edita .env con tus valores reales
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=...

VITE_ADMIN_EMAIL=ADMIN@sj.internal
VITE_DEFAULT_PASSWORD=SJ2025

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...        # NUNCA commitear
DEFAULT_USER_PASSWORD=SJ2025
```

### 4. Crear la cuenta de administrador

En Supabase Dashboard → **Authentication → Users → Add user**:
- **Email:** `ADMIN@sj.internal`
- **Password:** la que prefieras (p. ej. `AdminSJ2025!`)
- Marca la opción de auto-confirmar el email.

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

El servidor de Vite arranca en `http://localhost:3000`. Para previsualizar el build de producción:

```bash
npm run build
npm run preview
```

---

## Deploy en Vercel

```bash
# 1. Instala Vercel CLI
npm i -g vercel

# 2. En la raíz del proyecto
vercel

# 3. Agrega las variables de entorno (VITE_*) en el dashboard de Vercel
```

El archivo `vercel.json` configura el rewrite SPA y las cabeceras de seguridad.

---

## Script de migración

### Prerrequisitos

```bash
npm install   # ya instala @supabase/supabase-js, xlsx, dotenv
```

Asegúrate de tener en `.env`:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEFAULT_USER_PASSWORD`

### Dry run (sin escribir a Supabase)

```bash
npm run migrate:dry -- --file=./data/participantes.xlsx
```

### Migración real

```bash
npm run migrate -- --file=./data/participantes.xlsx
```

### Hojas esperadas en el Excel

| Hoja | Tipo | Programa asignado |
|------|------|------------------|
| `SU` | Beneficiario | SU |
| `MCU` | Beneficiario | MCU |
| `MJ` | Beneficiario | MJ Sec/Prepa |
| `STAFF SJ` | Voluntario | (del campo `programa`) |

**Deduplicación:** si un CURP aparece en varias hojas, se conserva el registro con `Marca temporal` más reciente.

---

## Estructura del proyecto

```
src/
├── components/
│   ├── Login.jsx            — Pantalla de login (CURP + password / Admin)
│   ├── ChangePassword.jsx   — Forzar cambio de contraseña temporal
│   ├── Dashboard.jsx        — Vista del participante (tabs)
│   ├── Navbar.jsx           — Barra superior con logo y sesión
│   ├── ProfileTab.jsx       — Tab: Datos personales + tutor si menor
│   ├── ProgramaTab.jsx      — Tab: Programa, status, datos académicos
│   ├── DocumentosTab.jsx    — Tab: 3 documentos con checkboxes interactivos
│   ├── AdminPanel.jsx       — Dashboard admin con stats y tabla
│   ├── AdminEditUser.jsx    — Editar perfil completo desde admin
│   ├── AdminAddUser.jsx     — Crear nuevo participante
│   └── ui/                  — Badge, Alert, Button, Field, Spinner, SectionTitle
├── hooks/
│   ├── useAuth.jsx          — Contexto de autenticación y sesión
│   └── useUser.js           — Lectura/escritura de perfiles en Supabase
├── lib/
│   ├── supabase.js          — Inicialización de Supabase
│   ├── curp.js              — Parser CURP, calcAge, isMinor, formatFechaNac
│   └── validators.js        — Validaciones de email, teléfono, CP, CURP
├── App.jsx                  — Rutas y guards de autenticación
└── main.jsx                 — Entry point (bootstrap React)
index.html                   — HTML root (Vite)
vite.config.js               — Configuración de Vite
scripts/
└── migrate.js               — Importación masiva desde Excel
supabase/
└── schema.sql               — Tabla profiles + RLS + trigger
vercel.json                  — Configuración de deploy y cabeceras de seguridad
```

---

## Roles y acceso

### Participante
- Login: CURP (18 chars) + contraseña propia
- Primer acceso: contraseña temporal `SJ2025` → cambio obligatorio
- Solo puede ver y editar su propio perfil

### Administrador
- Login: usuario `ADMIN` + contraseña configurada
- Acceso completo al panel de administración
- Puede ver, editar y crear cualquier perfil

---

## Lógica del CURP

El CURP de 18 caracteres se parsea automáticamente:

```
Posiciones [4-5]: año de nacimiento
Posiciones [6-7]: mes
Posiciones [8-9]: día
Posición  [10]:   H=Hombre, M=Mujer
Posición  [16]:   A=2000s, 0-9=1900s
```

Fecha de nacimiento y sexo son de solo lectura para el participante. La edad se calcula en cada render — nunca se almacena.

---

## Decisiones de diseño

- **Sin dependencias de UI** (sin MUI, sin Tailwind): control total del diseño con identidad visual SJ.
- **Admin identificado por email**: `ADMIN@sj.internal` — no requiere campo `role` en la base, menor superficie de ataque.
- **Contraseñas nunca almacenadas en `profiles`**: Supabase Auth gestiona todo el ciclo de vida de credenciales.
- **Edad calculada en tiempo real**: garantiza exactitud permanente sin jobs de actualización.
- **Rate limiting**: Supabase Auth lo maneja nativamente.
- **RLS (Row Level Security)**: las políticas en `supabase/schema.sql` garantizan que un usuario solo lea/edite su perfil, mientras que el admin (identificado por email) tiene acceso total. Un trigger refuerza que los campos sensibles (CURP, programa, status, etc.) solo puedan cambiarse por admin.
