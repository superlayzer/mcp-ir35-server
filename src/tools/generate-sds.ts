import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { IR35_DISCLAIMER } from "../analysis/disclaimer";
import { GENERATE_SDS_WIDGET_HTML } from "./generate-sds-widget";

const WIDGET_URI = "ui://ir35/generate-sds.html";
const WIDGET_MIME = "text/html;profile=mcp-app";

// Common placeholder shapes the LLM tends to fill in when it's bluffing
// values it doesn't know. Anchored ^/$ patterns require the WHOLE field to
// be a placeholder; the unanchored ones flag obviously-instructional text.
const PLACEHOLDER_PATTERNS: readonly RegExp[] = [
  /^\s*(tbd|tba|t\.b\.d\.|n\/?a|none|null|undefined|todo)\s*$/i,
  /^\s*to\s+be\s+(determined|advised|confirmed|filled|completed|added)\b/i,
  /^\s*(client|worker|company|consultant)\s*name\s*$/i,
  /^\s*(name|insert|enter|type|fill|specify|describe)\s*$/i,
  /^\s*<[^>]+>\s*$/,
  /^\s*\[[^\]]+\]\s*$/,
  /^\s*\?+\s*$/,
  /^\s*-+\s*$/,
  /\bplaceholder\s+(text|content|value)?\b/i,
  /\blorem\s+ipsum\b/i,
];

export function isPlaceholder(s: string | undefined | null): boolean {
  if (!s) return false;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(s));
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Round-trips through Date so impossible dates (e.g. "2026-13-01",
// "2023-02-29") and free-form strings ("tomorrow") are rejected.
export function isValidIsoDate(s: string | undefined | null): boolean {
  if (!s || !ISO_DATE_RE.test(s)) return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

// Distinguishes "missing" (undefined → silent) from "invalid" (empty,
// whitespace, or placeholder → pushed to rejected[] so the widget can flag).
export function sanitizeText(
  value: string | undefined,
  field: string,
  rejected: string[],
): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (!trimmed || isPlaceholder(trimmed)) {
    rejected.push(field);
    return undefined;
  }
  return trimmed;
}

export function sanitizeDate(
  value: string | undefined,
  field: string,
  rejected: string[],
): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (!trimmed || isPlaceholder(trimmed) || !isValidIsoDate(trimmed)) {
    rejected.push(field);
    return undefined;
  }
  return trimmed;
}

export function buildSdsMarkdown(args: {
  worker: string;
  client: string;
  engagement: string;
  status: "inside" | "outside";
  reasoning: string;
  effectiveDate: string;
  issuedBy: string;
  issuedDate: string;
}): string {
  const statusLabel =
    args.status === "inside"
      ? "INSIDE IR35 — deemed employment for tax purposes"
      : "OUTSIDE IR35 — not deemed employment for tax purposes";

  return [
    `# Status Determination Statement`,
    ``,
    `_Issued under Chapter 10 of Part 2 of the Income Tax (Earnings and Pensions) Act 2003 (the off-payroll working rules)._`,
    ``,
    `## Engagement details`,
    ``,
    `**Worker / Personal Service Company:** ${args.worker}`,
    ``,
    `**Client (engager):** ${args.client}`,
    ``,
    `**Engagement:** ${args.engagement}`,
    ``,
    `**Effective date:** ${args.effectiveDate}`,
    ``,
    `## Determination`,
    ``,
    `Having considered the contractual terms and the working practices for this engagement, the Client has determined that the engagement is:`,
    ``,
    `### ${statusLabel}`,
    ``,
    `## Reasons for the determination`,
    ``,
    args.reasoning.trim(),
    ``,
    `## Right to dispute`,
    ``,
    `If the worker (or any deemed employer) disagrees with this determination, they may submit representations in writing. The Client will consider any such representations and respond within 45 days, either confirming the original determination or issuing a revised one.`,
    ``,
    `## Issued by`,
    ``,
    `**Name and role:** ${args.issuedBy}`,
    ``,
    `**Date issued:** ${args.issuedDate}`,
  ].join("\n");
}

