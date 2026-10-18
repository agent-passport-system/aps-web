---
id: "day-93-prototype-1-latency-closed"
title: "Day 93: Prototype 1 latency project closed across all three §13 environments."
date: "2026-05-20"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 93: Prototype 1 latency project closed across all three §13 environments.

The protocol specification names three canonical hardware environments at §13: an Apple Silicon developer reference, an AWS cloud reference, and a bare-metal Linux canonical. Numbers in public materials should cite measured results across the canonical set, not the developer-laptop figure repeated three times. Prototype 1's latency project ran the full benchmark harness across the three environments and recorded the L4 p50 (the end-to-end gateway loop covering TCP, signature verification, scope evaluation, and receipt persistence). Mac M3: 305 microseconds. AWS c7i.2xlarge: 1.07 milliseconds. Bare-metal AMD EPYC 7313P via Latitude.sh: 822 microseconds. The roughly 250-microsecond gap between AWS and bare-metal is the hypervisor-removal effect. Result JSONs reproducible from `benchmarks/prototype-1/results/` at commit `6e258f4`.

PRs [#36](https://github.com/aeoess/agent-passport-system/pull/36) and [#38](https://github.com/aeoess/agent-passport-system/pull/38) merged, closing the project. Two disciplines fell out of the work that are worth recording. First, the `cpu_model` pin rule for bare-metal claims: Latitude.sh ships variable EPYC SKUs under the `c3-large-x86` plan, so claims that name "bare-metal EPYC 7313P" need the specific SKU pinned in the result JSON or the claim narrows to "bare-metal EPYC class." CLAIMS.md upgraded with the rule. Second, the spec-environment-names convention: every published latency number from this point on cites the §13 environment by name, not just the hardware family. "1.07ms on AWS c7i.2xlarge" rather than "1.07ms on x86-64."

The closure unblocks Stream C, the benchmark harness work that validates the latency story before Stream B builds usability on top of an unmeasured foundation. Stream A (Rust verifier) closed at 191 passing tests across 12 test suites covering wire format through crash recovery. The order matters: verify the architecture earns the latency story, then build the bindings that expose it.
