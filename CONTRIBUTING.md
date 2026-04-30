# Contributing

Thanks for your interest in contributing! This server provides UK IR35
contract analysis tooling for contractors, with rich UI surfaces built
on [Layzer](https://layzer.ai)'s apps-sdk protocol.

## Prerequisites

- Node.js 20+
- pnpm — enable via `corepack enable && corepack prepare pnpm@latest --activate`

## Local development

```bash
pnpm install
pnpm dev
```

Server starts at http://localhost:3007/mcp.

## Adding a new tool

1. Create `src/tools/my-tool.ts` following the pattern in existing tool files
2. If it renders UI, also create `src/tools/my-tool-widget.ts` with the widget HTML
3. Export a `registerMyTool(server: McpServer)` function
4. Import and call it in `src/app.ts`
5. Run `pnpm typecheck` to verify

See README.md for details.

## Code style

- TypeScript strict mode
- Use `as const` for MCP content type literals
- Internal imports are extensionless (`from "../analysis/score"`); external SDK subpath imports keep their `.js` per the package's exports map

## Submitting a PR

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Run `pnpm typecheck`
5. Open a pull request

## Note

Source of truth is the [Layzer monorepo](https://github.com/superlayzer/layzer). Small fixes welcome here; new capabilities should go upstream so the host-side implementation lands alongside.
