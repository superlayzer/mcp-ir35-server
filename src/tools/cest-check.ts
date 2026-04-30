import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { IR35_DISCLAIMER } from "../analysis/disclaimer";
import { scoreCest } from "../analysis/score";
import { CEST_CHECK_WIDGET_HTML } from "./cest-check-widget";

const WIDGET_URI = "ui://ir35/cest-check.html";
const WIDGET_MIME = "text/html;profile=mcp-app";

export function registerCestCheck(server: McpServer): void {
  server.registerTool(
    "cest_check",
    {
      title: "CEST-style IR35 status assessment",
      description:
        "Score a UK contractor's status from a CEST-style questionnaire (15 questions across substitution, control, mutuality of obligation, financial risk, and other factors). Returns per-factor verdicts, overall band, and case-law / HMRC ESM citations driving each branch. Designed to be called from the questionnaire widget after the user fills it in, but also callable directly with a partial or complete responses map.",
      inputSchema: {
        responses: z
          .record(z.string(), z.enum(["yes", "no", "unclear"]))
          .optional()
          .describe(
            "Map of question id → answer. Question ids match the cest-tree corpus (e.g. 'substitution-right', 'control-what'). Use 'unclear' for genuinely uncertain answers; they contribute zero but are reported. Empty or omitted → renders the questionnaire widget for the user to fill in.",
          ),
      },
      _meta: { ui: { resourceUri: WIDGET_URI } },
    },
    async ({ responses }) => {
      const result = scoreCest(responses ?? {});
      const payload = {
        disclaimer: IR35_DISCLAIMER,
        ...result,
      };
      return {
        content: [{ type: "text" as const, text: JSON.stringify(payload) }],
      };
    },
  );

  server.registerResource(
    "cest-check-widget",
    WIDGET_URI,
    { mimeType: WIDGET_MIME },
    async () => ({
      contents: [
        {
          uri: WIDGET_URI,
          text: CEST_CHECK_WIDGET_HTML,
          mimeType: WIDGET_MIME,
        },
      ],
    }),
  );
}
