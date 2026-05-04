# mcp-ir35-server

UK IR35 contract analysis as an [MCP](https://modelcontextprotocol.io) server, with rich UI built on the [MCP ext-apps protocol](https://github.com/superlayzer/ext-apps).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

## What is this?

A self-contained MCP server that lets contractors paste a UK contract and get a defensible IR35 risk assessment — substitution, mutuality of obligation, and control analysed against HMRC's Employment Status Manual and the relevant case law (Ready Mixed Concrete, Autoclenz, Pimlico Plumbers, PGMOL, Atholl House, and others). All reference data is baked in; no third-party API calls.

> **Not legal advice.** This server provides general guidance only. IR35 status is fact-specific and depends on contract terms _and_ working practices. Decisions ultimately rest with HMRC or the courts. For binding determinations, consult a qualified tax adviser or solicitor.

## Tools

| Tool | Description | UI Widget |
|------|-------------|:---------:|
| `lookup_case_law` | Search the baked-in corpus of UK employment-status cases (1968–2024) | — |
| `analyze_contract` | Score a pasted contract for IR35 risk; flag problematic clauses with case-law citations | Risk dashboard |
| `suggest_clause_rewrite` | Generate an IR35-safer rewrite of a problematic clause | — |
| `cest_check` | CEST-style 15-question assessment with per-factor scoring | Multi-step questionnaire |
| `generate_sds` | Build a Status Determination Statement document for issuance under the off-payroll working rules | Form + document preview |

## Quick start

This project uses [pnpm](https://pnpm.io). If you don't have it, enable it via the Node.js corepack shim that ships with Node 20+:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

Then:

```bash
pnpm install
pnpm dev
```

Server runs at `http://localhost:3007/mcp`.

## Authentication (optional)

By default the server is open access. To require API key authentication, set the `MCP_API_KEY` environment variable:

```bash
MCP_API_KEY=your-secret-key pnpm dev
```

Clients must send `Authorization: Bearer your-secret-key` in requests.

For Cloudflare Workers: `pnpm exec wrangler secret put MCP_API_KEY`

## Register in an MCP client

Add the server URL `http://localhost:3007/mcp` to any MCP-compatible client.

**Layzer:** Account > MCP Servers > Add Server

**Claude Desktop:** Add to `claude_desktop_config.json`:

```json
{ "mcpServers": { "ir35": { "url": "http://localhost:3007/mcp" } } }
```

## Deploy to Cloudflare Workers

```bash
pnpm exec wrangler login
pnpm run deploy
```

Your server URL: `https://mcp-ir35-server.<your-subdomain>.workers.dev/mcp`

## Example prompts

- "Analyze this contract for IR35 risk: [paste]"
- "Look up case law on substitution"
- "Run a CEST-style check on my IR35 status"
- "Generate an SDS for [worker] at [client] for [engagement]"

## The ext-apps UI protocol

Widgets run in sandboxed iframes and communicate via `postMessage` using JSON-RPC 2.0:

1. Widget sends `ui/initialize` to get the host theme
2. Host sends `ui/notifications/tool-result` with tool output
3. Widget renders, persists state via `ui/state/set`, can call back tools via `ui/request-tool-call`, and reports height via `ui/notifications/size-changed`

See [`superlayzer/ext-apps`](https://github.com/superlayzer/ext-apps) for protocol details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
