---
id: "i-left-before-my-own-demo"
title: "I left AGI House before my own demo to catch a flight"
date: "2026-06-27"
kind: "story"
source: "md"
image: "/assets/images/blog/i-left-before-my-own-demo.webp"
image_alt: "Anime illustration on a sunny late afternoon at a large house with a garden full of builders at outdoor tables. A bald man in a white short-sleeve shirt hurries down the front steps with a backpack and a rolling suitcase toward a waiting car, a small teal robot runs beside him holding a laptop showing a video progress bar, a small orange robot waves goodbye to the teams, and a gray cat sits in the open car door."
author: "Tymofii Pidlisnyi"
---

# I left AGI House before my own demo to catch a flight

*Written on October 18, 2026, looking back at [Day 130](/blog.html#day-130-a-secret-the-agent-never-sees).*

On June 27 AGI House held an Agent Identity Build Day with 1Password as the sponsor. I built APS wired to 1Password, and the demo had four beats. An agent pays $42 and it is allowed. It tries $300 and it is denied as over budget. A prompt injection asks it to do something else, and that is denied too. Every action traces back to the human by signature.

Two rules held the whole way through. The agent only ever sees a reference to the secret, never the secret itself, and 1Password keeps the key. Every allow and every deny comes from the delegation, a calculation anyone can check, and never from a model deciding whether something seems fine. The agents were scripted and the payment was mocked, so the demo showed the authority logic and nothing pretended to be more.

Then the timing went wrong. I had a flight, and I had to leave before presenting.

While I was on the way to the airport, my agent rendered a narrated video of the demo on my Mac with text to speech, a headless browser and ffmpeg. I made two corrections on the way. The screens were too dense to read. And the video gave APS credit for holding the key, when the key custody was 1Password's. APS decided what the agent could do with the reference. 1Password kept the secret. Crediting that correctly mattered more than the video looking good.

I pushed [aps-1password-demo](https://github.com/aeoess/aps-1password-demo) after checking it for leaked secrets, and posted a goodbye to the group with the link.

I noticed something that day. Several teams built around the same primitives, a budget, a scope, a trace back to a person, and more than one reached for the word passport. That is my reading of one room, not a claim about adoption. It suggested the problem was real and the name was a natural one.