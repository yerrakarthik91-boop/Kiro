#!/usr/bin/env bash
#
# Build the Flutter web app on a CI host that does NOT have Flutter installed
# (Vercel, Netlify, etc.). Used by vercel.json and netlify.toml.
#
# Outputs to mobile/build/web/

set -euo pipefail

FLUTTER_VERSION="${FLUTTER_VERSION:-stable}"
API_BASE_URL="${API_BASE_URL:-https://api.example.com/v1}"

echo "==> Installing Flutter ($FLUTTER_VERSION)"
if [ ! -d "_flutter" ]; then
  git clone --depth 1 -b "$FLUTTER_VERSION" https://github.com/flutter/flutter.git _flutter
fi
export PATH="$PWD/_flutter/bin:$PATH"

flutter --version

echo "==> Materializing platform folders"
cd mobile
flutter create . --project-name mms --platforms web --org app.mms

echo "==> Installing dependencies"
flutter pub get

echo "==> Building web release (API: $API_BASE_URL)"
flutter build web --release \
  --dart-define=API_BASE_URL="$API_BASE_URL"

echo "==> Done. Output at mobile/build/web/"
