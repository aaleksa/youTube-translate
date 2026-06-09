#!/usr/bin/env bash
# Reliable change list when Cursor Review shows incomplete diffs.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== Cursor Review workaround: full change list via Git ==="
echo ""
echo "Cursor version (if installed):"
if [ -f "/Applications/Cursor.app/Contents/Resources/app/package.json" ]; then
  python3 -c "import json; print('  ', json.load(open('/Applications/Cursor.app/Contents/Resources/app/package.json'))['version'])" 2>/dev/null || true
fi
echo ""

echo "=== Uncommitted changes (what Source Control / Cmd+E should show) ==="
git status --short
echo ""

CHANGED=$(git status --short | wc -l | tr -d ' ')
if [ "$CHANGED" = "0" ]; then
  echo "Working tree is clean — Review has nothing pending."
  echo "Last commit files:"
  git show --stat --oneline HEAD | tail -n +1
else
  echo "=== Diff summary ==="
  git diff --stat
  echo ""
  echo "=== Changed file names ==="
  git diff --name-only
  git diff --cached --name-only | sed 's/^/staged: /'
fi

echo ""
echo "Tips if Review shows fewer files than Git:"
echo "  1. Source Control sidebar (branch icon) or Cmd+E"
echo "  2. Cursor Settings → Agents → Inline Diffs — toggle off/on, then quit & reopen Cursor"
echo "  3. Close Diff / Pull Request tabs if open"
echo "  4. Known bug: https://forum.cursor.com/t/agent-mode-no-longer-shows-review-accept-interface-and-applies-file-changes-automatically-after-recent-update/152581"
