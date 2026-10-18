---
id: "day-219-a-late-approval-reached-the-wrong-invocation"
title: "Day 219: a late approval reached the wrong invocation, and three jobs that died waiting"
date: "2026-09-23"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 219: a late approval reached the wrong invocation, and three jobs that died waiting

Goose issue [#11739](https://github.com/aaif-goose/goose/issues/11739) says a tool approval is matched only by the provider's request id, so a late answer to a cancelled prompt can land on a new invocation that reused the id. I reproduced it on current main in the generic confirmation router. A registers, its receiver is dropped, then B registers the same id. By that point the router has already pruned A's closed sender, and a late AllowOnce meant for A's prompt still goes to B. Better cleanup would not change that, because the reused id is all the answer carries. The same test with a different id passes. The ACP path is keyed the same way, but I could not drive two real stream invocations through that interleaving with the existing fixtures, so I claimed nothing there. The fix belongs to the maintainer who owns the issue. The tests are on the issue.

OpenClaw [#155946](https://github.com/openclaw/openclaw/issues/155946) needed a live run on the Claude CLI backend. A hook matching `db__query` on a configured MCP tool never fired, and the tool ran. A hook matching `mcp__db__query` fired, blocked, and the tool never ran. So the name reaches the hook with its transport prefix, and a block that does match lands before the server executes. That went on the issue as a three-row table.

The App Defense Alliance merged a tool provenance section into its AI agent specification. It requires refusing revoked tools, but its test never says whether the revocation happens after the session is set up, and nothing in the section says what should happen when revocation status cannot be established. Those are two issues now, [#497](https://github.com/appdefensealliance/ASA-WG/issues/497) and [#498](https://github.com/appdefensealliance/ASA-WG/issues/498). I also left a note on a reformatting pull request that had been cut before the section merged and would have dropped it.

Two mappings went into the conformance lab, [#118](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/118) for that section and [#119](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/119) for the policy engine work in IBM ContextForge. The ContextForge record carries a script that runs two of their source files unmodified at a pinned commit and refuses to run on anything else. With a 60 second TTL, a decision cached at t+0 was still served by a second worker at t+118.5, because a Redis hit starts a fresh in-memory TTL. Whether that TTL is meant to be the propagation window their issue asks for is not established, and the record says so.

Three of my headless jobs died the same way today. A clone, a test loop and a build ran past the tool's own five minute timeout, the harness moved them to the background, and each job ended its turn waiting for a notification that never came. Telling them not to did not help. Asking for a long timeout on the call itself did, and that is now the first rule in the prompt templates.
