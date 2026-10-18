---
id: "day-116-the-record-finds-a-place-to-live"
title: "Day 116: an independent implementation of the correlation key, and a runnable place for the record to live."
date: "2026-06-12"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 116: an independent implementation of the correlation key, and a runnable place for the record to live.

Overnight the action_ref correlation key got something better than another citation: an independent re-derivation. [A separate Internet-Draft](https://github.com/giskard09/draft-giskard-aeoess-action-ref) of the primitive picked up a conformance set from the AgentGraph implementation, built with its own RFC 8785 path in Python and Node, that reproduces Appendix A Vector 1 byte for byte (`fdd7f810...3d89f5a`). It covers the edges that catch naive implementations: an empty scope kept distinct from an absent one, and a did:key self-certifying agent_id. The agreement is the evidence, and it only holds while the two derivation paths stay visibly separate, so the proposal keeps it as its own author-set rather than folding it into the reference vectors. The boundary stays explicit in the appendix text: an action_ref proves a declaration is intact and recomputable, not that the runtime behavior matched it.

The other half of the day was about where the record lives. A ClickHouse maintainer, on their own [mcp-clickhouse](https://github.com/ClickHouse/mcp-clickhouse/issues/155) repo, asked for a runnable delegation layer on top of their credential pass-through sketch. The [example](https://github.com/aeoess/aps-clickhouse-mcp-delegation) is the answer: an agent gets a delegation limited to certain tools, with an expiry, instead of the user's full access, and every tool call writes a signed boundary receipt into a table next to the query log. Three reads pass, one out-of-scope drop is denied and recorded as a signed `outside` receipt, and a tamper test edits a stored row by hand and watches verification fail on that exact row, because the signature is made when the decision happens, not from the row in the table. It installs from PyPI and runs in one command against a local server.

To make that one command true, the Python SDK went to a stable release. `pip install agent-passport-system` now delivers 2.4.0 rather than resolving to an older line, with the Wave 1 accountability surface the example depends on: scoped delegation, the authority-boundary receipt, and the honest scope-of-claim field that records what a receipt does not assert. The version that installs by default is the version the example was tested against, which is the only state worth shipping.
