---
id: "a-saturday-upload"
title: "A Saturday upload, after a week of checks that had been reporting nothing"
date: "2026-07-18"
kind: "story"
source: "md"
image: "/assets/images/blog/a-saturday-upload.webp"
image_alt: "Anime illustration on a sunny Saturday afternoon in a Los Angeles park with a clock tower. A bald man in a white short-sleeve shirt sits cross-legged on the grass pressing one key on a laptop while the clock hands point exactly to the hour, a small teal robot holds a magnifying glass over a checklist, a small orange robot holds a stopwatch, and a gray cat lies in the sun."
author: "Tymofii Pidlisnyi"
---

# A Saturday upload, after a week of checks that had been reporting nothing

*Written on October 18, 2026, looking back at [Day 152](/blog.html#day-152-submission-day-three-failed-claims).*

draft-pidlisnyi-aps-03 went to the IETF datatracker on Saturday July 18, minutes after the submission window reopened, around 3 PM in Los Angeles. It was accepted at 22:05 UTC. The dev log for that day says three of my claims failed verification before the upload. The week before was worse, and the dev log doesn't say how.

First, an agent told me from memory that no submission blackout applied. Both our own records and the datatracker said otherwise. A check that runs on memory is not a check.

Second, the idnits runs, the IETF formatting check, had looked clean for several sessions. They had been wrapped in `timeout`, a command that does not exist on macOS. Every run exited with code 127, command not found, and reported nothing, and nothing in the setup treated "nothing" as a failure. The first real run, on July 15, returned zero errors. The result was the same, but for days we had believed a check that had never run.

Third, two reference titles had been guessed and not looked up. One was wrong in the published -02, and a DOI had been wrong in both -01 and -02. Both were fixed in -03.

On the day itself, the XML was edited after it had been validated, so we rendered it again and checked it again before the upload, instead of trusting the earlier run.

Since then my rule is that a claim never run against what it describes is a draft. A green check that never executed is worse than a red one, because nobody goes back to look at it.