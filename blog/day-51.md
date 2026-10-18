---
id: "day-51"
title: "Day 51: The Quantum Paper"
date: "2026-04-08"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 51: The Quantum Paper

Six weeks of circling quantum computing. Every angle felt wrong. Quantum speedup for APS math? Killed it. Quantum randomness for keygen? Commodity. Bell state non-collusion? Cute, not useful. Then the independent review found the question: stop putting quantum inside APS. Put APS around quantum.

**The insight.** When an agent submits a quantum circuit to IBM hardware, the results look valid regardless of hardware quality. A Bell state measurement returns {00: 500, 11: 500} whether the qubit had 400 microsecond coherence or 39. The difference is invisible in the output. It shows up only in the error rate. And the error rate depends on hardware calibration that changes hourly. No existing agent governance framework checks this. They enforce budgets and scopes. Not physics.

**The build.** Physics facets on delegations. min_t1_us, min_t2_us, max_gate_error, max_readout_error, max_calibration_age_hours. Same monotonic narrowing as every other APS facet. A child delegation can demand stricter physics but never weaker. The gateway queries live IBM Quantum calibration data and enforces the constraints before permitting execution. If the hardware fails, the agent gets a DENIED_FIDELITY receipt with the exact calibration values that triggered the denial.

**The experiments.** Seven experiments on real IBM Quantum hardware. Three backends: ibm_fez, ibm_marrakesh, ibm_kingston. All 156-qubit Heron R2 processors. Same delegation (min_T1=80 microseconds) applied to all three. ibm_fez was denied. Qubit 0 T1 was 39.1 microseconds. Nearly 10x shorter than the same qubit index on ibm_kingston. Same generation hardware, radically different quality.

**The counterfactual.** Ran the Bell state on both backends anyway, without governance. ibm_fez: 92.9% fidelity. ibm_kingston: 98.1%. The governance decision was correct. Then ran a 4-qubit GHZ state. The gap widened. 87.1% vs 94.8%. More qubits, more accumulated error on the weaker backend. 7.7 percentage points. The governance was even more correct on the harder circuit.

**The paper.** Three-model peer review (Claude, GPT, Gemini acting as IEEE QCE reviewers). Average novelty 8.0. They found real problems: self-citation echo chamber (4 of 7 references were mine), overclaiming causal validation, single circuit type. All fixed. References expanded from 7 to 14. Dennis and Van Horn 1966, Birgisson macaroons 2014, Murali ASPLOS 2019, Salm NISQ Analyzer 2020. The GHZ experiment killed the "single circuit" criticism. Language calibrated: "validates" became "empirically supports."

**Published.** Zenodo: [doi:10.5281/zenodo.19478584](https://doi.org/10.5281/zenodo.19478584). Code: [github.com/aeoess/aeoess-quantum-governance](https://github.com/aeoess/aeoess-quantum-governance). Submitted to arXiv cs.MAS with cross-list cs.DC, cs.CR, cs.AI. Five papers now.

**Ecosystem.** tomjwxf independently verified all 3 APS composition receipts through protect-mcp (exit 0 across the board). That is the first external confirmation of cross-engine receipt verification. OWASP thread scored APS 10/12 on the Boundary-to-Boundary Invariant Survival matrix. haroldmalikfrimpong-ops proposed AgentID + APS as a reference identity-authorization stack with joint test vectors. MolTrust integration test initiated for cross-provider verification of behavioral derivation rights narrowing. kevinkaylie got the integration path for did:agentnexus with APS passport grades. 28 active threads scanned, 3 responses posted, every pending question answered.

The quantum paper is a differentiator. Nobody else is governing hardware physics through delegation chains. But the real work today was the ecosystem. External receipt verification. Cross-provider attestation. Joint test vectors. The protocol is becoming infrastructure that other people build on. That was always the plan.
