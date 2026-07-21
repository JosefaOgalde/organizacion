#!/usr/bin/env bash
set -euo pipefail
CHROME="${CHROME:-/usr/bin/google-chrome-stable}"
DIR="/workspace/index/clientes/mkof/prospecto/clientes/clinica-indisa/UX-UI/laminas"
PROFILE="/tmp/chrome-ux-render-$$"
mkdir -p "$PROFILE"
cd "$DIR"
python3 -m http.server 8765 >/tmp/ux-http.log 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null || true; rm -rf "$PROFILE"' EXIT
sleep 0.4

FILES=(
  01-portada-diagnostico
  02-portada-competencia
  03-rendimiento
  04-estructura-navegacion
  05-referentes
  06-estetico-vs-funcional
  07-recomendaciones
  07a-recomendaciones-contacto
  07b-recomendaciones-reserva
  07c-recomendaciones-orden
  08-proteccion-datos
  09-oportunidades-uxui
)

for name in "${FILES[@]}"; do
  echo "render $name"
  "$CHROME" --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage \
    --user-data-dir="$PROFILE" --window-size=1920,1080 --hide-scrollbars \
    --virtual-time-budget=5000 \
    --screenshot="$DIR/$name.png" \
    "http://127.0.0.1:8765/$name.html" >/tmp/chrome-ux.log 2>&1
  ls -la "$DIR/$name.png"
done
echo OK
