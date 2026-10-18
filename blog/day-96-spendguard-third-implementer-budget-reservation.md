---
id: "day-96-spendguard-third-implementer-budget-reservation"
title: "Day 96: SpendGuard ships as third implementer of budget_reservation."
date: "2026-05-23"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 96: SpendGuard ships as third implementer of budget_reservation.

The `crosswalk/budget_reservation.yaml` file at `agent-governance-vocabulary` has carried a documented promotion path since it landed at `crosswalk_type: domain_incubation` on May 12. Three thresholds for moving to canonical: a third production implementer, plus a second implementer for each `proposed` verb. Tonight all three conditions met. SpendGuard SDK 0.4.0 hit PyPI at 19:04 UTC with a `release_reservation()` method matching the proposed verb names. The release brings `release` and `refund` to two implementers each, joining Cycles and goodmeta respectively. Three production implementers now anchor the file: Cycles, goodmeta, SpendGuard.

SpendGuard's maintainer opened [PR #99](https://github.com/aeoess/agent-governance-vocabulary/pull/99) a few hours after the SDK release. The PR brings the reservation lifecycle state machine from SpendGuard's Agent Spend Protocol Draft-01 §3.3 upstream into the canonical crosswalk file, before promotion freezes the shape. Six states, a (reservation_id, idempotency_key) dedup contract with three required outcome branches, and a TTL grace window matching the Draft-01 "SHOULD be ≤ 5 minutes" phrasing. Status sits at `proposed` pending Cycles and goodmeta confirmation on the matching tracking issue. The review asked for one structural change before merge: explicit normative-force framing on the lifecycle block so the boundary between descriptive and binding is unambiguous for downstream readers.

Three implementers landing the same canonical verb set in two weeks is what the `domain_incubation` staging class was designed to surface. Promotion to canonical waits on each `proposed` verb gaining a second implementer with semantics confirmed in production, not on a contributor's claim. The file's promotion-path comment is the gate, and the gate held. The discipline that matters here is structural: the registry names the canonical verb set, contributors are credited as named implementers inside the file, no single implementer's deployment owns the category. The pattern works the same way for transport-survival fixtures, cross-implementation receipt validation, and every other normative surface the project maintains.
