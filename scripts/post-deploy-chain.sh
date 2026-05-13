#!/usr/bin/env bash
# CMD-SET-1D: Post-deploy verification chain
# Single command that runs after ANY change to versions, modules, or visibility surfaces.
# Usage: bash scripts/post-deploy-chain.sh [--no-push]
#
# What it does, in order:
#   1. Reads canonical numbers from source-of-truth files (package.json, pyproject.toml, MCP src/index.ts)
#   2. Runs node scripts/propagate.mjs --apply (auto-propagation)
#   3. Greps for known-stale patterns the propagation script misses (CMD-SET-1B locations)
#   4. Validates all JSON-LD on the website (catches blog.html-style parse errors)
#   5. Checks .well-known/mcp.json against source-of-truth versions
#   6. Validates sitemap.xml is well-formed and includes all public HTML pages
#   7. Runs CMD-SET-1B HTML grep sweep for stale "67 core", "99 modules", old version strings
#   8. Reports drift, asks before committing/pushing
#
# Designed to be idempotent — safe to run multiple times.

set -e
ROOT="$HOME"
WEB="$ROOT/aeoess_web"
SDK="$ROOT/agent-passport-system"
MCP="$ROOT/agent-passport-mcp"
PY="$ROOT/agent-passport-python"
GW="$ROOT/aeoess-gateway"

cd "$WEB"
echo "=== Post-deploy verification chain ==="
echo

# 1. Canonical numbers
SDK_V=$(cat "$SDK/package.json" | python3 -c "import json,sys;print(json.load(sys.stdin)['version'])")
MCP_V=$(cat "$MCP/package.json" | python3 -c "import json,sys;print(json.load(sys.stdin)['version'])")
PY_V=$(grep '^version' "$PY/pyproject.toml" | head -1 | sed 's/version = "\(.*\)"/\1/')
MCP_TOOLS=$(grep -c 'server.tool(' "$MCP/src/index.ts")
V2_MODS=$(ls "$SDK/src/v2"/*.ts 2>/dev/null | grep -v test | wc -l | tr -d ' ')
echo "Canonical:"
echo "  SDK:    $SDK_V"
echo "  MCP:    $MCP_V ($MCP_TOOLS tools)"
echo "  Python: $PY_V"
echo "  v2 modules: $V2_MODS"
echo

# 2. Propagation
echo "=== Step 2: propagation ==="
if [ -f scripts/propagate.mjs ]; then
  node scripts/propagate.mjs --apply 2>&1 | tail -15
else
  echo "skip: scripts/propagate.mjs not found"
fi
echo

# 3. CMD-SET-1B grep for stale numbers
echo "=== Step 3: stale-pattern sweep ==="
PATTERNS="67 core|99 modules|71 core|2552|125 tools|128 tools|v2.20|v2.21|v2.22|1\\.39\\.0|1\\.40\\.0|0\\.10\\.|0\\.9\\."
HITS=$(grep -rEn "$PATTERNS" --include='*.html' --include='*.txt' --include='*.md' --include='*.json' 2>/dev/null | grep -v '^scripts/' | grep -v '^node_modules/' | grep -v 'CHANGELOG' | grep -v '^./blog.html' | grep -v '^./specs/' | head -20 || true)
if [ -n "$HITS" ]; then
  echo "STALE FOUND:"
  echo "$HITS"
else
  echo "clean"
fi
echo

# 4. JSON-LD validity sweep
echo "=== Step 4: JSON-LD validity ==="
python3 << 'PY'
import re, json, os
bad = 0; total = 0
for f in sorted(os.listdir('.')):
    if not f.endswith('.html'): continue
    if any(f.startswith(p) for p in ('index_old','index_v2','index_new','index_aeoess','index-old','index-v2','forvlad','board','ideas-admin')): continue
    c = open(f).read()
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', c, re.DOTALL)
    for b in blocks:
        total += 1
        try: json.loads(b)
        except Exception as e:
            bad += 1
            print(f"  INVALID: {f} — {str(e)[:60]}")
print(f"  {total} blocks, {bad} invalid")
PY
echo

# 5. mcp.json drift check
echo "=== Step 5: .well-known/mcp.json drift ==="
python3 << PY
import json
d = json.load(open('.well-known/mcp.json'))
expected_sdk = "$SDK_V"
expected_mcp = "$MCP_V"
expected_tools = $MCP_TOOLS
issues = []
if d['version'] != expected_mcp: issues.append(f"version: {d['version']} != {expected_mcp}")
if d['servers'][0]['tools_count'] != expected_tools: issues.append(f"tools_count: {d['servers'][0]['tools_count']} != {expected_tools}")
if d['sdk']['version'] != expected_sdk: issues.append(f"sdk.version: {d['sdk']['version']} != {expected_sdk}")
if issues:
    for i in issues: print(f"  DRIFT: {i}")
else:
    print("  in sync")
PY
echo

# 6. Sitemap validation
echo "=== Step 6: sitemap.xml ==="
python3 -c "
import xml.etree.ElementTree as ET
import os
r = ET.parse('sitemap.xml').getroot()
ns = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
urls = [u.find(ns+'loc').text for u in r.findall(ns+'url')]
print(f'  {len(urls)} URLs, valid XML')
public_html = [f for f in os.listdir('.') if f.endswith('.html') and not any(f.startswith(p) for p in ('index_old','index_v2','index_new','index_aeoess','index-old','index-v2','forvlad','board','ideas-admin'))]
in_sitemap = set()
for u in urls:
    p = u.replace('https://aeoess.com/','') or 'index.html'
    in_sitemap.add(p)
missing = [f for f in public_html if f not in in_sitemap and f != 'index.html']
if missing: print(f'  MISSING: {missing}')
else: print('  all public pages indexed')
"
echo

# 7. Gateway health (only if URL reachable)
echo "=== Step 7: production endpoints ==="
for url in https://aeoess.com/ https://gateway.aeoess.com/health https://mcp.aeoess.com/ https://api.aeoess.com/health; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>&1 || echo "000")
  echo "  $code  $url"
done
echo

# 8. Git status across repos
echo "=== Step 8: git cleanliness ==="
for repo in "$WEB" "$SDK" "$MCP" "$PY"; do
  cd "$repo"
  s=$(git status -s | wc -l | tr -d ' ')
  branch=$(git branch --show-current)
  echo "  $(basename $repo): $branch, $s uncommitted"
done

echo
echo "=== Done ==="
echo "If drift found above: review, then run 'git add -A && git commit && git push' in affected repos."
