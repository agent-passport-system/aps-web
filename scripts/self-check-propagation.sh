#!/usr/bin/env bash
#
# self-check-propagation.sh — comprehensive audit of propagation surfaces
#
# Run this weekly (or after any major ship) to catch drift that has escaped
# propagate.mjs. Mirrors the manual self-check audit done 2026-04-23 that
# found 7 categories of missed surface (camel/AGENTS.md revelation).
#
# Usage:
#   ./scripts/self-check-propagation.sh            # human-readable report
#   ./scripts/self-check-propagation.sh --strict   # exit non-zero on any fail
#   ./scripts/self-check-propagation.sh --json     # machine-readable output
#
# Includes scripts/test-verify-patterns.mjs, which asserts the verify patterns
# still SEE the drift shapes they are supposed to see. Added 2026-08-20 after a
# stale "150 MCP tools" was invisible to the verify pass for an unknown period.
#
# Spec: see internal propagation spec (self-check audit).
# Run as part of pre-publish discipline.

set -u

STRICT=0
JSON=0
for arg in "$@"; do
  case $arg in
    --strict) STRICT=1 ;;
    --json)   JSON=1 ;;
  esac
done

# Repos in scope (TAT intentionally excluded — separate project)
WEB="$HOME/aps-web"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDK="$HOME/agent-passport-system"
MCP="$HOME/agent-passport-mcp"
PY="$HOME/agent-passport-python"
VOCAB="$HOME/agent-governance-vocabulary"
ECOMAP="$HOME/agent-ecosystem-map"
ORG="$HOME/aeoess-dot-github"

PROP="$WEB/scripts/propagate.mjs"

FAIL_COUNT=0
PASS_COUNT=0
declare -a FINDINGS=()

record_pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  [ "$JSON" -eq 0 ] && printf "  \033[32m[PASS]\033[0m %s\n" "$1"
}

record_fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  FINDINGS+=("$1")
  [ "$JSON" -eq 0 ] && printf "  \033[31m[FAIL]\033[0m %s\n" "$1"
}

section() {
  [ "$JSON" -eq 0 ] && printf "\n\033[1m=== %s ===\033[0m\n" "$1"
}

#
# CATEGORY A — Agent-context files across ALL repos must be in propagate.mjs
#
# Every AGENTS.md, CLAUDE.md, llms.txt in every in-scope repo must appear
# in propagate.mjs target file list. Camel/Cursor/Codex/Claude all read
# these, so drift = stale context for agents.
#
section "A. Agent-context files"

for repo in "$SDK" "$MCP" "$PY" "$VOCAB" "$WEB"; do
  for name in AGENTS.md CLAUDE.md llms.txt; do
    f="$repo/$name"
    [ -f "$f" ] || continue
    short=$(echo "$f" | sed "s|$HOME/||")
    # propagate.mjs uses template literals like ${REPOS.sdk}/AGENTS.md
    # so search for the last two components: repo-label and filename.
    repo_label=$(basename "$repo" | sed 's/agent-passport-//;s/agent-//;s/aps-web/web/;s/aeoess_web/web/;s/aeoess-dot-github/org/')
    # Use a cross-variant match: either literal short path OR REPOS.xxx/filename
    if grep -Fq "$short" "$PROP" 2>/dev/null \
       || grep -qE "REPOS\.(sdk|mcp|python|vocab|web|ecomap|org)[^/]*/${name}" "$PROP" 2>/dev/null; then
      record_pass "$short in propagate.mjs"
    else
      record_fail "$short NOT in propagate.mjs — add to getTargetFiles()"
    fi
  done
done

# Ecosystem map only has README.md
if [ -f "$ECOMAP/README.md" ]; then
  if grep -qE "REPOS\.ecomap[^/]*/README\.md" "$PROP" 2>/dev/null \
     || grep -Fq "agent-ecosystem-map/README.md" "$PROP" 2>/dev/null; then
    record_pass "agent-ecosystem-map/README.md in propagate.mjs"
  else
    record_fail "agent-ecosystem-map/README.md NOT in propagate.mjs"
  fi
fi

# TAT must NOT be in propagate (it's a separate project that licenses APS)
if grep -q "theagenttimes" "$PROP" 2>/dev/null; then
  record_fail "theagenttimes in propagate.mjs — should be removed (separate project)"
