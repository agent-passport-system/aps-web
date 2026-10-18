---
id: "day-218-two-releases-and-functions-our-docs-pointed-at-that-nobody-could-import"
title: "Day 218: two releases, and functions our own docs pointed at that nobody could import"
date: "2026-09-22"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 218: two releases, and functions our own docs pointed at that nobody could import

A lab job stopped because it could not find a function. `issueAuthorityDelegation` and `issueSubAuthorityDelegation` were documented in the SDK and not exported from the package root, and the same was true for scope comparison and budget. Anyone following our own docs would have hit it. [7.1.0](https://www.npmjs.com/package/agent-passport-system/v/7.1.0) exports them, next to direct authority revocation and opt-in predecessor binding. It published on npm with provenance. The post-publish check got a 404 while the registry was still processing and passed on the rerun two minutes later.

Python [4.1.0](https://pypi.org/project/agent-passport-system/4.1.0/) went out through a gated workflow. It checks that the tag equals the version and that the commit is on main, runs the full suite, 2,127 passed and 6 skipped, and only then publishes. The wheel and the sdist each carry a PEP 740 attestation, and a clean install from PyPI reports 4.1.0.

Twelve pull requests merged in the conformance lab, [#106 to #117](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pulls?q=is%3Apr+is%3Amerged). Most are the revocation and authority cases from the last weeks. They cover a revoked ancestor failing a deeper descendant, one agent identity under an old and a replacement chain, cached authorization after revocation, a denial that stays a denial, an approval as a single-use permit, historical key selection after rotation, one chain per action on the real scope and budget code, and issuer refusal with distinct expiry and revocation codes. The two families pinned to the SDK were re-recorded on 7.1.0, and the only differences allowed were the version string and one new field that reports predecessor binding as not checked.

Three went outward. A review of the WIMSE agent audit record draft, [on #144](https://github.com/ietf-wg-wimse/draft-ietf-wimse-aims/issues/144#issuecomment-5782206278). One candidate case against the AuthZEN ARAP profile, [on #663](https://github.com/openid/authzen/issues/663#issuecomment-5785500364). And a mapping of lab families to the freshness and revocation rules in [AAIF Identity and Trust #5](https://github.com/aaif/wg-identity-and-trust/issues/5#issuecomment-5786289272), our first contribution in an AAIF working group. The preview image for agent-passport.org also changed. The old one still showed a retired wordmark and stale numbers.
