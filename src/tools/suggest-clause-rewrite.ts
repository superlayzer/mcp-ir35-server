import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { IR35_DISCLAIMER } from "../analysis/disclaimer";
import { CLAUSE_PATTERNS } from "../corpus/clause-patterns";
import { CASE_LAW, type IR35Factor } from "../corpus/case-law";

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

// Fallback when no pattern-specific rewrite exists in the corpus. The
// generic templates are starting points only — every engagement needs counsel.
const FACTOR_REWRITE_TEMPLATES: Record<IR35Factor, string> = {
  substitution:
    "The Consultant may, at its discretion and without requiring the Client's prior approval, provide a substitute of equivalent skill to perform the Services, provided that the Consultant remains liable for the substitute's performance and bears the cost of the substitute.",
  "personal-service":
    "Personal service by any specific individual is not required. The Consultant may use any qualified personnel to perform the Services.",
  control:
    "The Consultant shall determine the manner and method of performing the Services. The Client's role is limited to specifying deliverables and acceptance criteria.",
  "mutuality-of-obligation":
    "Neither party is under any obligation to offer or accept further engagements after the current Services are completed.",
  "financial-risk":
    "The Consultant bears the risk of correcting any defective work at its own cost and in its own time.",
  "in-business-on-own-account":
    "The Consultant operates as an independent business with its own clients, equipment, marketing, and infrastructure.",
  equipment:
    "The Consultant shall provide its own equipment necessary to perform the Services, save where Client-provided systems are required for security or compliance reasons.",
  exclusivity:
    "Nothing in this Agreement shall prevent the Consultant from providing services to other clients during the term, provided no conflict of interest arises.",
  "part-and-parcel":
    "The Consultant is engaged as an independent contractor and is not a member of the Client's staff. The Consultant has no line manager within the Client and is not subject to the Client's performance management processes.",
};

interface CaseInfo {
  id: string;
  name: string;
  citation: string;
}

function caseInfoFor(refs: readonly string[]): readonly CaseInfo[] {
  return refs
    .map((id) => CASE_LAW.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => c !== undefined)
    .map((c) => ({ id: c.id, name: c.name, citation: c.citation }));
}

export function registerSuggestClauseRewrite(server: McpServer): void {
  server.registerTool(
    "suggest_clause_rewrite",
    {
      title: "Suggest an IR35-friendly clause rewrite",
      description:
        "Given a problematic clause (by patternId from analyze_contract, or by factor), returns an IR35-safer rewrite with case-law reasoning. Designed to be called from the analyze_contract widget's 'request rewrite' button via ui/request-tool-call, but also callable directly.",
      inputSchema: {
        patternId: z
          .string()
          .optional()
          .describe(
            "ID of a clause pattern from analyze_contract's matches (e.g. 'personal-service-required'). Preferred — the response includes pattern-specific case law.",
          ),
        factor: z
          .enum(FACTOR_VALUES as [IR35Factor, ...IR35Factor[]])
          .optional()
          .describe(
            "IR35 factor the clause relates to. Used when no patternId is provided, or when the matched pattern has no built-in rewrite template.",
          ),
        clauseText: z
          .string()
          .max(2000, "Clause text exceeds 2000-character limit")
          .optional()
          .describe(
            "The original problematic clause. Echoed back in the response for context; not used for matching.",
          ),
      },
    },
    async ({ patternId, factor, clauseText }) => {
      const pattern = patternId
        ? CLAUSE_PATTERNS.find((p) => p.id === patternId)
        : undefined;

      let suggestedRewrite: string;
      let reasoning: string;
      let usedFactor: IR35Factor | undefined = factor;
      let caseRefs: readonly string[] = [];
      let patternDescription: string | null = null;
      let whyMatters: string | null = null;

      if (pattern) {
        usedFactor = pattern.factor;
        patternDescription = pattern.description;
        whyMatters = pattern.whyMatters;
        caseRefs = pattern.caseLawRefs ?? [];
        suggestedRewrite =
          pattern.saferRewrite ?? FACTOR_REWRITE_TEMPLATES[pattern.factor];
        reasoning = pattern.saferRewrite
          ? `Pattern-specific rewrite drawn from the corpus. ${pattern.whyMatters}`
          : `Pattern has no built-in rewrite; using a generic template for the '${pattern.factor}' factor. ${pattern.whyMatters}`;
      } else if (factor) {
        suggestedRewrite = FACTOR_REWRITE_TEMPLATES[factor];
        reasoning = `Generic IR35-friendly drafting for the '${factor}' factor. For the most defensible rewrite, identify the matching pattern via analyze_contract first.`;
      } else {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: "Provide either a patternId (preferred) or a factor.",
            },
          ],
        };
      }

      const payload = {
        disclaimer: IR35_DISCLAIMER,
        patternId: patternId ?? null,
        patternDescription,
        factor: usedFactor ?? null,
        whyMatters,
        originalClauseText: clauseText ?? null,
        suggestedRewrite,
        reasoning,
        caseLaw: caseInfoFor(caseRefs),
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(payload) }],
      };
    },
  );
}
