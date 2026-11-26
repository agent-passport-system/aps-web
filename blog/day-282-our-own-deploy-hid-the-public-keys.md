---
id: "day-282-our-own-deploy-hid-the-public-keys"
title: "Day 282: a change to our own deploy hid every .well-known file, and someone else noticed first"
date: "2026-11-25"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-282-our-own-deploy-hid-the-public-keys.webp"
image_alt: "Anime illustration of a seaside lighthouse gallery at dusk in autumn, the lamp freshly lit and a warm beam crossing the evening sky over the sea. A bald man in a white short-sleeve shirt holds up a small brass key toward the light. A small orange robot on a step stool polishes the lens, a small teal robot reaches toward a wooden rack where seven brass keys hang, a gray cat sleeps on a coiled rope, and a ginger cat in black sunglasses sits on the railing holding a smiling yellow star. A fishing boat heads back to a harbor town below."
author: "Tymofii Pidlisnyi"
---
# Day 282: a change to our own deploy hid every .well-known file, and someone else noticed first

On Day 282 a maintainer we run tests with told me our witness key had been returning 404 for hours. He had checked it before his own run, which is exactly what that file is for.

The cause was ours. On Day 280 I updated the action that uploads this site to GitHub Pages. The new version leaves out hidden files by default, and every file under `.well-known/` counts as hidden. So all seven of them disappeared from the live site at once: the witness key, `security.txt`, the MCP and agent descriptors, and the issuer file. The deploy itself was green the whole time, because nothing checked what it had published.

The fix was one setting to include hidden files again. The first deploy after it failed with "Found 0 artifacts" and passed on a rerun. Then I compared every file on the live site with the one in the repository. All seven came back byte for byte, and the witness key is the same key as before, so nothing had to be rotated or re-announced. A second change makes the deploy fail if an unexpected hidden file appears or a required one is missing, and checks the live files after each deploy.

**The rest of the day was other people's records.**

The boundary map in the vocabulary had been waiting on owners to confirm their own rows since October. Most had, and a few had not. So I split it. The rows each owner confirmed stay word for word as they confirmed them, and the rest move to a follow-up. One row had to get narrower first, because one of its runs belonged to a project whose owner never confirmed the description.

In the evidence lab, Val Rukhaylo proposed a case for a question that became concrete this week: what shows that an agent's access was really revoked. He kept three claims apart. Someone signed the revocation. The access layer refused the agent afterwards. Nothing the agent did shows up after that time. I offered our existing revocation records for the first claim, with one negative case worth having. A revocation signed by someone with no authority over the delegation has a valid signature and should still count for nothing. Our signed time also does not prove when the signature was made, which limits what it can say about backdating.

I also reran our gate against a benchmark another maintainer published. The gate and the version without it scored the same on every row of the quick tier. That run cannot show what the gate adds yet, and I wrote that down instead of a better sounding summary.
