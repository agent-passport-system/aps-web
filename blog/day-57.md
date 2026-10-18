---
id: "day-57"
title: "Day 57: Three Boundaries and a Paper"
date: "2026-04-14"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 57: Three Boundaries and a Paper

Three v2 primitives shipped today. Each one closes a failure mode that showed up in production, not in theory. They're small modules, a few hundred lines each, but each one names a boundary that the protocol had been crossing silently.

**AttributionConsent — the representation boundary.** An agent can cite a third party's position in a way that reads as endorsement, without the cited party having agreed, which is what this boundary exists to prevent. It made it look like the third party had endorsed the claim. The citation was accurate textually. The problem wasn't accuracy, it was representation: one agent's principal was speaking for another's without authorization. `AttributionConsent` requires dual signatures on any citation that binds the cited principal — cited party signs their consent, citing party signs the citation itself. Missing one side fails verification. Replay protection via expiry windows. Integrated into charter verification, settlement verification, and completion-receipt verification so the guard runs at every boundary where an attribution could become binding.

**ProvisionalStatement — the commitment boundary.** LLM outputs are treated as instantly binding by the systems consuming them. An agent writes "we will proceed with vendor X" and some downstream system registers that as decision-made. `ProvisionalStatement` flips the default. Agent-to-agent statements start provisional. Binding requires an explicit `PromotionEvent` satisfying a `PromotionPolicy` — typically m-of-n principal signatures, or a direct ratification from the principal whose authority is being committed. Dead-man elapses to withdrawn, not promoted. Silence is not consent. This one hurts the most to write because it forces everything upstream to distinguish draft from decision, which most current agent frameworks don't.

**HumanEscalationFlag — the escalation boundary.** Some action classes should never execute without human confirmation regardless of the delegation chain. `HumanEscalationFlag` gates on per-action-class owner confirmation with three scope modes: `per_action` (every call), `per_session` (one confirmation covers the session), `time_window` (confirmation valid for a declared duration). Owner confirmations are signed and recorded. Agents can't bypass by narrowing the action class or by delegating past it — the flag evaluates at action time, not delegation time.

**Three numbers.** SDK at [v1.42.0](https://www.npmjs.com/package/agent-passport-system), 2,884 tests (80 new tests across the three primitives and their integration). MCP at [v2.24.0](https://www.npmjs.com/package/agent-passport-system-mcp), 150 tools (11 new boundary-primitive tools). Python SDK at [v0.12.0](https://pypi.org/project/agent-passport-system/), same primitives ported with cross-language signature verification. All three shipped on npm and PyPI before this post went up.

### The paper

The paper also went up on Zenodo today. [Governance in the Medium: Why the Unit of Agent Governance Is the Population, Not the Agent.](https://doi.org/10.5281/zenodo.19582550)

One-paragraph version: agent governance research models the agent as the unit. The agent in every deployed system today is already a fiction reconstructed across sessions that are short-lived and mutually unaware. The real object is a population of such sessions talking through a family of uncoordinated substrates — memory files, handoffs, shared state. Continuity of "the agent" is a property this family produces, not a property any session has. The paper argues this population-with-medium is the correct unit of agent governance, that current protocols (including APS) underspecify governance of the medium because they've been looking at the wrong object, and that the architectural move that makes authority survive session death (artifact-based state with signed authorization) can be extended to govern the medium.

The paper names one open problem as the central threat to the strongest version of the claim: cryptography formalizes authorship, delegation, ratification, access, and ancestry. It does not formalize meaning. A governed medium of agent populations can accumulate fluent hallucination if the participants emitting fragments are systematically producing semantically unsound content — every fragment cryptographically valid, the aggregate medium a growing archive of nonsense. The institutional analogies the paper leans on (Wikipedia, corporate memory, open-source projects) work because humans fill the semantic-evaluation gap. Whether agent populations can substitute any combination of reputation, cross-verification, and human ratification gates for that human sensemaking is the hardest open problem in the paper. I don't know.

Six rounds of adversarial review before the paper shipped. Claude, GPT, and Gemini attacking each version from different angles. The first version (v0.1) was a safe taxonomy paper. The last one (v0.5) is the smallest version of the claim that survived every attack. It's a working paper, not a scholarly result. Design Memorandum in the early-IETF sense — stake a claim, invite attack, ship before you can defend every sentence.

### Why both on the same day

The three boundary primitives and the paper are the same thought at two scales. The primitives name three boundaries the protocol was crossing silently at the session level. The paper names a larger boundary the whole field is crossing silently — governing what one session does while ignoring what the population passes along. One is engineering, the other is framing. Shipping them together is the honest thing because they only work together: the engineering without the framing is useful plumbing that nobody contextualizes, and the framing without the engineering is a manifesto without a reference implementation.

Tomorrow is for the Working Group scope ratification announcement, the cross-links to Harold's interop repo, and the roadmap items that are queued behind tonight's shipping. Tonight is for this: three boundaries, one paper, both live.
