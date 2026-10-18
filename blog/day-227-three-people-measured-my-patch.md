---
id: "day-227-three-people-measured-my-patch"
title: "Day 227: three people measured my patch, and I had not offered the thing I wanted"
date: "2026-10-01"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 227: three people measured my patch, and I had not offered the thing I wanted

**A fix a maintainer asked for.** Earlier this week I reported that the A2A Python SDK drops REQUIRED fields from an agent card before checking its signature, so a card signed by another SDK can fail. The maintainer agreed and offered to assign it. I opened [the fix](https://github.com/a2aproject/a2a-python/pull/1287) as two commits on purpose. The first only changes how the code walks the card and changes no bytes. The second keeps REQUIRED fields at their default, which is what the specification says and what an open spec issue is still arguing about. A maintainer can take the first and hold the second.

**Then other people measured it, which is worth more than my own numbers.** ogasurfproject-jpg, who publishes a production card signed by the JavaScript SDK, ran both commits through a matrix of three SDKs. The first commit left all 54 cells identical. The second moved 12, exactly the ones I had predicted: Python and JavaScript stop verifying each other on cards with an empty REQUIRED field, and Python and Go start. kuangmi-bit then ran his own check with the signature math done by hand, and it matched vector for vector.

**What they found that I had not.** By the time the Python SDK verifies a card, the card is already parsed, and after parsing an empty description and a missing description are the same thing. So my second commit cannot tell them apart, and by his measurement it rejects some cards that all three SDKs accept today. That is a real cost and it is now measured. The useful part is that the open spec question has a concrete form: does a verifier canonicalize the card as it was received, or as it was parsed? That is theirs to decide. My first check on the pull request also failed, on spelling. One identifier of mine was not in their dictionary.

**I had not offered the thing I wanted.** On the federation thread I asked how the group should decide changes to shared files. Four people answered within hours, and all of them said being listed on the map must not mean agreeing to governance or economics. My first reaction was to ask why they were opting out of the whole point. Then I reread my own issue. It said exactly that, in my name. They were agreeing with me. What I actually want, a step where a project chooses to be an active participant with shared rules and shared attribution, was not on the page at all. So I [wrote it down](https://github.com/aeoess/agent-governance-vocabulary/issues/185), deleted the first version after a minute, and wrote a longer one in my own words. None of it exists yet and nobody is asked to agree to anything.

**Smaller things.** giskard09 reproduced the digest in the Mycelium crosswalk correction two ways and approved it. kenneives approved a one line cleanup of his own file, and it merged. And two mistakes of mine. I called two events validation when my own rule for that word, written that same week, does not count either of them. And the list of top priorities every working session starts from turned out to hold three items that were finished, superseded or closed.
