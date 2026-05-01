import { timingSafeEqual } from "node:crypto";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { toFetchResponse, toReqRes } from "fetch-to-node";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerLookupCaseLaw } from "./tools/lookup-case-law";
import { registerAnalyzeContract } from "./tools/analyze-contract";
import { registerSuggestClauseRewrite } from "./tools/suggest-clause-rewrite";
import { registerCestCheck } from "./tools/cest-check";
import { registerGenerateSds } from "./tools/generate-sds";

function createMcpServer(): McpServer {
  const server = new McpServer(
    { name: "mcp-ir35-server", version: "1.0.0" },
    { capabilities: { logging: {} } },
  );

  registerLookupCaseLaw(server);
  registerAnalyzeContract(server);
  registerSuggestClauseRewrite(server);
  registerCestCheck(server);
  registerGenerateSds(server);

  return server;
}

type Bindings = {
  MCP_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "mcp-session-id",
      "Last-Event-ID",
      "mcp-protocol-version",
    ],
    exposeHeaders: ["mcp-session-id", "mcp-protocol-version"],
  }),
);

app.get("/", (c) => c.json({ name: "mcp-ir35-server", version: "1.0.0" }));

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

app.use("/mcp", async (c, next) => {
  const apiKey = c.env.MCP_API_KEY ?? process.env.MCP_API_KEY;
  if (!apiKey) return next();

  const auth = c.req.header("Authorization");
  if (!safeCompare(auth ?? "", `Bearer ${apiKey}`)) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return next();
});

// JSON-mode transport doesn't support GET (SSE notification stream) —
// answer with 405 so MCP clients fall back to POST-only instead of
// treating the SDK's stateless-mode 400 as a fatal connection error.
app.on(["GET", "DELETE"], "/mcp", (c) =>
  c.text("Method Not Allowed", 405, { Allow: "POST" }),
);

app.post("/mcp", async (c) => {
  const body = await c.req.raw
    .clone()
    .json()
    .catch(() => undefined);
  const { req, res } = toReqRes(c.req.raw);
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    // SSE streams don't serialize cleanly through fetch-to-node on
    // Cloudflare Workers — force plain JSON responses instead.
    enableJsonResponse: true,
  });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, body);
  return toFetchResponse(res);
});

export default app;
