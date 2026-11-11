#!/usr/bin/env sh
set -eu

if [ -z "${JWT_SECRET:-}" ]; then
  echo "Set JWT_SECRET to a secret of at least 32 characters before running." >&2
  exit 1
fi

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$ROOT"

npm run build
STATIC_DIR="$ROOT/Backend/backend/src/main/resources/static"
mkdir -p "$STATIC_DIR"
cp -R "$ROOT/dist/." "$STATIC_DIR/"

cd "$ROOT/Backend/backend"
sh ./mvnw clean package
exec java -jar target/backend-0.0.1-SNAPSHOT.jar
