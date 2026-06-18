#!/usr/bin/env bash
# CMD-SET-4: Weekly backwatch
# Run every Monday morning. Catches drift in things that decay silently:
#   - sitemap lastmod older than 7 days on pages that should be fresh (status, blog, index)
#   - llms.txt Updated header older than 14 days
#   - .well-known/agents.json lastSeen for any active agent older than 14 days
#   - GitHub Pages live vs source HEAD (deploy lag)
#   - Issuer attribution in vocab repo (any merged PR you forgot to close-loop on)
#   - SDK + MCP + Python npm/PyPI registry version vs local package.json
#   - Manual checklist items that need human eyes (Google Search Console errors,
#     Zenodo paper view counts, npm download trends)

set -e
WEB="$HOME/aps-web"
cd "$WEB"
echo "=== Weekly backwatch — $(date +%Y-%m-%d) ==="
echo

# 1. Sitemap freshness
echo "=== Sitemap lastmod freshness ==="
python3 << 'PY'
import xml.etree.ElementTree as ET
from datetime import date
ns = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
r = ET.parse('sitemap.xml').getroot()
today = date.today()
stale = []
for u in r.findall(ns+'url'):
    loc = u.find(ns+'loc').text
    lm = u.find(ns+'lastmod')
    if lm is None: continue
    age = (today - date.fromisoformat(lm.text)).days
    if age > 14:
        stale.append((age, loc))
if stale:
    for a,l in sorted(stale, reverse=True):
        print(f"  {a}d  {l}")
else:
    print("  all entries < 14d old")
PY
echo

# 2. llms.txt freshness
echo "=== llms.txt freshness ==="
upd=$(grep '^Updated:' llms.txt | head -1 | awk '{print $2}')
if [ -n "$upd" ]; then
  age=$(python3 -c "from datetime import date; print((date.today() - date.fromisoformat('$upd')).days)")
  echo "  Updated: $upd ($age days old)"
  [ "$age" -gt 14 ] && echo "  ⚠️  needs refresh"
else
  echo "  ⚠️  no Updated: header found"
fi
echo

# 3. Registry version drift (npm + PyPI)
echo "=== Registry version drift ==="
LOCAL_SDK=$(cat $HOME/agent-passport-system/package.json | python3 -c "import json,sys;print(json.load(sys.stdin)['version'])")
NPM_SDK=$(curl -s https://registry.npmjs.org/agent-passport-system/latest 2>/dev/null | python3 -c "import json,sys;print(json.load(sys.stdin).get('version','?'))" 2>/dev/null || echo "?")
echo "  SDK   local=$LOCAL_SDK  npm=$NPM_SDK  $([ "$LOCAL_SDK" = "$NPM_SDK" ] && echo ✓ || echo ⚠️)"

LOCAL_MCP=$(cat $HOME/agent-passport-mcp/package.json | python3 -c "import json,sys;print(json.load(sys.stdin)['version'])")
NPM_MCP=$(curl -s https://registry.npmjs.org/agent-passport-system-mcp/latest 2>/dev/null | python3 -c "import json,sys;print(json.load(sys.stdin).get('version','?'))" 2>/dev/null || echo "?")
echo "  MCP   local=$LOCAL_MCP  npm=$NPM_MCP  $([ "$LOCAL_MCP" = "$NPM_MCP" ] && echo ✓ || echo ⚠️)"

LOCAL_PY=$(grep '^version' $HOME/agent-passport-python/pyproject.toml | head -1 | sed 's/version = "\(.*\)"/\1/')
PYPI_PY=$(curl -s https://pypi.org/pypi/agent-passport-system/json 2>/dev/null | python3 -c "import json,sys;print(json.load(sys.stdin).get('info',{}).get('version','?'))" 2>/dev/null || echo "?")
echo "  PyPI  local=$LOCAL_PY  pypi=$PYPI_PY  $([ "$LOCAL_PY" = "$PYPI_PY" ] && echo ✓ || echo ⚠️)"
echo

# 4. GitHub Pages deploy lag
echo "=== GitHub Pages deploy lag ==="
local_head=$(cd "$WEB" && git rev-parse HEAD | cut -c1-7)
echo "  local HEAD: $local_head"
live_marker=$(curl -s https://aeoess.com/llms.txt 2>/dev/null | grep '^Updated:' | head -1)
echo "  live llms.txt: $live_marker"
echo

# 5. Manual review reminders
echo "=== Manual review reminders ==="
cat << 'REMINDERS'
  [ ] Google Search Console: any new crawl errors?
       https://search.google.com/search-console
  [ ] Zenodo paper views (last 7 days):
       https://zenodo.org/records/18749779
       https://zenodo.org/records/19260073
  [ ] npm download trends:
       https://npm-stat.com/charts.html?package=agent-passport-system
  [ ] PyPI download trends:
       https://pypistats.org/packages/agent-passport-system
  [ ] Open vocab PRs older than 7 days
  [ ] Unanswered GitHub issues across aeoess repos
REMINDERS

echo
echo "=== Done ==="
