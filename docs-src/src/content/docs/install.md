---
title: Install
description: Install commands for the TypeScript, Python, Rust and Go SDKs and the MCP server, with current versions.
---

The table lists each package, its current version, and the command that installs it.

| Package | Version | Install |
| --- | --- | --- |
| [TypeScript SDK on npm](https://www.npmjs.com/package/agent-passport-system) | 8.0.1 | `npm install agent-passport-system` |
| [Python SDK on PyPI](https://pypi.org/project/agent-passport-system/) | 4.3.0 | `pip install agent-passport-system` |
| [Rust SDK on crates.io](https://crates.io/crates/agent-passport-system) | 0.3.0 | `cargo add agent-passport-system` |
| [Go SDK on pkg.go.dev](https://pkg.go.dev/github.com/aeoess/agent-passport-go) | v0.7.0 | `go get github.com/aeoess/agent-passport-go@v0.7.0` |
| [MCP server on npm](https://www.npmjs.com/package/agent-passport-system-mcp) | 8.1.0 | `npx agent-passport-system-mcp setup` |

## TypeScript

The TypeScript SDK is the reference implementation.

```bash
npm install agent-passport-system
```

A plain `npm install agent-passport-system` installs 8.0.1, the current stable release on the npm latest tag. Pin a version for production builds.

## Python

There is a Python implementation on PyPI for verifier and signing work.

```bash
pip install agent-passport-system
```

## Rust

The Rust SDK is published on crates.io. The library crate is `agent_passport`.

```bash
cargo add agent-passport-system
```

## Go

A Go implementation is published for verifier and signing work in Go services. Go has no registry publish step. It is distributed by module path:

```bash
go get github.com/aeoess/agent-passport-go@v0.7.0
```

## MCP server

The Model Context Protocol server exposes APS as tools to any MCP capable agent.

```bash
npm install -g agent-passport-system-mcp && npx agent-passport-system-mcp setup
```

## Remote MCP via SSE

The remote server needs no install and works with any MCP client. The endpoint is `https://mcp.aeoess.com/sse`.

```bash
npx agent-passport-system-mcp setup --remote
```

See [MCP server](/docs/mcp-server/) for manual client configuration.
