# Plataforma BDD — Superación Juvenil A.B.P.

Sistema de gestión de participantes (beneficiarios y voluntarios) para Superación Juvenil A.B.P.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + React Router v7 |
| Auth | Firebase Authentication |
| Base de datos | Cloud Firestore |
| Deploy | Vercel (frontend) + Firebase (backend) |
| Estilos | CSS-in-JS (sin dependencias extra) |

---

## Configuración rápida

### 1. Clonar y dependencias

```bash
git clone <repo>
cd BDD-Beneficiarios-y-Voluntarios
npm install
```

### 2. Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crea un proyecto (p. ej. `sj-plataforma`)
3. Activa **Authentication → Sign-in method → Email/Password**
4. Crea la base de datos Firestore en modo producción
5. Copia las credenciales web del proyecto

### 3. Variables de entorno

```bash
cp .env.example .env
# Edita .env con tus valores reales
```

```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

### 4. Crear la cuenta de administrador

En Firebase Console → Authentication → Users → Add user:
- **Email:** `ADMIN@sj.internal`
- **Password:** `AdminSJ2025!` (o la que prefieras)

### 5. Reglas de Firestore

Copia el contenido de `firestore.rules` en Firebase Console → Firestore → Reglas y publica.

### 6. Ejecutar en desarrollo

```bash
npm start
```

---

## Deploy en Vercel

```bash
# 1. Instala Vercel CLI
npm i -g vercel

# 2. En la raíz del proyecto
vercel

# 3. Agrega las variables de entorno en el dashboard de Vercel
```

El archivo `vercel.json` configura el rewrite SPA y las cabeceras de seguridad.

---

## Script de migración

### Prerrequisitos

```bash
npm install firebase-admin dotenv
# Descarga la clave de servicio desde Firebase Console
# Project Settings → Service Accounts → Generate new private key
```

### Dry run (sin escribir a Firebase)

```bash
npm run migrate:dry -- --file=./data/participantes.xlsx
```

### Migración real

```bash
npm run migrate -- --file=./data/participantes.xlsx --sa=./serviceAccount.json
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
│   └── ui/                 — Badge, Alert, Button, Field, Spinner, SectionTitle
├── hooks/
│   ├── useAuth.js           — Contexto de autenticación y sesión
│   └── useUser.js           — Lectura/escritura de perfiles en Firestore
├── lib/
│   ├── firebase.js          — Inicialización de Firebase
│   ├── curp.js              — Parser CURP, calcAge, isMinor, formatFechaNac
│   └── validators.js        — Validaciones de email, teléfono, CP, CURP
└── App.jsx                  — Rutas y guards de autenticación
scripts/
└── migrate.js               — Importación masiva desde Excel
firestore.rules              — Reglas de seguridad para producción
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
- **Admin identificado por email**: `ADMIN@sj.internal` — no requiere campo `role` en Firestore, menor superficie de ataque.
- **Contraseñas nunca almacenadas**: Firebase Auth gestiona todo el ciclo de vida de credenciales.
- **Edad calculada en tiempo real**: garantiza exactitud permanente sin jobs de actualización.
- **Rate limiting**: Firebase Auth lo maneja nativamente.
