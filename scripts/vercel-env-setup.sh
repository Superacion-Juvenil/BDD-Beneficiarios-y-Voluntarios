#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────
# scripts/vercel-env-setup.sh
#
# Carga las variables de entorno del frontend a un proyecto de Vercel
# para los tres environments (production, preview, development).
#
# Prerrequisitos:
#   1. npm i -g vercel
#   2. vercel login
#   3. Estar dentro del directorio del repo y haber corrido `vercel link`
#      (o tener .vercel/project.json existente).
#
# Uso:
#   1. Edita los valores en el bloque CONFIG a continuación.
#   2. chmod +x scripts/vercel-env-setup.sh
#   3. ./scripts/vercel-env-setup.sh
# ────────────────────────────────────────────────────────────────

set -euo pipefail

# ── CONFIG: rellena con los valores reales ──────────────────────
VITE_SUPABASE_URL="https://TU_PROYECTO.supabase.co"
VITE_SUPABASE_ANON_KEY="TU_ANON_KEY"
VITE_ADMIN_EMAIL="ADMIN@sj.internal"
VITE_DEFAULT_PASSWORD="SJ2025"
# ────────────────────────────────────────────────────────────────

if ! command -v vercel >/dev/null 2>&1; then
  echo "❌ vercel CLI no está instalado. Ejecuta: npm i -g vercel" >&2
  exit 1
fi

if [ ! -f .vercel/project.json ]; then
  echo "❌ No se encontró .vercel/project.json. Ejecuta primero: vercel link" >&2
  exit 1
fi

ENVIRONMENTS=(production preview development)

add_var() {
  local name="$1"
  local value="$2"
  for env in "${ENVIRONMENTS[@]}"; do
    echo "→ ${name} (${env})"
    # vercel env add lee el valor desde stdin
    printf '%s' "$value" | vercel env add "$name" "$env" --force >/dev/null
  done
}

echo "📤 Cargando variables a Vercel..."
add_var VITE_SUPABASE_URL      "$VITE_SUPABASE_URL"
add_var VITE_SUPABASE_ANON_KEY "$VITE_SUPABASE_ANON_KEY"
add_var VITE_ADMIN_EMAIL       "$VITE_ADMIN_EMAIL"
add_var VITE_DEFAULT_PASSWORD  "$VITE_DEFAULT_PASSWORD"

echo ""
echo "✅ Variables cargadas. Vuelve a desplegar para que tomen efecto:"
echo "   vercel --prod"
