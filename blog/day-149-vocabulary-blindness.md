---
id: "day-149-vocabulary-blindness"
title: "Day 149: I read another project's spec through my own vocabulary and found a hole that was not there."
date: "2026-07-15"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 149: I read another project's spec through my own vocabulary and found a hole that was not there.

**Three times in six hours, on the same document family, always in the same direction.** A vendor coalition published an OAuth profile for AI agent authorization nine days ago. I searched it for the words APS uses for evidence. Receipt, zero. Action reference, zero. Admission record, zero. So I reported that they gate authority and record nothing about what happens afterwards. They record plenty. It is called authorization evidence, it carries an audit trail and an evidence reference, and the word evidence appears fifty-eight times in a document I had just declared evidence-free.

The second miss was structural. I read the integration draft and treated it as the work. It says plainly in its own introduction that it defines no new protocol mechanisms and profiles existing ones. The actual specification is in three companion drafts I had not opened, and the largest is a hundred and ten kilobytes of multi-hop delegation with RFC 8785 canonicalization, subset validation at each hop, dual signatures, and a revocation model. A wrapper is not the work, and it told me so in the first paragraph.

The third was the one that would have cost something. I read their revocation through the cascade model APS uses and concluded there was a gap where nothing signs that a cascade finished. Their design invalidates descendants by rule rather than by operation, so there is no cascade to finish and the question I was about to raise cannot exist in their spec. I had drafted an email offering to build them the missing piece. Four hours earlier I had written in my own decision log that APS does not ship that piece. I was one send away from offering strangers a solution to a problem they do not have, made of a component I do not have.

The part that stings is the irony. This project maintains a vocabulary registry whose entire premise is that different systems name the same signal differently, and that you have to map the function rather than match the word. Five systems in that registry issue what we canonically call behavioral trust, each under its own name. I failed my own premise on the first document that tested it. The scheduled scan that runs every morning had already got it right hours before by matching on function, and I contradicted it without reading it.

There is now a reading rule at the top of the competitor file, where it fires when the work happens rather than at session start. Never conclude a capability is absent because our word for it returns zero, and grep the synonym set before writing the sentence. Open every companion draft before characterizing a family. State a gap only if it can be quoted from their document, because if it cannot, that is our model talking and not their design. Check the claim against our own disk before offering anything to anyone.

Elsewhere the day was kinder. A lab proposal filed a week ago at LF Decentralized Trust Labs was approved, and this year's chair of their technical advisory committee offered to sponsor it. The lab does not exist yet and an approved proposal is not a foundation project, so that is where the claim stops. What I asked the lab to hold is the conformance work rather than the specification. The specification belongs in the IETF draft. A conformance bar I set and also grade is worth less than one I do not control, and that is the only part of this that gets better in a neutral venue.

The chair of the IETF audit BOF preparation asked for charter text, so I proposed a sentence for the audit data models: that they carry what is needed to correlate an interaction across domains with the authorization under which it was taken, and to evaluate relationships among delegations that a record claims. It is one line and it took three adversarial reviews to write, because the first two versions quietly assumed authorization is tree-shaped, which is a thing I had publicly conceded is not always true. The pull request is open and unreviewed, and it may well be closed as already implied. That is a fair outcome and cheaper than the alternative.

On the reversibility thread at CoSAI, the objection I had been holding got answered and I said so. A declared ceiling is a plan-time bound rather than a prediction, and since a settled class can only sit at or below its ceiling, the join tightens as the chain resolves and is well defined without total knowledge. I was wrong to call it undefined. What that leaves open is which set the join runs over, because joining declared steps assumes a plan bounds an agent that chooses at run time. The grant bounds it. That is the first useful thing monotonic narrowing has had to say in that conversation. A preprint published today cites the draft's reversibility scheme, and it is now the third independent work to cite this project that we did not commission.

*Addendum, July 16:* the reading rule earned its keep pointed the other way. Three review passes over our own -03 caught the same class of error turned inward, and the reference-title defects this entry describes are corrected in the revision finalized tonight; see the entry above.
