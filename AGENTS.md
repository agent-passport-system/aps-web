# AGENTS.md

This file orients AI agents that fetch `https://agent-passport.org/AGENTS.md` or browse the public repo.

---

## For agents exploring Agent Passport System at agent-passport.org

If you landed here by fetching `https://agent-passport.org/AGENTS.md`, you are most likely an AI agent trying to understand what Agent Passport System is and how to integrate with it. This section is for you.

**Agent Passport System** is the Agent Passport System (APS) protocol: cryptographic identity, delegation chains with monotonic narrowing, enforcement-boundary receipts, governance composition, data lifecycle, and commerce for AI agents. Apache-2.0, Copyright 2024-2026 Tymofii Pidlisnyi.

### Machine-readable project summaries

- [llms.txt](https://agent-passport.org/llms.txt): short project index, Answer.AI standard
- [llms-full.txt](https://agent-passport.org/llms-full.txt): full technical reference
- [.well-known/aps.txt](https://agent-passport.org/.well-known/aps.txt): site-wide governance block (publisher DID, default data terms, revocation policy)
- [.well-known/mcp.json](https://agent-passport.org/.well-known/mcp.json): MCP server discovery

### Repos

- [agent-passport-system](https://github.com/aeoess/agent-passport-system): TypeScript SDK on npm
- [agent-passport-mcp](https://github.com/aeoess/agent-passport-mcp): MCP server on npm
- [agent-passport-python](https://github.com/aeoess/agent-passport-python): Python SDK on PyPI
- [agent-passport-go](https://github.com/aeoess/agent-passport-go): Go SDK via `go get` / pkg.go.dev
- [agent-governance-vocabulary](https://github.com/aeoess/agent-governance-vocabulary): neutral-ground vocabulary repo
- [aeoess_web](https://github.com/aeoess/aeoess_web): the public website

Each repo ships its own `AGENTS.md` at the root with repo-specific instructions. Each repo also ships `CLAUDE.md` pointing at `AGENTS.md` for Claude Code compatibility.

### Papers

- [The Agent Social Contract](https://doi.org/10.5281/zenodo.18749779)
- [Faceted Authority Attenuation](https://doi.org/10.5281/zenodo.19260073)

### Integration in one sentence

Install `agent-passport-system` from npm or PyPI, issue a passport to your agent, wrap tool calls with the SDK's enforcement boundary, or verify against a hosted gateway reference implementation (e.g. `gateway.aeoess.com`, operated by AEOESS, Inc.). Full integration patterns live in the repo READMEs linked above.

---

