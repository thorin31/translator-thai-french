#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== Traducteur Thaï ↔ Français — Setup ==="

# 1. HTTPS certificate (required for microphone access on mobile)
echo ""
echo "--- Generating self-signed TLS certificate ---"
mkdir -p "$ROOT/certs"
openssl req -x509 -newkey rsa:2048 \
  -keyout "$ROOT/certs/key.pem" \
  -out "$ROOT/certs/cert.pem" \
  -days 365 -nodes \
  -subj "/CN=192.168.81.126" \
  -addext "subjectAltName=IP:192.168.81.126" \
  2>/dev/null
echo "Certificate created at certs/cert.pem"
echo ""
echo "  ⚠️  On your phone, open https://192.168.81.126:8000 once and accept"
echo "     the security warning to trust the certificate before using the app."

# 2. Python virtual environment + dependencies
echo ""
echo "--- Installing Python dependencies ---"
cd "$ROOT/backend"
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo "Python deps installed."

# 3. Node dependencies
echo ""
echo "--- Installing Node dependencies ---"
cd "$ROOT/frontend"
npm install --silent
echo "Node deps installed."

echo ""
echo "=== Setup complete ==="
echo ""
echo "Start the backend:   cd backend && source .venv/bin/activate && python main.py"
echo "Start the frontend:  cd frontend && npm run dev"
echo ""
echo "Open on your phone:  https://192.168.81.126:5173"
