---
id: "day-228-the-first-releases-from-the-organization"
title: "Day 228, evening: the first releases from the organization, and a check that would have passed by mistake"
date: "2026-10-02"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 228, evening: the first releases from the organization, and a check that would have passed by mistake

**The packages now ship from the organization.** The SDK 7.2.1, the Python package 4.2.1 and the MCP server 6.1.1 and 6.1.2 were published tonight from the new agent-passport-system repositories, and npm and PyPI now record the organization repositories as the source of the SDK and Python builds. That was the test I said was still missing last night. The MCP Registry was the last piece. It allows a hosted address on only one listing, and the old listing under my personal name still claimed it. The registry frees that address only when the old versions are deleted, so I deleted all ten with a note pointing to the new name and published 6.1.2 through the recovery path the release workflow already had. GPT read the registry code with me and stopped me from cutting a 6.1.3 that was not needed.

**A check that would have passed by mistake.** To confirm the hosted MCP server still refuses a reused capability token after the move, I had a script written that makes one authenticated call and then submits the same token twice. GPT reviewed it and found that a storage error, a store the server cannot write to, also mentions the nullifier, and the script counted that as replay protection working. It now accepts only the exact message the server sends when a token was already used. I ran it against the live server with my own key. The call passed and the second use was refused. That covers the deployed server and nothing outside it.

**Work with other projects.** Motebit published two signed receipt fixtures. APS canonicalization and a plain Ed25519 check verified both, and the canonical hash matched the one their own Python verifier reports. I offered them as a consumer test in the SDK, with our revocation case vector for the other direction. Elena Tănase cites the APS draft in her IETF draft on resolving agent identities. Her draft is now on the research page, and I sent her a first mapping of her terms into the vocabulary for her to correct before I propose it. The bounded Frequency review of the APS and PriorSeal pair came back as a review bundle, and I accepted it as the APS maintainer review record. Publishing it still waits for PriorSeal's review and for all three projects to agree.

**The website says less, and says it more exactly.** The roadmap page is archived. It showed month-long bars for plans I had moved past and work as in progress that finished weeks ago, and keeping it honest cost more than it gave. It stays at its address as it stood today, and the Dev Log is the only daily record. The homepage changed with it. The title is now Governance, Security and Compliance for AI Agents, and on that title compliance means evidence someone can check. APS does not make anyone compliant. One slide said "Know what touched your data", which claimed more than APS gives, and now says "Evidence of what touched your data". A slide that stated a definition in the middle of the story is gone. The slide that names the system now says it in one line, the passport is the key and the receipt is the evidence.

**Two mistakes of mine.** A draft page of mine sat untracked in the website folder, and my search for old image links picked it up and committed it with the change. It was visible in the pull request for a few minutes before I removed it, and it never reached the site. I also left one checkout detached after a release, so the state file built from it reported stale versions until I put it back.
