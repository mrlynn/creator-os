#!/bin/bash
# Migrate MongoDB database from "mlynn" to "creator-os"
# Uses mongodump and mongorestore (requires MongoDB Database Tools installed)
#
# Install MongoDB Database Tools if needed:
#   macOS: brew install mongodb-database-tools
#   Or: https://www.mongodb.com/docs/database-tools/installation/installation/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Load MONGODB_URI from .env.local
if [ -f .env.local ]; then
  export MONGODB_URI=$(grep '^MONGODB_URI=' .env.local | sed 's/^MONGODB_URI=//' | sed 's/^["'\'']//;s/["'\'']$//' | tr -d '\r')
fi

if [ -z "$MONGODB_URI" ]; then
  echo "Error: MONGODB_URI not set. Add it to .env.local or export it."
  exit 1
fi

# Parse URI: get base (without database name) for restore
# e.g. mongodb+srv://user:pass@host/dbname -> mongodb+srv://user:pass@host/
BASE_URI=$(echo "$MONGODB_URI" | sed 's|/[^/]*$|/|')
MLYNN_URI="${BASE_URI}mlynn"

DUMP_DIR="./db-dump-mlynn"

echo "=== MongoDB Database Migration: mlynn -> creator-os ==="
echo ""
echo "Source: mlynn"
echo "Target: creator-os"
echo ""

# Clean previous dump
rm -rf "$DUMP_DIR"
mkdir -p "$DUMP_DIR"

echo "Step 1: Dumping mlynn database..."
if ! mongodump --uri="$MLYNN_URI" --out="$DUMP_DIR"; then
  echo "Error: mongodump failed. Is the mlynn database accessible?"
  rm -rf "$DUMP_DIR"
  exit 1
fi

if [ ! -d "$DUMP_DIR/mlynn" ]; then
  echo "Error: Dump directory not found. mlynn may be empty or inaccessible."
  rm -rf "$DUMP_DIR"
  exit 1
fi

echo ""
echo "Step 2: Restoring to creator-os database..."
echo "  (Using --drop to replace existing collections in creator-os)"
# Use --db=creator-os to restore mlynn's collections into creator-os (--nsFrom/--nsTo skip files in newer mongorestore)
if ! mongorestore --drop --db=creator-os --uri="$BASE_URI" "$DUMP_DIR/mlynn"; then
  echo "Error: mongorestore failed."
  rm -rf "$DUMP_DIR"
  exit 1
fi

echo ""
echo "Step 3: Cleaning up dump files..."
rm -rf "$DUMP_DIR"

echo ""
echo "=== Migration complete ==="
echo ""
echo "Next steps:"
echo "  1. Verify your app works with creator-os (MONGODB_URI should point to creator-os)"
echo "  2. When satisfied, drop the old mlynn database:"
echo "     mongosh \"\$MONGODB_URI\" --eval 'db.getSiblingDB(\"mlynn\").dropDatabase()'"
echo ""