export function registerGenerateSds(server: McpServer): void {
  server.registerTool(
    "generate_sds",
    {
      title: "Generate an IR35 Status Determination Statement",
      description:
        "Build a Status Determination Statement (SDS) for issuance under the off-payroll working rules. The end-client (or fee-payer) issues an SDS to the worker and any agency, explaining the IR35 status conclusion and the reasons. Returns formatted markdown the issuer can copy into their own document. Renders a form widget for filling in the fields. Designed for end-client / hiring-manager use; contractors can also draft what they expect their client to issue.",
      inputSchema: {
        worker: z
          .string()
          .min(1)
          .max(200)
          .optional()
          .describe(
            "The worker's name or personal service company name (e.g. 'Acme Consulting Ltd' or 'J. Smith via Acme Consulting Ltd').",
          ),
        client: z
          .string()
          .min(1)
          .max(200)
          .optional()
          .describe("The end-client (engaging) organisation."),
        engagement: z
          .string()
          .min(1)
          .max(500)
          .optional()
          .describe(
            "Brief description of the engagement: role, scope, term (e.g. '6-month senior data engineer engagement on the customer-data platform').",
          ),
        status: z
          .enum(["inside", "outside"])
          .optional()
          .describe("The IR35 status conclusion."),
        reasoning: z
          .string()
          .min(1)
          .max(5000)
          .optional()
          .describe(
            "Reasons for the determination — typically 200-500 words. Reference specific contract terms and working practices that led to the conclusion (substitution clause, control, MOO, financial risk, etc.).",
          ),
        effectiveDate: z
          .string()
          .optional()
          .describe(
            "Date the determination takes effect, ISO format YYYY-MM-DD.",
          ),
        issuedBy: z
          .string()
          .min(1)
          .max(200)
          .optional()
          .describe(
            "Name and role of the person at the client issuing the SDS (e.g. 'Jane Doe, Head of Engineering').",
          ),
        issuedDate: z
          .string()
          .optional()
          .describe(
            "Date the SDS is issued, ISO YYYY-MM-DD. Defaults to today (UTC).",
          ),
      },
      _meta: { ui: { resourceUri: WIDGET_URI } },
    },
    async ({
      worker,
      client,
      engagement,
      status,
      reasoning,
      effectiveDate,
      issuedBy,
      issuedDate,
    }) => {
      const rejectedFields: string[] = [];
      const cleanWorker = sanitizeText(worker, "worker", rejectedFields);
      const cleanClient = sanitizeText(client, "client", rejectedFields);
      const cleanEngagement = sanitizeText(
        engagement,
        "engagement",
        rejectedFields,
      );
      const cleanReasoning = sanitizeText(
        reasoning,
        "reasoning",
        rejectedFields,
      );
      const cleanIssuedBy = sanitizeText(issuedBy, "issuedBy", rejectedFields);
      const cleanEffectiveDate = sanitizeDate(
        effectiveDate,
        "effectiveDate",
        rejectedFields,
      );

      const todayUTC = new Date().toISOString().slice(0, 10);
      const cleanIssuedDate =
        issuedDate === undefined
          ? todayUTC
          : sanitizeDate(issuedDate, "issuedDate", rejectedFields);

      const allFieldsPresent =
        cleanWorker &&
        cleanClient &&
        cleanEngagement &&
        status &&
        cleanReasoning &&
        cleanEffectiveDate &&
        cleanIssuedBy &&
        cleanIssuedDate;

      if (!allFieldsPresent) {
        const payload = {
          disclaimer: IR35_DISCLAIMER,
          ready: false,
          message:
            rejectedFields.length > 0
              ? `These fields look like placeholders and were rejected: ${rejectedFields.join(", ")}. The widget will render so the user can fill in real values.`
              : "All fields are required to produce an SDS. The widget will render so the user can fill them in.",
          rejectedFields,
          provided: {
            worker: cleanWorker,
            client: cleanClient,
            engagement: cleanEngagement,
            status,
            effectiveDate: cleanEffectiveDate,
            issuedBy: cleanIssuedBy,
            issuedDate: cleanIssuedDate,
          },
        };
        return {
          content: [{ type: "text" as const, text: JSON.stringify(payload) }],
        };
      }

      // TS can't infer that allFieldsPresent === true narrows each clean* date.
      const finalIssuedDate = cleanIssuedDate as string;
      const finalEffectiveDate = cleanEffectiveDate as string;

      const sdsMarkdown = buildSdsMarkdown({
        worker: cleanWorker,
        client: cleanClient,
        engagement: cleanEngagement,
        status,
        reasoning: cleanReasoning,
        effectiveDate: finalEffectiveDate,
        issuedBy: cleanIssuedBy,
        issuedDate: finalIssuedDate,
      });

      const payload = {
        disclaimer: IR35_DISCLAIMER,
        ready: true,
        worker: cleanWorker,
        client: cleanClient,
        engagement: cleanEngagement,
        status,
        statusLabel: status === "inside" ? "Inside IR35" : "Outside IR35",
        reasoning: cleanReasoning,
        effectiveDate: finalEffectiveDate,
        issuedBy: cleanIssuedBy,
        issuedDate: finalIssuedDate,
        sdsMarkdown,
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(payload) }],
      };
    },
  );

  server.registerResource(
    "generate-sds-widget",
    WIDGET_URI,
    { mimeType: WIDGET_MIME },
    async () => ({
      contents: [
        {
          uri: WIDGET_URI,
          text: GENERATE_SDS_WIDGET_HTML,
          mimeType: WIDGET_MIME,
        },
      ],
    }),
  );
}
