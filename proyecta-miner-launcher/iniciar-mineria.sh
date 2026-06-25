#!/usr/bin/env bash
# ============================================================
#  PROYECTA - Minero de Alto Rendimiento (xmrig nativo)
#  Descarga xmrig oficial (una vez) y mina para el proyecto.
#  Uso:  chmod +x iniciar-mineria.sh && ./iniciar-mineria.sh
# ============================================================
set -e

# --- Configuracion del proyecto (editable) ---
WALLET="42gfB3ayxZV2VNH8KAsUMU5fcXUqd83BGJneR37KqJaBQuzYJ8w5d3aV5DBkFH2oWo9YzJLcjhv2d5dR4V2C2xFrUGKiePh"
POOL="pool.supportxmr.com:3333"
PASSWORD="proyecta"
WORKER="proyecta-desktop"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="$ROOT/xmrig"
EXE="$BIN_DIR/xmrig"

echo ""
echo "  ========================================================="
echo "    PROYECTA - Mineria de Alto Rendimiento (xmrig nativo)"
echo "  ========================================================="
echo "    Pool:   $POOL"
echo "    Wallet: ${WALLET:0:16}...(proyecto)"
echo "  ---------------------------------------------------------"
echo ""

if [ ! -x "$EXE" ]; then
  echo "  [1/3] Detectando sistema y ultima version de xmrig..."

  case "$(uname -s)" in
    Linux*)  PATTERN="linux-static-x64.tar.gz";;
    Darwin*) if [ "$(uname -m)" = "arm64" ]; then PATTERN="macos-arm64.tar.gz"; else PATTERN="macos-x64.tar.gz"; fi;;
    *) echo "  [ERROR] SO no soportado. Usa el .bat en Windows."; exit 1;;
  esac

  URL=$(curl -s https://api.github.com/repos/xmrig/xmrig/releases/latest \
        | grep "browser_download_url" \
        | grep "$PATTERN" \
        | head -n1 \
        | cut -d '"' -f 4)

  if [ -z "$URL" ]; then
    # Fallback Linux a build dinamico si no hay static
    URL=$(curl -s https://api.github.com/repos/xmrig/xmrig/releases/latest \
          | grep "browser_download_url" | grep "linux-x64.tar.gz" | head -n1 | cut -d '"' -f 4)
  fi

  if [ -z "$URL" ]; then
    echo "  [ERROR] No se encontro binario para tu sistema."
    echo "  Descargalo de https://github.com/xmrig/xmrig/releases"
    exit 1
  fi

  echo "  [2/3] Descargando: $(basename "$URL")"
  TMP="$ROOT/_xmrig_tmp"
  rm -rf "$TMP"; mkdir -p "$TMP"
  curl -L "$URL" -o "$TMP/xmrig.tar.gz"

  echo "  [3/3] Extrayendo..."
  tar -xzf "$TMP/xmrig.tar.gz" -C "$TMP"
  rm -rf "$BIN_DIR"; mkdir -p "$BIN_DIR"
  INNER=$(find "$TMP" -maxdepth 1 -type d -name "xmrig-*" | head -n1)
  cp -R "$INNER"/* "$BIN_DIR"/
  chmod +x "$EXE"
  rm -rf "$TMP"
  echo "  [OK] xmrig instalado en ./xmrig"
else
  echo "  [OK] xmrig ya esta instalado."
fi

echo ""
echo "  Iniciando mineria... (Ctrl+C para detener)"
echo "  Verifica stats en https://supportxmr.com (pega el wallet del proyecto)"
echo ""

exec "$EXE" \
  -o "$POOL" \
  -u "$WALLET" \
  -p "$PASSWORD" \
  --rig-id "$WORKER" \
  -a rx/0 \
  -k \
  --donate-level 1
