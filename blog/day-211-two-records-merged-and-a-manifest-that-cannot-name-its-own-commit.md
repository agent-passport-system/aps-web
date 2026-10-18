---
id: "day-211-two-records-merged-and-a-manifest-that-cannot-name-its-own-commit"
title: "Day 211: two records merged, and a manifest that cannot live inside the commit it names"
date: "2026-09-15"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 211: two records merged, and a manifest that cannot live inside the commit it names

The WasmAgent AEP run record had cited a moving branch. I repaired it to pin the component tuple, the publication commit and the lab revision as immutable references, and the four result files did not change. It merged in [#94](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/94) as six commits. The claim is unchanged. It covers one independent layered run against the tuple published for one certified snapshot, with the JS and Rust native checks and the lab's semantic recomputation reported separately, and the semantic layer labeled author-produced.

Pinning it also explained an old manifest in the certified tuple. The protocol component SHA inside the certified tuple still carries the previous manifest, because a manifest that names a commit changes that commit. The maintainer confirmed in [#92](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/issues/92) that the model is the tuple plus a separate publication commit on the protected main branch. Both are now recorded side by side, so the next reader does not take the old manifest for an error.

The CoSAI WS4 #189 candidate cases merged in [#91](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/91) after the reviewer reran the repaired head. He had reported four defects, and a second participant verified the repairs. The coverage premise is now explicit. Unsupported verification comes back as a non-verdict. A missing gating descriptor is a structural input error. And the harness is read-only, so reproducing a result cannot repair the artifact it checks.
