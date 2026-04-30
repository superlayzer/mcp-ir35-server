import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CASE_LAW, type CaseRecord, type IR35Factor } from "../corpus/case-law";
import { IR35_DISCLAIMER } from "../analysis/disclaimer";

const FACTOR_VALUES: readonly IR35Factor[] = [
  "substitution",
  "control",
  "mutuality-of-obligation",
  "personal-service",
  "in-business-on-own-account",
  "financial-risk",
  "equipment",
  "exclusivity",
  "part-and-parcel",
];

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

function searchCases(
  query: string | undefined,
  factor: IR35Factor | undefined,
  limit: number,
): { results: readonly CaseRecord[]; matched: number } {
  let matches: readonly CaseRecord[] = CASE_LAW;

  if (factor) {
    matches = matches.filter((c) => c.factors.includes(factor));
  }

  if (query) {
    const q = query.toLowerCase();
    // Year matches require 4 digits so "19" doesn't hit every 1900s case.
    const queryYear = /^\d{4}$/.test(q) ? Number(q) : null;
    matches = matches.filter(
      (c) =>
        c.id.includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.holding.toLowerCase().includes(q) ||
        c.relevance.toLowerCase().includes(q) ||
        c.citation.toLowerCase().includes(q) ||
        c.court.toLowerCase().includes(q) ||
        (queryYear !== null && c.year === queryYear),
    );
  }

  return { results: matches.slice(0, limit), matched: matches.length };
}

function formatCase(c: CaseRecord): string {
  return [
    `### ${c.name} (${c.year})`,
    `**Court:** ${c.court}  |  **Citation:** ${c.citation}`,
    `**Factors:** ${c.factors.join(", ")}`,
    "",
    `**Holding:** ${c.holding}`,
    "",
    `**Relevance:** ${c.relevance}`,
  ].join("\n");
}

function describeQuery(
  query: string | undefined,
  factor: IR35Factor | undefined,
): string {
  const parts: string[] = [];
  if (query) parts.push(`query="${query}"`);
  if (factor) parts.push(`factor=${factor}`);
  return parts.length === 0 ? "all cases" : parts.join(", ");
}

function formatResponse(
  query: string | undefined,
  factor: IR35Factor | undefined,
  results: readonly CaseRecord[],
  matched: number,
): string {
  const header =
    matched === 0
      ? `No UK employment-status cases matched ${describeQuery(query, factor)}.`
      : matched === results.length
        ? `Found ${matched} case(s) matching ${describeQuery(query, factor)}.`
        : `Found ${matched} case(s) matching ${describeQuery(query, factor)}; showing first ${results.length}.`;

  const body = results.map(formatCase).join("\n\n---\n\n");
  return [IR35_DISCLAIMER, "", header, "", body].join("\n").trimEnd();
}

export function registerLookupCaseLaw(server: McpServer): void {
  server.registerTool(
    "lookup_case_law",
    {
      title: "Look up UK IR35 case law",
      description:
        "Search the baked-in corpus of UK employment-status and IR35 case law (Ready Mixed Concrete 1968 → PGMOL 2024). Returns case names, citations, holdings, and IR35 relevance. Filter by factor (substitution, control, mutuality-of-obligation, etc.) and/or text query.",
      inputSchema: {
        query: z
          .string()
          .optional()
          .describe(
            "Free-text search across case name, citation, court, holding, and relevance",
          ),
        factor: z
          .enum(FACTOR_VALUES as [IR35Factor, ...IR35Factor[]])
          .optional()
          .describe("Filter to cases that touch this IR35 factor"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(MAX_LIMIT)
          .optional()
          .describe(`Max results to return (default ${DEFAULT_LIMIT})`),
      },
    },
    async ({ query, factor, limit }) => {
      const { results, matched } = searchCases(
        query,
        factor,
        limit ?? DEFAULT_LIMIT,
      );
      return {
        content: [
          {
            type: "text" as const,
            text: formatResponse(query, factor, results, matched),
          },
        ],
      };
    },
  );
}
