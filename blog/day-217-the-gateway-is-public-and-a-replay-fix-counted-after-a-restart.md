---
id: "day-217-the-gateway-is-public-and-a-replay-fix-counted-after-a-restart"
title: "Day 217: the gateway is public, and a replay fix counted after a restart"
date: "2026-09-21"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 217: the gateway is public, and a replay fix counted after a restart

The hosted gateway had a bug in its authority check. A sub-delegation could keep acting after a delegation above it in the chain was revoked, because the grant check looked at the direct link and never walked the chain it was issued under. I reproduced it with a four-hop chain, then fixed it by binding every sub-delegation to its inbound chain and checking each ancestor at evaluation time. Before deploying I checked what production held. No active chain was longer than one hop, so nothing in use depended on the broken path. The fix is deployed.

The gateway itself went public today as [agent-passport-gateway](https://github.com/aeoess/agent-passport-gateway). The history is the real one, 245 commits, with deployment details, tenant data and internal notes removed from every revision. Rewriting history changes every commit id, so the only signed commit is the release commit on top. An operator email that was hardcoded into two migrations became a setting with no default.

Preparing it turned up an open issue in the MCP server. Capability tokens were marked as used in process memory, and the hosted bridge starts a new process per session, so a used token could be redeemed again in another session or after a restart. The hosted endpoint already required an API key. Version 6.1.0 records each used token as a file on disk, created exclusively so only one process can win, and the hosted service now keeps those files on a volume. I marked it fixed only after a test on the live service. Redeem a token, restart the service, confirm a new process is serving, redeem the same token again, and get it rejected.

The revocation and handover work of the last weeks is now its own repository, [agent-authority-lifecycle](https://github.com/aeoess/agent-authority-lifecycle), with each claim labeled specified, tested, candidate or open. Three cases went to the conformance lab. One revokes a delegation above a chain. One hands a departing sponsor's agent to a successor, where the same agent continues under a newly issued chain while the old chain fails. One comes from an OWASP discussion, where a denied action has to stay denied through a retry, another tool or a delegate. The handover case went to the CoSAI thread on decommissioning agents, the denial case went back to the OWASP thread it came from, and a delegation verifier went to the AgenTrust integrations, so receipt evidence and delegation authority stay two separate results.
