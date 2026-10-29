---
title: Install
description: Install commands, runtime requirements and a smoke check for the TypeScript, Python, Rust and Go SDKs and the MCP server.
---

| Package | Version | Runtime (from the package manifest) | Install |
| --- | --- | --- | --- |
| [TypeScript SDK on npm](https://www.npmjs.com/package/agent-passport-system) | 8.0.1 | Node.js 18 or later, ES modules only | `npm install agent-passport-system@8.0.1` |
| [Python SDK on PyPI](https://pypi.org/project/agent-passport-system/) | 4.3.0 | Python 3.10 or later | `pip install agent-passport-system==4.3.0` |
| [Rust SDK on crates.io](https://crates.io/crates/agent-passport-system) | 0.3.0 | No minimum compiler version is declared | `cargo add agent-passport-system@0.3.0` |
| [Go SDK on pkg.go.dev](https://pkg.go.dev/github.com/aeoess/agent-passport-go) | v0.7.0 | `go 1.22` in `go.mod` | `go get github.com/aeoess/agent-passport-go@v0.7.0` |
| [MCP server on npm](https://www.npmjs.com/package/agent-passport-system-mcp) | 8.1.0 | Node.js 20 or later | `npm install agent-passport-system-mcp@8.1.0` |

The four SDKs do different jobs. TypeScript and Python issue and verify the current `AuthorityDelegationV1` record and its revocation record. The Rust crate only verifies, it creates no artifacts. The Go module signs and verifies its own chain shape. Check that the SDK you pick can produce or verify the artifact your peer sends before you build on it. [Languages and artifacts](/docs/languages/) has the table by artifact and operation.

## TypeScript

```bash
npm install agent-passport-system@8.0.1
```

The package is ES modules only. Your project needs `"type": "module"` in its `package.json`, or `.mjs` files. A CommonJS `require('agent-passport-system')` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`.

Smoke check, saved as `smoke.mjs` in the project root:

```js
import { readFileSync } from 'node:fs'
import { issueAuthorityDelegation } from 'agent-passport-system'
const pkg = JSON.parse(readFileSync('node_modules/agent-passport-system/package.json', 'utf8'))
console.log(pkg.version, typeof issueAuthorityDelegation)
```

```text
$ node smoke.mjs
8.0.1 function
```

### Package name and binary name

The npm package is `agent-passport-system`. The command line tool it installs is called `agent-passport`. Inside a project that has the package installed, `npx agent-passport <command>` runs it. In a directory without the package, `npx agent-passport` asks npm for a different package named `agent-passport`. Name the package explicitly instead:

```bash
npm exec --package=agent-passport-system@8.0.1 -- agent-passport help
```

See the [CLI reference](/docs/cli/).

## Python

```bash
pip install agent-passport-system==4.3.0
```

The distribution is `agent-passport-system` and the import is `agent_passport`. Smoke check:

```python
import importlib.metadata
from agent_passport.v2.authority_delegation import issue_authority_delegation
print(importlib.metadata.version("agent-passport-system"), callable(issue_authority_delegation))
```

```text
4.3.0 True
```

Key pairs from `generate_key_pair()` use the keys `publicKey` and `privateKey`. The current authority record lives in `agent_passport.v2.authority_delegation`. The older `create_delegation` and `verify_delegation` produce the pre-draft compatibility format. This recipe issues a grant, verifies it with an explicit clock, key resolver, root trust policy and revocation resolver, then revokes it:

```python
from agent_passport import generate_key_pair
from agent_passport.v2.authority_delegation import issue_authority_delegation, verify_authority_delegation
from agent_passport.v2.authority_revocation import (
    InMemoryAuthorityRevocationStore, create_authority_revocation_resolver,
    issue_authority_revocation, record_authority_revocation,
)

principal = generate_key_pair()
PRINCIPAL, PRINCIPAL_VM = "did:example:principal", "did:example:principal#key-1"

grant = issue_authority_delegation({
    "record_type": "aps:authority-delegation:v1", "version": "1.0", "parent_delegation_id": None,
    "issuer": PRINCIPAL, "subject": "did:example:agent", "verification_method": PRINCIPAL_VM,
    "issued_at": "2026-10-28T09:00:00.000Z", "nonce": "00000000000000000000000000000001",
    "authority": {
        "scope": {"profile": "aps-hierarchical-v1", "grants": ["notes:read:*"]},
        "spend": {"mode": "bounded", "unit": "example:credit", "per_action": "5", "cumulative": "10"},
        "depth": {"remaining": 0},
        "time": {"not_before": "2026-10-28T09:00:00.000Z", "not_after": "2026-10-28T17:00:00.000Z"},
        "reputation": {"profile": "aps-score-0-100-v1", "ceiling": 100},
        "values": {"profile": "aps-values-identifiers-v1", "required": []},
        "reversibility": {"profile": "aps-tci-v1", "ceiling": "compensable"},
    },
}, principal["privateKey"])

def resolve_key(issuer, verification_method, issued_at):
    if issuer == PRINCIPAL and verification_method == PRINCIPAL_VM:
        return principal["publicKey"]
    return {"outcome": "not_found"}

store = InMemoryAuthorityRevocationStore()
store.track(grant["delegation_id"])
resolve_revocation = create_authority_revocation_resolver(store, resolve_verification_key=resolve_key)

def check(now):
    r = verify_authority_delegation(grant, now=now, resolve_verification_key=resolve_key,
        trust_root=lambda root: root["issuer"] == PRINCIPAL, resolve_revocation=resolve_revocation)
    return r.state, [f.code for f in r.failures]

print("check at 10:00", check("2026-10-28T10:00:00.000Z"))
print("check at 18:00", check("2026-10-28T18:00:00.000Z"))
revocation = issue_authority_revocation(grant, now="2026-10-28T10:05:00.000Z", revoker=PRINCIPAL,
    verification_method=PRINCIPAL_VM, reason_code="task_complete",
    nonce="000000000000000000000000000000aa", private_key=principal["privateKey"])
recorded = record_authority_revocation(store, grant, revocation, resolve_verification_key=resolve_key)
print("revocation recorded", recorded.recorded, recorded.verification.state)
print("check at 10:10", check("2026-10-28T10:10:00.000Z"))
```

```text
check at 10:00 ('valid', [])
check at 18:00 ('invalid', ['EXPIRED'])
revocation recorded True valid
check at 10:10 ('invalid', ['REVOKED'])
```

The revocation store here lives in process memory. A store that has never tracked a delegation answers unknown, and the verifier then returns `indeterminate`, never `valid`.

More modules are described in the [Python SDK README](https://github.com/agent-passport-system/agent-passport-python/blob/main/README.md). If its quick start still calls `create_passport(agent_id=..., public_key=...)`, that example predates 4.3.0 and fails on it with `KeyError: 'public_key'`. Use the recipe above.

## Rust

```bash
cargo add agent-passport-system@0.3.0
```

The library crate is `agent_passport`. It verifies artifacts and creates none. This command was not run for this page.

## Go

Go has no registry publish step. The module is fetched by its declared module path, which stays `github.com/aeoess/agent-passport-go` even though the repository now lives under another GitHub organization:

```bash
go get github.com/aeoess/agent-passport-go@v0.7.0
```

This command was not run for this page.

## MCP server

The local server runs over stdio on your machine:

```bash
npm install agent-passport-system-mcp@8.1.0
npx agent-passport-system-mcp setup
```

`setup` writes an `agent-passport` entry into the Claude Desktop and Cursor configuration files in your home directory. Restart the client afterwards. See [MCP server](/docs/mcp-server/) for manual configuration and for what the server reads, writes and contacts.

### Hosted endpoint

`setup --remote` writes the hosted endpoint `https://mcp.aeoess.com/sse` into the client configuration instead. The [remote server README](https://github.com/agent-passport-system/agent-passport-remote-mcp/blob/b0cfb7f055fa9e6f65c18c51fb121ff1b326bbc7/README.md) at commit `b0cfb7f` says the hosted endpoint is temporarily restricted and anonymous connections return HTTP 401, while self-hosting is unaffected. Use the local server.
