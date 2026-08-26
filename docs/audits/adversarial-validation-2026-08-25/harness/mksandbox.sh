#!/usr/bin/env bash
# Create a disposable copy of the canonical working tree.
# Usage: mksandbox.sh <name>   -> prints the sandbox path on stdout
# node_modules is a junction to the canonical tree and is never mutated.

SRC="<repository>"
CAMP="<scratchpad>"
NAME="$1"
DEST="$CAMP/sandboxes/$NAME"

if [ -z "$NAME" ]; then echo "sandbox name required" >&2; exit 2; fi

# Unlink the junction first so the tree removal cannot follow it into node_modules.
if [ -d "$DEST/node_modules" ]; then
  cmd //c "rmdir \"$(cygpath -w "$DEST/node_modules")\"" >/dev/null 2>&1
fi
if [ -e "$DEST" ]; then
  rm -rf "$DEST" >/dev/null 2>&1
fi

mkdir -p "$DEST" || { echo "mkdir failed" >&2; exit 1; }

tar -C "$SRC" \
  --exclude=./node_modules --exclude=./.git --exclude=./dist \
  --exclude=./.astro --exclude=./test-results --exclude=./.ci-diagnostic-logs \
  --exclude=./ops/__pycache__ --exclude=./tests/memory/__pycache__ \
  --exclude=./tests/security/__pycache__ \
  -cf - . 2>/dev/null | tar -C "$DEST" -xf - 2>/dev/null

if [ ! -f "$DEST/memory.toml" ]; then echo "copy failed" >&2; exit 1; fi

JPATH="$(cygpath -w "$DEST/node_modules")" JTARGET="$(cygpath -w "$SRC/node_modules")"   powershell -NoProfile -Command 'New-Item -ItemType Junction -Path $env:JPATH -Target $env:JTARGET | Out-Null' >/dev/null 2>&1

if [ ! -f "$DEST/node_modules/zod/package.json" ]; then echo "junction failed" >&2; exit 1; fi

echo "$DEST"
