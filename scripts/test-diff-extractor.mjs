#!/usr/bin/env node
// Test corpus for the "every changed line" diff extractor.
//
// Why this exists. On 2026-08-20 I reviewed diffs all day with:
//
//     git diff -U0 | grep -E '^[-+][^-+]'
//
// That character class excludes `-` and `+`, so every added markdown list item, which
// begins `+- `, was silently dropped. Paper DOI lines added to four llms.txt files did
// not appear in my own line-by-line review. I only noticed because a repo showed as
// modified while its "reviewed" diff came back empty.
//
// The claim "I reviewed every changed line" was false for list-shaped content, and it was
// false in exactly the way the whole day's other defects were false: a tool with a blind
// spot returning a confident, plausible, empty answer.
//
// So the extractor gets a corpus, like any other parser we depend on.
//
// Run: node scripts/test-diff-extractor.mjs

// The extractor under test. Any review command used anywhere must match this behaviour.
// Prefix filtering alone cannot work: a content line beginning "++" renders as "+++" and
// is indistinguishable from a file header. Content only ever appears INSIDE a hunk, so
// track the hunk boundary instead of guessing from the first characters. This corpus
// caught the prefix version failing on exactly that case within a minute of existing.
export function changedLines(diff) {
  const out = [];
  let inHunk = false;
  for (const l of diff.split('\n')) {
    if (l.startsWith('@@')) { inHunk = true; continue; }
    if (l.startsWith('diff --git')) { inHunk = false; continue; }
    if (!inHunk) continue;                       // file headers live above the first hunk
    if (l.startsWith('+') || l.startsWith('-')) out.push(l);
  }
  return out;
}

// The broken one, kept so the corpus proves the difference rather than asserting it.
function changedLinesBROKEN(diff) {
  return diff.split('\n').filter(l => /^[-+][^-+]/.test(l));
}

const DIFF = [
  'diff --git a/llms.txt b/llms.txt',
  '--- a/llms.txt',
  '+++ b/llms.txt',
  '@@ -50,0 +51 @@',
  '+- Plausibly Wrong: https://doi.org/10.5281/zenodo.21208555',   // markdown bullet, THE MISS
  '-- Retired bullet line',                                        // removed bullet
  '+  "tools_count": 152,',                                        // json
  '-  "tools_count": 150,',
  '+Updated: 2026-08-20',                                          // plain prose
  '-Updated: 2026-08-17',
  '+++ not a header, a line that starts with plus plus plus',      // pathological
  '+- [ ] checklist item',                                         // markdown checkbox
  '+-42 is a negative number at line start',                       // digit after minus
  ' unchanged context line',
].join('\n');

const EXPECTED = 9; // every + or - line above except the two file headers and the context line

const got = changedLines(DIFF);
const broken = changedLinesBROKEN(DIFF);

let failed = 0;

if (got.length !== EXPECTED) {
  console.log(`FAIL  extractor returned ${got.length} changed lines, expected ${EXPECTED}`);
  failed++;
} else {
  console.log(`ok    extractor returns all ${EXPECTED} changed lines`);
}

// The specific line that was invisible all day. Named explicitly so a future refactor
// that reintroduces the bug fails on the exact case rather than on a count.
const bullet = '+- Plausibly Wrong: https://doi.org/10.5281/zenodo.21208555';
if (!got.includes(bullet)) {
  console.log('FAIL  added markdown bullet is missing, this is the 2026-08-20 blind spot');
  failed++;
} else {
  console.log('ok    added markdown bullet is visible');
}

if (broken.includes(bullet)) {
  console.log('FAIL  the corpus no longer demonstrates the original bug, so it proves nothing');
  failed++;
} else {
  console.log(`ok    corpus still reproduces the original bug (broken filter drops ${got.length - broken.length} of ${got.length} lines)`);
}

console.log(`\n${3 - failed} of 3 checks passed`);
if (failed) {
  console.error('\nThe review extractor has a blind spot. A review tool that cannot see a');
  console.error('changed line will report a clean review of a change nobody read.');
  process.exit(1);
}
