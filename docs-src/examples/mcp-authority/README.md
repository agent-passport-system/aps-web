# MCP authority example

Drives `agent-passport-system-mcp` 8.1.0 over stdio from an MCP client: tool counts for the default and `essential` profiles, the `commerce_preflight` migration notice, then `identify`, `issue_authority_delegation`, `check_authority_delegation`, `revoke_delegation`, `check_authority_delegation`, a refused revoke of a legacy delegation, a check after a restart, and a refused issue in remote mode.

```bash
npm install
npm start
npm test
```

`npm start` prints exactly `expected-output.txt`, and `npm test` checks that. Each server process runs with `HOME` set to a fresh temp directory. The walkthrough is on the MCP server page at https://agent-passport.org/docs/mcp-server/.

The fixed key seed keeps the output deterministic. It is for this example only.
