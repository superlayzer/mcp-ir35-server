import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { IR35_DISCLAIMER } from "../analysis/disclaimer";
import { extractClauses, type ClauseMatch } from "../analysis/extract-clauses";
import { scoreMatches } from "../analysis/score";
import { ANALYZE_CONTRACT_WIDGET_HTML } from "./analyze-contract-widget";

const WIDGET_URI = "ui://ir35/analyze-contract.html";
const WIDGET_MIME = "text/html;profile=mcp-app";
const MAX_CONTRACT_LENGTH = 200_000;
const MIN_CONTRACT_LENGTH = 50;

interface SerialisedSnippet {
  context: string;
  matched: string;
  offset: number;
  length: number;
}

interface SerialisedMatch {
  patternId: string;
  factor: string;
  severity: string;
  direction: string;
  description: string;
  whyMatters: string;
  saferRewrite: string | null;
  caseLawRefs: readonly string[];
  snippets: readonly SerialisedSnippet[];
}

function serialiseMatches(
  matches: readonly ClauseMatch[],
): readonly SerialisedMatch[] {
  return matches.map((m) => ({
    patternId: m.pattern.id,
    factor: m.pattern.factor,
    severity: m.pattern.severity,
    direction: m.pattern.direction,
    description: m.pattern.description,
    whyMatters: m.pattern.whyMatters,
    saferRewrite: m.pattern.saferRewrite ?? null,
    caseLawRefs: m.pattern.caseLawRefs ?? [],
    snippets: m.snippets,
  }));
}

export function registerAnalyzeContract(server: McpServer): void {
  server.registerTool(
    "analyze_contract",
    {
      title: "Analyse a UK contract for IR35 risk",
      description:
        "Paste a UK contract or schedule of services. Returns a per-factor IR35 risk score (substitution, control, mutuality-of-obligation, financial risk, etc.) with the specific clauses driving the score, citations to the case law and HMRC ESM paragraphs that apply, and where possible a safer rewrite suggestion. Renders a risk-dashboard widget.",
      inputSchema: {
        contractText: z
          .string()
          .min(
            MIN_CONTRACT_LENGTH,
            "Contract text appears too short to analyse",
          )
          .max(
            MAX_CONTRACT_LENGTH,
            `Contract text exceeds the ${MAX_CONTRACT_LENGTH.toLocaleString()}-character limit`,
          )
          .describe("Full contract text to analyse"),
      },
      _meta: { ui: { resourceUri: WIDGET_URI } },
    },
    async ({ contractText }) => {
      const matches = extractClauses(contractText);
      const score = scoreMatches(matches);
      const payload = {
        disclaimer: IR35_DISCLAIMER,
        contractLength: contractText.length,
        score,
        matches: serialiseMatches(matches),
      };
      return {
        content: [{ type: "text" as const, text: JSON.stringify(payload) }],
      };
    },
  );

  server.registerResource(
    "analyze-contract-widget",
    WIDGET_URI,
    { mimeType: WIDGET_MIME },
    async () => ({
      contents: [
        {
          uri: WIDGET_URI,
          text: ANALYZE_CONTRACT_WIDGET_HTML,
          mimeType: WIDGET_MIME,
        },
      ],
    }),
  );
}
