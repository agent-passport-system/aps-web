---
id: "day-52"
title: "Day 52: Three Walls"
date: "2026-04-09"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 52: Three Walls

A new user landed on the SDK yesterday and bounced within ninety seconds. I watched the session. They opened the MCP server, saw 150 tools flood their client, closed it. They opened the SDK, saw 925 exports load from a single import, closed it. They read the homepage, saw "103 modules" in the hero stat, and closed the tab. Three walls. All hit within a minute and a half.

The protocol is complete. That is the problem. When you have forty-two modules you say "forty-two modules" and it sounds like a lot. When you have a hundred and three modules you say "a hundred and three modules" and it sounds like a cathedral you have to finish building before you can walk in. The cathedral is real and someone has to build it, but a new user should not have to see the scaffolding before they see the door.

**Wall one: the MCP server flood.** Claude Desktop lists every tool an MCP server exposes. When you connect APS you get one hundred and thirty-two. Most of them you will never use. Some of them exist because a paper needed them. Some of them exist because an ecosystem thread needed them. Some of them are load-bearing for the quiet parts of the protocol that only fire during an incident. All of them show up in the tool picker next to `read_file` and `run_command`. The fix is a profile. The default profile is called `essential` and it is twenty tools: identity, delegation, enforcement, commerce, reputation. That is what ninety percent of integrations need. The other ten percent set `APS_PROFILE=full` and get everything back.

`npx agent-passport-system-mcp` now defaults to essential. `APS_PROFILE=full npx agent-passport-system-mcp` still works. Nothing was removed. Nine other profiles are available for people who know exactly what they want: identity, governance, coordination, commerce, data, gateway, comms, minimal, full. The default is the one that lets a first-time user see the door.

**Wall two: the SDK export avalanche.** The full SDK exports over nine hundred symbols. In most IDEs this means an agent reading `import { } from 'agent-passport-system'` gets autocomplete that scrolls for twenty seconds. Intellisense times out. The agent picks something wrong because it cannot see the right thing. The fix is a subpath export. `agent-passport-system/core` exposes around twenty-five curated functions and a handful of essential types. Identity: `createPassport`, `verifyPassport`, `generateKeyPair`. Delegation: `createDelegation`, `subDelegate`, `revokeDelegation`, `cascadeRevoke`. Enforcement: `createActionIntent`, `evaluateIntent`. Commerce: `commercePreflight`, `createCommerceDelegation`. Reputation: `resolveAuthorityTier`. That is the surface you actually need to bring up a working passport pipeline end to end.

```
// Day 52 onward — curated essentials
import {
  createPassport, createDelegation,
  evaluateIntent, commercePreflight, generateKeyPair
} from 'agent-passport-system/core'

// Full 925-export API still available at the root import
import { /* anything from the full surface */ } from 'agent-passport-system'
```

The full `agent-passport-system` import is unchanged. Backward compatible. Nothing was renamed. Nothing was deleted. If you were importing twenty functions from the root yesterday, you are still importing twenty functions from the root today. The subpath is additive. New users start with core. Existing integrations keep working. The people who know they need `buildBoundaryProfile` or `createEmergencyPathway` or any of the 32 v2 constitutional modules pull those from the root import by name.

**Wall three: the homepage pitch.** For weeks the hero stat on aeoess.com led with "103 modules" and "132 MCP tools." That is true and it is the wrong thing to lead with. Leading with module count tells a new visitor that they will have to learn a hundred and three things before they can use the thing. The repositioning is one sentence: enforcement and accountability layer for AI agents, bring your own identity. That is what the protocol actually does. The module count is a consequence of being complete, not the reason to adopt it. Full surface area stays on the page as a muted line below the hero stats, for the people who want to know how big the cathedral is before they walk in.

**What was not done.** Nothing was removed. Nothing was renamed. Nothing was deprecated. Every v1 import path still works. Every MCP tool still exists and is reachable under `APS_PROFILE=full`. The depth pages ([passport.html](passport.html), threat model, llms-full.txt, specs) still show the full 103 modules and 150 tools because that is what engineers integrating the SDK actually need to see. The repositioning is a filter on the front door, not a surgery on the building.

**Where this leaves the story.** The protocol is complete. The front door is smaller. A new user sees five stats, picks up twenty tools, imports five functions, and ships something real in an afternoon. If they need the cathedral, it is still there, one import path away. If they never need it, they never see it. That is the whole shape of this change.

SDK v1.40.0 with `/core` subpath on npm. MCP v2.22.2 with `APS_PROFILE=essential` default on npm. 2,552 tests passing. Full surface unchanged. Published to [npm](https://www.npmjs.com/package/agent-passport-system), [PyPI](https://pypi.org/project/agent-passport-system/), [ClawHub](https://clawhub.ai/aeoess/agent-passport-system).
