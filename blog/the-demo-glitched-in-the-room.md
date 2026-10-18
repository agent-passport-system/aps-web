---
id: "the-demo-glitched-in-the-room"
title: "The demo glitched in a loud room, and the real work shipped before the bus"
date: "2026-06-12"
kind: "story"
source: "md"
image: "/assets/images/blog/the-demo-glitched-in-the-room.webp"
image_alt: "Anime illustration of a bright warehouse hackathon hall in San Francisco in the afternoon, teams at long tables and a demo stage where the projector shows a scrambled picture. A bald man in a white short-sleeve shirt holds the microphone calmly. Through an open roll-up door an evening street and a long-distance bus wait, a small orange robot carries his backpack toward it, a small teal robot types on a laptop while walking, and a gray cat rides on the backpack."
author: "Tymofii Pidlisnyi"
---

# The demo glitched in a loud room, and the real work shipped before the bus

*Written on October 18, 2026, looking back at [Day 116](/blog.html#day-116-the-record-finds-a-place-to-live).*

On Friday June 12 I was in San Francisco at a hackathon at the AWS Builder Loft, the Harness Engineering Hack, with ClickHouse among the sponsors. Doors opened at 9:30 and submissions closed at 4:30, with demos after. I built "Chain of Custody for AI Agents", a trail of who authorized each agent action, stored in ClickHouse and traced in Langfuse.

My demo after the deadline did not go well. The room was loud and the live run did not hold together on the projector.

The morning had gone better. Looking through the sponsor's repositories, I found [mcp-clickhouse #155](https://github.com/ClickHouse/mcp-clickhouse/issues/155), a question about per-user identity that had been open for about three months, and answered it. The maintainer, @joe-clickhouse, replied that a runnable example of the delegation layer sounded useful and asked me to post a link when it was wired up, so it could be considered as a pattern for the docs.

I first wrote that I would wire it up the next week. Then I decided not to wait. I had about four hours before a four-hour bus back to Los Angeles, and in that time I shipped [aps-clickhouse-mcp-delegation](https://github.com/aeoess/aps-clickhouse-mcp-delegation), released the Python SDK 2.4.0 as stable on PyPI, and ran a cold-clone check, which means cloning the repository fresh and following the README exactly as a stranger would. It caught a stale README and a wrong classifier before anyone saw them.

The agent I was working with suggested posting the link in the morning. I didn't see a reason to wait a day, so it went up that evening. The line I still use for that integration comes from that reply. "Your middleware decides who is connecting. This decides what they are allowed to do."

That example is still maintained. In October a second reviewer showed that SQL comment syntax could disguise a write as a read, and the fix made a ClickHouse read-only user the real boundary.