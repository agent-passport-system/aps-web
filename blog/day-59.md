---
id: "day-59"
title: "Day 59: One receipt, four projections"
date: "2026-04-16"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 59: One receipt, four projections

Two ships and a retirement today.

### Build A &mdash; the attribution primitive

For a while now the SDK has been accumulating attribution machinery along four different axes. Data sources contributing to an output &mdash; that had its own receipt. Protocol modules that evaluated the action &mdash; another. The governance chain that authorized it &mdash; another. Compute providers that ran it &mdash; a fourth. Four signed artifacts per action, four verification paths, and no single object that said "this is the attribution for *this specific action*."

Build A consolidates all four into one signed Merkle envelope.

One `AttributionPrimitive`, four axis leaves (D, P, G, C), one `merkle_root`, one Ed25519 signature over the envelope. Any single axis can be projected and verified on its own without revealing the other three. Two projections of the same receipt cross-verify by shared `action_ref + merkle_root + signature` &mdash; you can tell, cryptographically, that the D projection someone showed you came from the same underlying action as the G projection someone else showed you.

The spec has been sitting at `/specs/ATTRIBUTION-PRIMITIVE-v1.1.md` since Apr 12. Today it landed as running code: 6 new SDK exports, 6 new MCP tools, a 1:1 Python port with cross-language signature verification, and an `AttributionPrimitive` type with canonical weight-string representation, balanced Merkle composition, and residual-bucket aggregation for sub-threshold contributors.

**SDK** [v1.44.0](https://www.npmjs.com/package/agent-passport-system). **MCP** [v2.25.0](https://www.npmjs.com/package/agent-passport-system-mcp). **Python** [v0.13.0](https://pypi.org/project/agent-passport-system/). All three published, all three compatible.

The part worth flagging for anyone building on this: the projection structure means a settlement pipeline can operate on just the D axis without ever seeing the governance or compute axes. A data contributor can verify their share without the protocol stack having to disclose which evaluation modules fired. A compute provider can prove their share without exposing the data lineage. One receipt, four audiences, no disclosure leakage across them.

Builds B and C (fractional weights, settlement) are unblocked by this. Two-week arc.

### Build D2 &mdash; signed trust profiles

Smaller ship, but the kind that changes integration shape.

The gateway has always exposed public trust profiles at `/api/v1/public/trust/:agentId` &mdash; a JSON document describing an agent's grade, wallet bindings, delegation state, and so on. Useful for dashboards, useful for agents deciding whether to talk to each other. Not directly *verifiable* by a third party, because it came over HTTPS and that's it. If you wanted to know that a specific profile was really what the gateway said, you had to trust the transport.

Build D2 attaches a compact Ed25519 JWS to every successful trust-profile response. Three headers: `X-APS-JWS` (the compact JWS), `X-APS-JWS-KID: gateway-v1`, and `X-APS-JWS-JWKS` pointing at [the public JWKS](https://gateway.aeoess.com/.well-known/jwks.json).

The JWS is over the canonical JSON body. The JWKS endpoint publishes the gateway's public key. Anyone can pull the profile, pull the JWKS, and verify cryptographically that the gateway signed exactly this payload. Body unchanged &mdash; existing consumers keep working, the signature just rides along in headers.

Tried it end-to-end with `jose`. Verifies cleanly. Kid matches, alg is EdDSA, signature checks out against the public JWKS.

This is the protocol layer that was missing between "the gateway told me X" and "I can prove the gateway told me X." Consumers that need that proof can now get it without changing how they fetch.

### Coordination retired

One quiet change worth naming. For a long stretch, work on this project ran through three coordination paths &mdash; a primary operator, a reviewer agent that handled GitHub posting, and a comms relay. It was a useful architecture when I was figuring out what this project even was. It stopped being useful a while ago.

Today it got retired. The reviewer agent's workflows are archived under `archive-portal-era/`, the nightly cron is gone, and the GitHub posting flows through one path now. Historical records &mdash; roadmap, blog, ops log &mdash; are preserved as they were. Nothing lost, just fewer moving parts.

Simpler is usually better.
