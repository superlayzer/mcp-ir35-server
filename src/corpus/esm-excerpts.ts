import type { IR35Factor } from "./case-law";

export interface ESMExcerpt {
  ref: string;
  title: string;
  factors: readonly IR35Factor[];
  summary: string;
  url: string;
}

const ESM_BASE_URL =
  "https://www.gov.uk/hmrc-internal-manuals/employment-status-manual";

export const ESM_EXCERPTS: readonly ESMExcerpt[] = [
  {
    ref: "ESM0500",
    title: "Status indicators: introduction to the multi-factorial test",
    factors: [
      "personal-service",
      "control",
      "mutuality-of-obligation",
      "in-business-on-own-account",
    ],
    summary:
      "HMRC's framework for determining employment status, derived from Ready Mixed Concrete. No single factor is decisive; the overall picture must be considered.",
    url: `${ESM_BASE_URL}/esm0500`,
  },
  {
    ref: "ESM0506",
    title: "Personal service and the right of substitution",
    factors: ["substitution", "personal-service"],
    summary:
      "When a substitution clause negates personal service. A genuinely unfettered right to substitute (not requiring client consent, not limited to specific circumstances) is incompatible with employment. Limited or fettered rights typically are not.",
    url: `${ESM_BASE_URL}/esm0506`,
  },
  {
    ref: "ESM0509",
    title: "Mutuality of obligation",
    factors: ["mutuality-of-obligation"],
    summary:
      "The requirement for mutual obligations between worker and engager. Following PGMOL (2024), HMRC accepts that MOO within an individual engagement (offer + acceptance + payment) is sufficient; an overarching framework is not required.",
    url: `${ESM_BASE_URL}/esm0509`,
  },
  {
    ref: "ESM0518",
    title: "Right of control",
    factors: ["control"],
    summary:
      "The four dimensions of control: what work is done, how it is done, when it is done, and where it is done. The legal right of control matters more than whether it is exercised in practice.",
    url: `${ESM_BASE_URL}/esm0518`,
  },
  {
    ref: "ESM0532",
    title: "In business on own account / financial risk",
    factors: ["in-business-on-own-account", "financial-risk"],
    summary:
      "Indicators that a worker is in business on their own account: provision of equipment, financial risk, opportunity to profit from sound management, multiple clients, business infrastructure, and bearing the cost of correcting defective work.",
    url: `${ESM_BASE_URL}/esm0532`,
  },
  {
    ref: "ESM0533",
    title: "Provision of own equipment",
    factors: ["equipment", "in-business-on-own-account"],
    summary:
      "Provision of substantial equipment by the worker is a strong indicator of self-employment. Use of client-provided minor tools (laptop, software access) is largely neutral for IT contractors.",
    url: `${ESM_BASE_URL}/esm0533`,
  },
  {
    ref: "ESM4014",
    title: "IR35 / intermediaries legislation: overview",
    factors: ["personal-service", "control", "mutuality-of-obligation"],
    summary:
      "When the intermediaries legislation applies: a worker provides services through an intermediary (typically a personal service company) to a client, and the relationship would have been employment had the intermediary not existed.",
    url: `${ESM_BASE_URL}/esm4014`,
  },
  {
    ref: "ESM7000",
    title: "Off-payroll working: introduction",
    factors: ["personal-service", "control", "mutuality-of-obligation"],
    summary:
      "Public sector rules from April 2017 and private sector rules from April 2021 shifted the responsibility for IR35 status determination from the worker's intermediary to the end-client (for medium and large clients).",
    url: `${ESM_BASE_URL}/esm7000`,
  },
  {
    ref: "ESM7400",
    title: "Status determination statement (SDS)",
    factors: ["personal-service", "control"],
    summary:
      "Where the off-payroll working rules apply, the client must issue an SDS to the worker (and any agency) explaining the status conclusion and the reasons for it. Reasonable care must be taken in reaching the determination.",
    url: `${ESM_BASE_URL}/esm7400`,
  },
];
