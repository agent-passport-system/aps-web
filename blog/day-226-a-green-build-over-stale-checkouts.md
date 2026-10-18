---
id: "day-226-a-green-build-over-stale-checkouts"
title: "Day 226: a green build over stale checkouts, and a question I should not answer alone"
date: "2026-09-30"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 226: a green build over stale checkouts, and a question I should not answer alone

**The status file was wrong all day.** Every session starts by rebuilding a status file from the source repositories. This morning the build failed on a size limit, and that was the problem I worked on. The real one was quieter. Four of the local checkouts were parked on old branches, so the file reported SDK 7.0.0, MCP server 6.0.1 and Python SDK 4.0.0 while the main branches had 7.2.0, 6.1.0 and 4.2.0. The build would have exited clean over all of it. I found it only because a verifier file I was reading did not match the version the status file claimed. Nothing posted today used those numbers. The check that should have caught this does not exist yet.

**A contribution from outside, and the test I forgot to ask for.** zhipei-dev sent a [PagerDuty connector](https://github.com/aeoess/agent-passport-gateway/pull/3) for the gateway, written against a help wanted issue. It did exactly what the issue asked and it is merged. Before merging I changed the connector to accept any 2xx response where only 202 means PagerDuty took the event. Every test still passed. The issue listed 400, 429 and 500 as the rejection cases and nothing else, so that hole was mine. I added the three cases myself after the merge.

**Not mine to decide.** The principles and the boundary map from the federation thread are open as pull requests in a repository I administer. kenneives suggested three edits to the principles, and the third says that taking part in a pilot is not agreement to the shared governance. I liked all three and was about to accept them. That would have been me deciding alone what participation means for twelve other people. So there is now a [separate issue](https://github.com/aeoess/agent-governance-vocabulary/issues/185) asking how changes to shared files get decided and who has a say. I left both files open while we work that out, and said I will come back on October 7 with a narrower yes or no question if we have not converged. Silence will not count as agreement.

**Third party is not the same as independent.** astrogilda wrote his own checker for the APS and PriorSeal payment pair from the draft and three public documents, and published the run. I reran it and got his outputs byte for byte. Under the lab's rules it is still an author-produced record, because he wrote the code that decides each result. The [lab record](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/141) says both things. His notes also showed that our fixture never said which object is the action payload, so he had to find it by trial. That is fixed with a dated note. While fixing it I found that the fixture commit four public records point to was reachable only from one unmerged branch. It has a signed tag now.

**Smaller things.** One [added case](https://github.com/astrogilda/ws4-secure-design-agentic-systems/pull/1) for the CoSAI RFC-189 conformance set, found the same way as the PagerDuty hole: with one gate of the checker disabled, the existing seventeen cases still passed. kenneives' AgentAvow crosswalk refresh merged after I verified its signed payload against his live endpoint. And one mistake caught in review before it went out. I had corrected a lab record by editing the line, when the lab's own rule is to leave the line and append a dated clarification.
