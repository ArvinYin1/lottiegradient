#!/usr/bin/env bash
set -euo pipefail

SSH_KEY="${SSH_KEY:-$HOME/.ssh/hongkongserver.pem}"
HOST="${HOST:-root@43.155.27.82}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/lottiegradient}"
SITE_URL="${SITE_URL:-https://www.lottie.uno/}"
ASSETS=(index.html backfill.html css js svg)

case "${1:-}" in
  "") DRY_RUN=0 ;;
  --dry-run) DRY_RUN=1 ;;
  *)
    echo "Usage: $0 [--dry-run]" >&2
    exit 2
    ;;
esac

cd "$(dirname "$0")"

if [[ ! -f "$SSH_KEY" ]]; then
  echo "SSH key not found: $SSH_KEY" >&2
  echo "Set SSH_KEY=/path/to/key and try again." >&2
  exit 1
fi

for cmd in rsync ssh curl; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Required command not found: $cmd" >&2
    exit 1
  fi
done

RSYNC_FLAGS=(-az --delete --human-readable)
if [[ "$DRY_RUN" == 1 ]]; then
  RSYNC_FLAGS+=(--dry-run --itemize-changes)
  echo "DRY RUN: no server files will be changed"
fi

printf -v SSH_KEY_QUOTED '%q' "$SSH_KEY"
SSH_COMMAND="ssh -i $SSH_KEY_QUOTED -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes"

echo "Syncing ${ASSETS[*]} to ${HOST}:${REMOTE_DIR}"
rsync "${RSYNC_FLAGS[@]}" \
  -e "$SSH_COMMAND" \
  -- "${ASSETS[@]}" \
  "${HOST}:${REMOTE_DIR}/"

if [[ "$DRY_RUN" == 1 ]]; then
  echo "Dry run completed"
  exit 0
fi

echo "Verifying ${SITE_URL}"
code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 30 "$SITE_URL" || echo "000")
title=$(curl -fsSL --max-time 30 "$SITE_URL" | grep -oE '<title>[^<]*</title>' | head -1 || true)
if [[ "$code" != "200" ]]; then
  echo "Deployment verification failed: HTTP $code" >&2
  exit 1
fi

echo "Deployment succeeded: HTTP $code $title"
