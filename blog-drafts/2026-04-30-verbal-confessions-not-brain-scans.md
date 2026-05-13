# Verbal confessions, not brain scans

A signed AI agent receipt is admissible evidence in the way a verbal confession is admissible. It is contemporaneous, attributable, and produced by a party with knowledge. It is not a recording of cognition. The distinction matters because every AI accountability protocol shipping in 2026 is sliding toward overclaim, and the courts will eventually catch up to it.

When an autonomous agent emits a "policy decision" or a "reasoning trace," what is actually captured is not the model's computation. The chain-of-thought is a sequence of tokens generated to satisfy the prompt structure. The actual causal mechanism, the matrix weights doing the work, remains opaque. A receipt that says "the agent decided X for reasons Y" is recording the model's own narrative gloss on its output. That narrative is interesting and sometimes useful, but it is not a brain scan. It is a verbal confession.

Verbal confessions are admissible evidence everywhere serious legal systems operate. They carry weight. They are contestable. Courts have refined the rules around them for centuries: spontaneity matters, custody matters, voluntariness matters, corroboration matters. None of that requires the confession to be a true record of mental state. It only requires the confession to be a true record of *what the speaker said* under conditions that make the speaking attributable.

This is the right epistemic ground for AI agent receipts.

Most current accountability frameworks try to overshoot. They reach for "intent" and "mens rea" and "the model's reasoning." That ground is not defensible. An LLM does not have intent in the legal sense. The "reasoning" written into a chain-of-thought is post-hoc rationalization optimized to look coherent, not a window onto the computation. A regulator who relies on a CoT receipt as proof of agent reasoning will be cross-examined out of the room by the first competent expert witness. A protocol that ships such receipts as cryptographic proof of intent will age badly.

The honest version is narrower and stronger. The receipt records:

- What the system exposed to the agent at decision time
- What the agent emitted as output
- Under what authority chain
- Captured by whom, sealed how, transferred to whom

None of those fields claim to know what the model "thought." All of them are independently verifiable against signed inputs and outputs. They support attribution, contestation, and reconstruction without overclaim.

This is the frame APS is building toward, and it has consequences for how the protocol surface looks. Every accountability receipt in the next release of APS carries an explicit `scope_of_claim` field. The field names what the receipt asserts and what it does not. A receipt without an honest scope declaration is a weaker receipt, not a stronger one. Hiding limits doesn't make evidence more useful in court. It makes it easier to impeach.

The "drive on red, get a ticket" model rests on this discipline. Cars run red lights. Cameras catch them. The photo is admissible because it captures *what was visible from the camera's position at a known time*. The photo does not claim to know what the driver was thinking. It does not need to. The infrastructure of red-light enforcement works because the evidence is narrow, contemporaneous, and honest about its scope.

AI agent accountability needs the same discipline. APS receipts are the camera and the license plate, not the brain scan and the polygraph. That narrowing is not a weakness of the protocol. It is the source of its evidentiary weight.

Every other accountability protocol shipping in 2026 will eventually have to make this distinction. Better to ship it now, on purpose, than have it forced by the first hostile cross-examination.