else
  record_pass "theagenttimes correctly excluded from propagate.mjs"
fi

#
# CATEGORY B — .well-known/ files
#
# Machine-readable discovery endpoints. mcp.json is the most drift-prone
# because it embeds both SDK and MCP versions plus tools_count + modules + tests.
#
section "B. .well-known/ files"

for wk in mcp.json aeoess-issuer.json agent-trust.json aps.txt agents.json; do
  f="$WEB/.well-known/$wk"
  [ -f "$f" ] || { record_fail ".well-known/$wk missing"; continue; }
  # agents.json and aps.txt have schema versions, not product versions — not propagation targets
  if [ "$wk" = "agents.json" ] || [ "$wk" = "aps.txt" ] || [ "$wk" = "agent-trust.json" ]; then
    record_pass ".well-known/$wk (schema/cert only, not propagation target)"
    continue
  fi
  if grep -Fq ".well-known/$wk" "$PROP" 2>/dev/null; then
    record_pass ".well-known/$wk in propagate.mjs"
  else
    # Flag only if file contains product-version-bound content
    if grep -qE "sdk.*version|tools_count|\"modules\"[[:space:]]*:[[:space:]]*[0-9]|\"tests\"[[:space:]]*:[[:space:]]*[0-9]" "$f" 2>/dev/null; then
      record_fail ".well-known/$wk has product-versioned content but NOT in propagate.mjs"
    else
      record_pass ".well-known/$wk (no product-versioned content, OK not in propagate)"
    fi
  fi
done

# mcp.json-specific checks
if [ -f "$WEB/.well-known/mcp.json" ]; then
  sdk_expected=$(jq -r .version "$SDK/package.json" 2>/dev/null || echo "?")
  mcp_expected=$(jq -r .version "$MCP/package.json" 2>/dev/null || echo "?")
  sdk_in_mcpjson=$(jq -r '.sdk.version // ""' "$WEB/.well-known/mcp.json" 2>/dev/null)
  mcp_in_mcpjson=$(jq -r '.version // ""' "$WEB/.well-known/mcp.json" 2>/dev/null)
  if [ "$sdk_in_mcpjson" = "$sdk_expected" ]; then
    record_pass ".well-known/mcp.json sdk.version matches ($sdk_in_mcpjson)"
  else
    record_fail ".well-known/mcp.json sdk.version=$sdk_in_mcpjson (expected $sdk_expected)"
  fi
  if [ "$mcp_in_mcpjson" = "$mcp_expected" ]; then
    record_pass ".well-known/mcp.json version matches ($mcp_in_mcpjson)"
  else
    record_fail ".well-known/mcp.json version=$mcp_in_mcpjson (expected $mcp_expected)"
  fi
fi

#
# CATEGORY C — Sitemap coverage
#
# Every .html file must be in sitemap.xml (exceptions: private or drafts).
#
section "C. Sitemap coverage"

