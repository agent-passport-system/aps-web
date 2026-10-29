# Governed action example

One governed action with `agent-passport-system` 8.0.1: a principal signs an `AuthorityDelegationV1` grant, an enforcement boundary verifies it and holds the resource, and the boundary signs `ReceiptV1` records. The cases cover an allowed call and refusals for out of scope, over budget, replay, unknown revocation status and revoked authority.

```bash
npm install
npm start
npm test
```

Run the install with `NODE_ENV` unset, so npm installs the dev dependencies the typecheck needs. `npm start` prints exactly `expected-output.txt`. The walkthrough is the Quickstart at https://agent-passport.org/docs/quickstart/.

Fixed key seeds keep the output deterministic. They are for this example only.
