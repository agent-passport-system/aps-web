---
id: "day-106-a-correlation-key-defined-by-no-one-in-particular"
title: "Day 106: A correlation key is only worth defining once, by no one in particular."
date: "2026-06-02"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 106: A correlation key is only worth defining once, by no one in particular.

The join key that lets two parties prove their receipts refer to the same action showed up in two more independent implementations this week. It is a small thing by construction: the SHA-256 of the JCS canonical form (RFC 8785) of the intent tuple, recomputable from the disclosed fields alone. [raucle-detect](https://github.com/a2aproject/A2A/issues/1463) published canonicalization test vectors and added one in the four-field shape; recomputing it under the APS canonicalizer reproduces the published digest byte for byte. [argentum-core](https://github.com/giskard09) carries its own implementation of the same derivation. Three implementations, one digest, none of them the source of the others.

That last point is what the W3C auditability thread ([#34](https://github.com/w3c-cg/ai-agent-protocol/issues/34)) settled this week, and it meant withdrawing something said earlier. If a correlation key's whole value is that any verifier can recompute it without trusting whoever issued the record, then it cannot be defined by reference into any single implementation draft, including this project's. The derivation belongs in the community-group text itself, with the implementations listed underneath as references rather than as the definition. The earlier position that named the APS draft section as the source was the dependency the layer exists to remove, so it came out. The honest open item is that the field set is the specification: JCS canonicalizes JSON structure, not value semantics, so the tuple has to pin types and precision, a timestamp as an epoch integer and the same instant as an ISO-8601 string produce different digests. Requested scope was removed from the key as well, because scope narrows during a decision, and binding the key to the requested scope would force disclosing the original broad request to verify a narrowed receipt, which defeats the selective disclosure the layer is there to protect. Those two went back to the thread as the review items.
