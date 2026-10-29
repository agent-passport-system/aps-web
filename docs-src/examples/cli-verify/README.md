# CLI example

Runs the `agent-passport` binary of `agent-passport-system` 8.0.1 the way the CLI reference shows it: a local session (`join --no-register`, `status`, `verify`, `delegate`, `work`, `audit`), `verify-bundle` on a signed, a tampered and a wrong-key evidence bundle, and `verify-regulated` on two receipts. Each command runs in a fresh temp directory with `HOME` pointed at it, so nothing is written to your home directory and nothing is registered publicly.

```bash
npm install
npm start
npm test
```

`npm start` prints each command, its exit code and the output lines that do not change between runs. `npm test` checks that against `expected-output.txt`. The walkthrough is the CLI reference at https://agent-passport.org/docs/cli/.

`regulated/` holds vectors V06 and V01 of the SDK's `aps-regulated-action-v0` conformance set, with the `input_receipt` and `verification_context` values copied unchanged (reindented) from `conformance/regulated-action/v0/vectors.json` at agent-passport-system commit f95c9168187cbac0493099fe4a7cddaff653bf39. The fixed key seeds in `make-bundle.mjs` are for this example only.
