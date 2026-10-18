---
id: "cosai-tool-registry-integrity"
title: "Tool-registry integrity: closing the gap so the claim is true"
date: "2026-05-19"
kind: "article"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Tool-registry integrity: closing the gap so the claim is true

The OASIS Coalition for Secure AI has a control proposal in review, `controlToolRegistryandDiscoveryIntegrity`, covering integrity of tool registries, manifests, and discovery endpoints across their lifecycle: signed manifests, publisher identity, namespace governance against typosquatting, and re-approval when tool metadata changes after vetting. The Agent Passport System already had signed registry entries and implementation-hash integrity. It did not yet have the other three pieces.

Rather than narrow what we claimed APS does, we built what was missing. Signed tool manifests with a distinct metadata hash. Publisher identity verification, resolving an external trust root or an APS-native identity, not a caller-supplied key. Namespace governance so a tool under a claimed namespace must be published by that namespace's owner. Re-approval bound to a resolved attestor identity, so a metadata change moves a manifest to pending and only a verifiable attestor can clear it, which makes the workflow cryptographically meaningful rather than only stateful. Each piece has tests, including the adversarial cases, and cross-language conformance vectors.

The work is on the `cosai-tool-registry-integrity` branch and was contributed toward the CoSAI control proposal, with APS offered as a reference implementation. Whether the reference is carried is the maintainers' call; the control stands on its own. What matters here is the discipline: a reference-implementation claim has to be true at the source before it is made, not narrowed after someone checks. The gap is closed, so the claim is accurate.