actual_count=$(ls "$WEB"/*.html 2>/dev/null | wc -l | tr -d ' ')
sitemap_count=$(grep -c "<url>" "$WEB/sitemap.xml" 2>/dev/null || echo 0)

if [ -f "$WEB/sitemap.xml" ]; then
  record_pass "sitemap.xml exists ($sitemap_count URLs, $actual_count html files)"
  for f in "$WEB"/*.html; do
    bn=$(basename "$f")
    # Special case for index.html → aeoess.com/
    if [ "$bn" = "index.html" ]; then
      grep -q "aeoess.com/</loc>\|aeoess.com/\"" "$WEB/sitemap.xml" \
        && record_pass "sitemap includes /" \
        || record_fail "sitemap missing aeoess.com/"
    else
      grep -q "aeoess.com/$bn" "$WEB/sitemap.xml" \
        && record_pass "sitemap includes $bn" \
        || record_fail "sitemap missing $bn"
    fi
  done
else
  record_fail "sitemap.xml not found"
fi

#
# CATEGORY D — Paper count in llms.txt files
#
# Canonical count is parameterized from project-state.json (counts.papers),
# the same source-of-truth propagate.mjs uses. Every llms.txt that lists
# papers must list at least that many. aeoess.com/llms.txt is the
# highest-visibility one.
#
section "D. Paper count in llms.txt"

# Parameterize from SoT so this never goes stale on a paper drop. Fall back
# to 9 only if jq / project-state.json is unavailable.
EXPECTED_PAPERS=$(jq -r '.counts.papers' "$WEB/project-state.json" 2>/dev/null)
case "$EXPECTED_PAPERS" in
  ''|null|*[!0-9]*) EXPECTED_PAPERS=9 ;;
esac

# Count Zenodo DOI occurrences, not matching LINES: papers may be listed one
# per line (llms.txt) or comma-joined on a single line (org README). The old
# `grep -c` line-count under-reported single-line lists, and the old
# `zenodo\.1[89]` class could not match newer DOIs such as
# zenodo.21208555 (Plausibly Wrong). Match any Zenodo DOI.
count_papers() {
  grep -oE "zenodo\.[0-9]+" "$1" 2>/dev/null | wc -l | tr -d ' '
}

for f in "$WEB/llms.txt" "$WEB/llms-full.txt" \
         "$SDK/llms.txt" "$MCP/llms.txt" "$PY/llms.txt" \
         "$VOCAB/llms.txt"; do
  [ -f "$f" ] || continue
  short=$(echo "$f" | sed "s|$HOME/||")
  count=$(count_papers "$f")
  count=${count:-0}
  if [ "$count" -ge "$EXPECTED_PAPERS" ]; then
    record_pass "$short lists $count papers (>= $EXPECTED_PAPERS)"
  else
    record_fail "$short lists $count papers (expected $EXPECTED_PAPERS)"
  fi
done

# Org profile
if [ -f "$ORG/profile/README.md" ]; then
  count=$(count_papers "$ORG/profile/README.md")
  count=${count:-0}
  [ "$count" -ge "$EXPECTED_PAPERS" ] \
    && record_pass "aeoess-dot-github README lists $count papers (>= $EXPECTED_PAPERS)" \
    || record_fail "aeoess-dot-github README lists $count papers (expected $EXPECTED_PAPERS)"
fi

#
# CATEGORY E — v2 module count drift
#
# Canonical (SoT project-state.json) = 84 core + 23 v2 = 107 modules.
# The prior canonical (84 core + 41 v2 = 125 modules, ratified Apr 23) is
# now itself stale and is included below so lingering references get caught.
# Scan for patterns likely to be stale v2 / total references.
#
section "E. v2 module count drift"

CURRENT_CORE=84
CURRENT_V2=23

declare -a STALE_PATTERNS=(
  "39 v2"
  "40 v2"
  "41 v2"
  "71 core"
  "84 core + 3[0-9] v2"
  "84 core + 4[0-9] v2"
  "84\\+40"
  "84\\+41"
  "84\\+39"
  "125 modules"
)

for pattern in "${STALE_PATTERNS[@]}"; do
  # Scan HTML pages and llms files, exclude dated blog articles
  hits=$(grep -rlE "$pattern" \
    "$WEB"/*.html "$WEB"/llms.txt "$WEB"/llms-full.txt \
    "$SDK"/README.md "$MCP"/README.md "$PY"/README.md 2>/dev/null \
    | grep -v "blog.html")
  if [ -z "$hits" ]; then
    record_pass "no '$pattern' in current-state surfaces"
  else
    # blog.html is allowed via exclusion, but we may still be inside a dated article
    for h in $hits; do
      # Only flag if pattern is outside <article class="post"> blocks
      count=$(awk '
        /<article class="post"/ { in_article=1 }
        /<\/article>/ { in_article=0; next }
        !in_article { print }
      ' "$h" 2>/dev/null | grep -cE "$pattern")
      [ "$count" -gt 0 ] && record_fail "$(basename "$h") contains stale '$pattern' ($count hits outside dated articles)"
    done
  fi
done

#
# CATEGORY F — SDK CLAUDE.md drift check (heavy-drift file identified in audit)
#
section "F. SDK CLAUDE.md drift"

if [ -f "$SDK/CLAUDE.md" ]; then
  SDK_VERSION=$(jq -r .version "$SDK/package.json" 2>/dev/null || echo "?")
  # The actual current-ness test: does it mention the current SDK version?
  if grep -q "$SDK_VERSION" "$SDK/CLAUDE.md"; then
    record_pass "SDK/CLAUDE.md references current SDK version ($SDK_VERSION)"
  else
    record_fail "SDK/CLAUDE.md does not reference current SDK version ($SDK_VERSION) — file is stale"
  fi
  # Known stale patterns from the Apr 23 audit
  for stale_pat in "v1\.41\.0" "2,?764 tests" "132 tools" "71 core" "714 suites"; do
    if grep -qE "$stale_pat" "$SDK/CLAUDE.md"; then
      record_fail "SDK/CLAUDE.md contains stale pattern '$stale_pat'"
    fi
  done
else
  record_fail "SDK/CLAUDE.md missing"
fi

#
# CATEGORY G — package.json and pyproject.toml descriptions
#
# npm and PyPI display these; stale counts go public.
#
section "G. package.json / pyproject.toml descriptions"

# Canonical test count comes from project-state.json (counts.tests), the same
# SoT propagate.mjs uses. The old parser shelled out to `npm test` and grepped
# jest's "Tests: N passed" line; the SDK moved to the node test runner
# (`tsx --test`, which prints "# tests N"), so that parser always returned "?"
# and this check silently did nothing. Reading SoT is both correct and fast.
SDK_TEST_COUNT=$(jq -r '.counts.tests' "$WEB/project-state.json" 2>/dev/null || echo "?")

if [ -f "$SDK/package.json" ] && [ "$SDK_TEST_COUNT" != "?" ] && [ "$SDK_TEST_COUNT" != "null" ]; then
  desc=$(jq -r .description "$SDK/package.json")
  # Look for any NNNN tests pattern in description
  desc_count=$(echo "$desc" | grep -oE "[0-9],?[0-9]{3} tests" | head -1 | tr -d ',' | grep -oE "[0-9]+")
  if [ -n "$desc_count" ] && [ "$desc_count" = "$SDK_TEST_COUNT" ]; then
    record_pass "SDK package.json description test count matches ($desc_count)"
  elif [ -n "$desc_count" ]; then
    record_fail "SDK package.json description says $desc_count tests (actual $SDK_TEST_COUNT)"
  fi
fi

if [ -f "$MCP/package.json" ]; then
  # Read the GENERATED manifest, not a grep of call sites. The old line counted
  # 'server.tool(' and returned 0 after the API moved to registerTool(), so this
  # check has been silently comparing against zero. Sixth instance of that defect
  # class on 2026-08-20. The manifest is produced from the live tool registry at
  # build time and is the count of record.
  mcp_tool_count=$(jq -r '.count' "$MCP/tools-manifest.json" 2>/dev/null || echo "")
  desc=$(jq -r .description "$MCP/package.json")
  desc_tools=$(echo "$desc" | grep -oE "[0-9]+ tools" | head -1 | grep -oE "[0-9]+")
  if [ -n "$desc_tools" ] && [ "$desc_tools" = "$mcp_tool_count" ]; then
    record_pass "MCP package.json description tool count matches ($desc_tools)"
  elif [ -n "$desc_tools" ]; then
    record_fail "MCP package.json description says $desc_tools tools (actual $mcp_tool_count)"
  fi
fi

#
# CATEGORY G2 — Verify-pattern regression (added 2026-08-20)
#
section "G2. Verify-pattern regression"
if node "$SCRIPT_DIR/test-verify-patterns.mjs" > /dev/null 2>&1; then
  record_pass "verify patterns still see every known drift shape"
else
  record_fail "a verify pattern stopped seeing a drift shape (run scripts/test-verify-patterns.mjs)"
fi

#
# CATEGORY H — Ecosystem map freshness
#
section "H. Ecosystem map freshness"

if [ -f "$ECOMAP/docs/ecosystem-data.json" ]; then
  # Check how many hours old the JSON is
  if [ "$(uname)" = "Darwin" ]; then
    age_seconds=$(($(date +%s) - $(stat -f %m "$ECOMAP/docs/ecosystem-data.json")))
  else
    age_seconds=$(($(date +%s) - $(stat -c %Y "$ECOMAP/docs/ecosystem-data.json")))
  fi
  age_hours=$((age_seconds / 3600))
  if [ "$age_hours" -lt 36 ]; then
    record_pass "ecosystem-data.json is ${age_hours}h old (< 36h, fresh)"
  else
    record_fail "ecosystem-data.json is ${age_hours}h old — rebuild via 'python3 scripts/build-ecosystem-data.py'"
  fi

  # Quick sanity on stats
  if command -v jq >/dev/null 2>&1; then
    projects=$(jq -r .stats.projects "$ECOMAP/docs/ecosystem-data.json")
    people=$(jq -r .stats.people "$ECOMAP/docs/ecosystem-data.json")
    threads=$(jq -r .stats.threads "$ECOMAP/docs/ecosystem-data.json")
    record_pass "ecosystem-data.json: $projects projects, $people people, $threads threads"
  fi
else
  record_fail "ecosystem-data.json not found — run build-ecosystem-data.py"
fi

#
# CATEGORY I — propagate.mjs --verify-only drift count
#
section "I. propagate.mjs --verify-only"

if [ -f "$PROP" ]; then
  # Run in subshell, capture drift count
  drift_count=$(cd "$WEB" && node scripts/propagate.mjs --verify-only 2>&1 \
    | grep -oE "found [0-9]+ drift" | grep -oE "[0-9]+" | head -1 || echo 0)
  if [ "$drift_count" -eq 0 ]; then
    record_pass "propagate.mjs reports 0 drift"
  elif [ "$drift_count" -lt 20 ]; then
    record_pass "propagate.mjs reports $drift_count drift (<20 is expected from per-module false positives)"
  elif [ "$drift_count" -lt 50 ]; then
    record_fail "propagate.mjs reports $drift_count drift — spot-check the list"
  else
    record_fail "propagate.mjs reports $drift_count drift — auto-fix needed"
  fi
else
  record_fail "propagate.mjs not found"
fi

#
# CATEGORY J — Daily-rhythm surfaces updated today
#
# Checks that the 4 daily surfaces were actually touched today:
# updates-panel, blog (if ship), roadmap (if blog), ecosystem-map.
#
section "J. Daily-rhythm surfaces (today)"

# NOTE: the old `up-d` "Updates panel" check was removed. That surface no
# longer exists on index.html (the dated `<div class="up-d">` entries were
# retired), so the check failed on every run regardless of state. The roadmap
# and blog freshness pointers below remain informational.

# Roadmap entry check — look for today's date pattern
today_iso=$(date +"%Y-%m-%d")
today_dN=$(grep -E "^- id: d[0-9]+" "$WEB/roadmap.yaml" | head -1 | grep -oE "d[0-9]+")
record_pass "roadmap.yaml most-recent id: $today_dN"

# Blog latest article check
latest_blog_date=$(grep -oE 'datetime="[0-9]{4}-[0-9]{2}-[0-9]{2}"' "$WEB/blog.html" | head -1)
record_pass "blog latest article $latest_blog_date"

#
# FINAL REPORT
#
section "Summary"

total=$((PASS_COUNT + FAIL_COUNT))

if [ "$JSON" -eq 1 ]; then
  # Machine-readable JSON output
  printf '{\n'
  printf '  "pass_count": %d,\n' "$PASS_COUNT"
  printf '  "fail_count": %d,\n' "$FAIL_COUNT"
  printf '  "total": %d,\n' "$total"
  printf '  "findings": [\n'
  for i in "${!FINDINGS[@]}"; do
    sep=","
    [ "$i" -eq "$((${#FINDINGS[@]} - 1))" ] && sep=""
    printf '    %s%s\n' "\"${FINDINGS[$i]}\"" "$sep"
  done
  printf '  ]\n}\n'
else
  printf "\n  Total checks: %d\n" "$total"
  printf "  \033[32mPassed: %d\033[0m\n" "$PASS_COUNT"
  printf "  \033[31mFailed: %d\033[0m\n" "$FAIL_COUNT"
  if [ "$FAIL_COUNT" -gt 0 ]; then
    printf "\n  Failures to address:\n"
    for f in "${FINDINGS[@]}"; do
      printf "    - %s\n" "$f"
    done
    printf "\n  See internal propagation spec (Self-Check Audit) for remediation.\n"
  else
    printf "\n  All surfaces pass. Propagation state is clean.\n"
  fi
fi

# Exit code
if [ "$STRICT" -eq 1 ] && [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi
exit 0
