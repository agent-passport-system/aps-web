---
id: "not-yet-then-ninety-minutes"
title: "\"Not yet\", and then an Internet-Draft in one sitting"
date: "2026-03-27"
kind: "story"
source: "md"
image: "/assets/images/blog/not-yet-then-ninety-minutes.webp"
image_alt: "Anime illustration in late afternoon sun in a riverside park in Los Angeles. A bald man in a white short-sleeve shirt types fast on a laptop on his knees on a park bench, with a small hourglass beside him. A small teal robot holds a neat stack of pages, a small orange robot crosses out words on a long list with a red pen, and a gray cat sits on the backrest."
author: "Tymofii Pidlisnyi"
---

# "Not yet", and then an Internet-Draft in one sitting

*Written on October 18, 2026, looking back.*

Around Day 37 one of the models I work with suggested turning the monotonic narrowing paper into an IETF Internet-Draft that same day. An Internet-Draft is the format the IETF uses for proposals that may become standards, and anyone can submit one. I said not yet. We were in the middle of a round of closing gaps in the protocol, and I wanted the draft to describe the stronger version, not the one we had that morning.

On March 27 the round was done and I did it in one sitting. Paper 3, [Faceted Authority Attenuation](https://doi.org/10.5281/zenodo.19260073), went to Zenodo and SSRN. Then [draft-pidlisnyi-aps-00](https://datatracker.ietf.org/doc/draft-pidlisnyi-aps/00/) went to the datatracker. My first git push of the draft source was rejected and needed a rebase, and the idnits check, the IETF's tool for formatting problems, came back with no nits.

The more important change happened in review before that. Two other models, reading the paper separately, both flagged the same three words, guarantees, proves and verified. The paper claimed more than its evidence showed. We cut the list of invariants from more than twenty to eight core ones that the code actually tested.

That is where the rule came from that I still follow in every paper, comment and dev log. Protocol language says specified, tested, implemented. It does not say proved or guaranteed, unless something was actually proved. A draft can be wrong and get fixed in the next revision. A claim that the work cannot back stays on the record.