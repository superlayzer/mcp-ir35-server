import { serve } from "@hono/node-server";
import app from "./app";

const PORT = Number(process.env.PORT ?? 3007);

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`MCP IR35 server running on http://localhost:${PORT}/mcp`);
});
