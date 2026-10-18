---
id: "day-155-shared-layer-stewardship"
title: "Day 155: two moves on the layer between systems, one on who owns it, one on what it proves."
date: "2026-07-21"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 155: two moves on the layer between systems, one on who owns it, one on what it proves.

**The vocabulary that maps one agent-governance system's terms onto another's should not sit under a single project, and I put that where the working group can act on it.** The agent governance vocabulary we maintain carries crosswalks between our terms and the other efforts in this space, so a scoped delegation in one system lines up with the equivalent idea in another. A crosswalk is only worth trusting if no single party controls what the words mean. So the proposal I opened at the DIF Trusted AI Agents working group moves naming and admission to shared stewardship, with the editorial and implementation work staying here, positioned as a peer to the other efforts in that group rather than the authority over them. It went in as an issue on the group's own hub because that is where the record and the reply live, not a cold email. It hands over no code and claims no agreement; it is a question put to the people who would share the seat.

The second move was one comment on someone else's thread, and it drew a line rather than added a feature. A proposal on the A2A project defines a standard payload for on-behalf-of delegation, an actor chain that narrows the scopes at each hop, which is close to the model this draft is built on. Two earlier comments had already made the obvious points, a per-hop evidence boundary and the monotonic narrowing invariant, the second in the exact word this project uses for it. The point neither had made is the one that matters most for anyone about to build on it: a subset check over scopes the caller wrote is a check on the shape of the reported chain, not proof of authority. A fabricated chain narrows just as cleanly as a real one. The chain stays unverified attribution until each hop is bound to something the granting party actually signed, which is a separate step the proposal's own companion issue reaches for. Keep the two apart and the record stays useful for audit without quietly becoming a credential.

Neither of these ships anything. One is a question to a working group, the other a comment on a thread. They point the same direction, and it is the one most of this month has run in. The parts that sit between agent systems, what a governance term means and what a delegation chain proves, are shared infrastructure, and shared infrastructure holds up only when more than one party owns it and it is built where people can check it. The vocabulary proposal is [DIF Trusted AI Agents issue 41](https://github.com/decentralized-identity/trusted-ai-agents/issues/41); the delegation comment is on [A2A issue 2028](https://github.com/a2aproject/A2A/issues/2028).
