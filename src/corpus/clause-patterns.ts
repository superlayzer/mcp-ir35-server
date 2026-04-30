import type { IR35Factor } from "./case-law";

export type ClauseSeverity = "high" | "medium" | "low";
export type ClauseDirection = "inside" | "outside";

export interface ClausePattern {
  id: string;
  factor: IR35Factor;
  severity: ClauseSeverity;
  direction: ClauseDirection;
  matchers: readonly RegExp[];
  description: string;
  whyMatters: string;
  saferRewrite?: string;
  caseLawRefs?: readonly string[];
}

// `in-business-on-own-account` has no patterns — it depends on wider
// business activity (multiple clients, marketing) not contract text.
// CEST is the path for that factor.
export const CLAUSE_PATTERNS: readonly ClausePattern[] = [
  // Substitution
  {
    id: "personal-service-required",
    factor: "personal-service",
    severity: "high",
    direction: "inside",
    matchers: [
      /\b(consultant|contractor|worker|supplier)\s+shall\s+personally\b/i,
      /\b(shall|will|must)\s+be\s+(performed|provided|rendered)\s+personally\b/i,
      /\bpersonal\s+(service|performance)\s+(is|shall\s+be)\s+(required|essential|mandatory|necessary)\b/i,
      /\bnamed\s+(individual|consultant|contractor)\b/i,
    ],
    description:
      "Contract requires the named individual to perform the work personally; no substitution permitted.",
    whyMatters:
      "Personal service is the first limb of the Ready Mixed Concrete test. A contract requiring named-individual performance points strongly to employment.",
    saferRewrite:
      "The Consultant may, at its discretion and without requiring the Client's prior approval, provide a substitute of equivalent skill to perform the Services, provided that the Consultant remains liable for the substitute's performance and bears the cost of the substitute.",
    caseLawRefs: ["ready-mixed-concrete-1968", "express-echo-tanton-1999"],
  },
  {
    id: "substitution-with-consent",
    factor: "substitution",
    severity: "high",
    direction: "inside",
    matchers: [
      // (?:'s)? handles "Client's" — ['\s]+ alone failed because 's blocks
      // the next group (the s isn't whitespace).
      /\bsubstitut\w+.{0,60}\b(client|company)(?:'s)?\s+((prior|express|advance|written)\s+){0,3}(consent|approval|agreement|permission)\b/i,
      /\b(consent|approval|permission).{0,20}required.{0,30}substitut/i,
    ],
    description:
      "Substitution allowed only with the client's prior consent or approval.",
    whyMatters:
      "A consent-fettered substitution clause was held insufficient in Pimlico Plumbers — substitution must be genuinely unfettered to defeat personal service.",
    saferRewrite:
      "The Consultant may provide a substitute without the Client's consent. The Client may only object on the basis of objectively-verifiable lack of skill or security clearance.",
    caseLawRefs: ["pimlico-plumbers-smith-2018"],
  },
  {
    id: "unfettered-substitution",
    factor: "substitution",
    severity: "low",
    direction: "outside",
    matchers: [
      /\b(unfettered|absolute|unrestricted|unconditional)\s+right\s+(of|to)\s+substitut/i,
      // Require a role before "may substitute" so generic "either party may
      // substitute" doesn't false-positive as outside-IR35.
      /\b(consultant|contractor|worker|supplier)\s+may\s+(at\s+(its|their)\s+(sole\s+)?discretion\s+)?substitute/i,
      /\b(right|entitled|free)\s+to\s+(send|provide|engage|appoint|use)\s+a\s+substitute/i,
      /\b(consultant|contractor|worker|supplier)\s+(shall\s+be\s+entitled|has\s+the\s+right)\s+to\s+substitute/i,
    ],
    description: "Unfettered right of substitution clearly stated.",
    whyMatters:
      "An unfettered substitution clause is a strong outside-IR35 indicator — but only if it reflects the parties' genuine intentions and would survive Autoclenz scrutiny.",
    caseLawRefs: ["express-echo-tanton-1999", "pimlico-plumbers-smith-2018"],
  },

  // Control
  {
    id: "client-controls-method",
    factor: "control",
    severity: "high",
    direction: "inside",
    matchers: [
      /\b(client|company)\s+(shall|will|may)\s+(direct|determine|specify|control|dictate)\s+(how|the\s+(manner|method|way|process|tasks))/i,
      /\b(under|subject\s+to)\s+(the\s+)?(direction|supervision|oversight|control)\s+of\s+(the\s+)?(\w+\s+)?(client|company|manager)/i,
      /\bas\s+(directed|instructed|determined|required)\s+by\s+(the\s+)?(\w+\s+)?(client|company|manager)/i,
      /\bin\s+accordance\s+with\s+(the\s+)?(client|company)['\s]*(instructions|directions|requirements|procedures)/i,
    ],
    description:
      "Client controls how the work is performed (methods, processes, day-to-day direction).",
    whyMatters:
      "Control over the manner of work is the second limb of Ready Mixed Concrete and a defining marker of employment.",
    saferRewrite:
      "The Consultant shall determine the manner and method of performing the Services. The Client's role is limited to specifying the deliverables and acceptance criteria.",
    caseLawRefs: ["ready-mixed-concrete-1968", "northern-light-solutions-2021"],
  },
  {
    id: "fixed-working-hours",
    factor: "control",
    severity: "medium",
    direction: "inside",
    matchers: [
      /\b(working\s+hours|hours\s+of\s+work).{0,40}(\d{1,2}[:.]?\d{0,2}\s*(am|pm|hrs|hours)?\s*(to|-|–)\s*\d{1,2}[:.]?\d{0,2})/i,
      /\b(monday\s+to\s+friday|9\s*to\s*5)\b/i,
      // Bare "office hours" is too broad (visitor policies, etc.) — require
      // the contractor as the subject within ~40 chars.
      /\b(consultant|contractor|worker|you)\b.{0,40}\b(office|core|business|standard)\s+hours\b/i,
      /\bminimum\s+\d+\s+hours\s+(per|a|each)\s+(day|week)/i,
    ],
    description: "Fixed working hours (e.g. Monday–Friday, 9am–5pm) imposed.",
    whyMatters:
      "Setting the contractor's working hours indicates control over 'when' the work is done — one of the four control dimensions.",
    saferRewrite:
      "The Consultant shall determine their own working hours, provided the deliverables are met by the agreed milestones.",
    caseLawRefs: ["red-white-green-holmes-2020"],
  },
  {
    id: "client-premises-required",
    factor: "control",
    severity: "medium",
    direction: "inside",
    matchers: [
      /\b(must|shall|required\s+to|expected\s+to)\s+(work|attend|be\s+present|perform\s+the\s+(services|work))\s+[^.;]{0,100}?\b(at|on)\s+(the\s+)?(client|company)['\s]*(premises|offices?|site)/i,
      /\b(based|located|stationed)\s+at\s+(the\s+)?(client|company)['\s]*(premises|offices?|site)/i,
      /\bon-?site\s+(work|presence|attendance)\s+(is\s+)?(required|mandatory|expected)/i,
    ],
    description: "Contractor required to work at client's premises.",
    whyMatters:
      "Mandatory on-site presence indicates control over 'where' the work is done. Less weighty if genuinely required by the deliverable (e.g. physical kit access).",
    saferRewrite:
      "The Consultant may perform the Services at any location, including remotely. On-site attendance shall be by mutual agreement where required by the nature of the deliverable.",
  },
  {
    id: "daily-reporting-supervision",
    factor: "control",
    severity: "medium",
    direction: "inside",
    matchers: [
      /\b(daily|weekly|regular)\s+(report|reporting|stand-?up|check-?in|status\s+update|progress\s+update)\b/i,
      /\b(under|subject\s+to)\s+(the\s+)?(supervision|oversight|direction)\s+of\b/i,
      /\b(report|provide\s+(regular\s+)?updates?)\s+(to|on)\s+(progress|status|the\s+(client|manager))/i,
    ],
    description:
      "Requirement for daily/weekly reporting or supervision indicates ongoing direction.",
    whyMatters:
      "Routine reporting and supervision are indicators of an employer-employee relationship rather than an arms-length deliverable engagement.",
    caseLawRefs: ["ackroyd-2019"],
  },
  {
    id: "deliverable-based",
    factor: "control",
    severity: "low",
    direction: "outside",
    matchers: [
      /\bfixed[-\s]price\s+(for|deliverable)/i,
      /\bdeliverables?\s+based\b/i,
      /\bmilestone\s+payments?\b/i,
      /\b(fixed|flat)\s+fee\b/i,
      /\blump\s+sum\b/i,
      /\boutcome[s\-\s]based\b/i,
      /\bpaid\s+(on|upon|against)\s+(completion|delivery|acceptance|milestone)/i,
      /\bpayments?\s+.{0,20}(on|upon|against)\s+(completion|delivery|acceptance|milestone)/i,
    ],
    description:
      "Payment tied to specific deliverables or milestones rather than time.",
    whyMatters:
      "Deliverable-based engagement supports outside-IR35 status by aligning the relationship with output rather than ongoing labour.",
  },

  // Mutuality of obligation
  {
    id: "obligation-to-offer-work",
    factor: "mutuality-of-obligation",
    severity: "medium",
    direction: "inside",
    matchers: [
      /\b(client|company)\s+(shall|will|undertakes\s+to)\s+(provide|offer)\s+(continuous|ongoing|further)\s+work/i,
      // Negative lookbehind blocks "not provide guaranteed work" from
      // false-positing as an offer of guaranteed work.
      /(?<!\bnot\s)\b(provide|offer|grant|guarantee)s?\s+guaranteed\s+(work|hours|engagement)\b/i,
    ],
    description: "Client obliged to provide continuous or further work.",
    whyMatters:
      "Following PGMOL (2024), MOO within a single engagement is now easily met. An obligation to provide further work strengthens that.",
    saferRewrite:
      "Neither party is under any obligation to offer or accept further engagements after the current Services are completed.",
    caseLawRefs: ["pgmol-2024"],
  },
  {
    id: "obligation-to-accept-work",
    factor: "mutuality-of-obligation",
    severity: "medium",
    direction: "inside",
    matchers: [
      /\b(consultant|contractor|worker|supplier)\s+(shall|will|must)\s+(accept|undertake|perform)\s+(any|all|further|allocated|assigned)\s+(work|assignments|tasks)/i,
      /\b(obliged|required)\s+to\s+(accept|undertake|perform)\b/i,
      /\bshall\s+not\s+(refuse|decline)\s+(any|further|allocated|assigned)\s+(work|assignments|tasks)/i,
    ],
    description: "Contractor obliged to accept work offered.",
    whyMatters:
      "An obligation to accept work removes one of the contractor's hallmarks of independence.",
    saferRewrite:
      "The Consultant is under no obligation to accept any further work offered after completion of the current Services.",
  },

  // Financial risk
  {
    id: "fix-at-own-cost",
    factor: "financial-risk",
    severity: "low",
    direction: "outside",
    matchers: [
      /\b(rectif|correct|remed|repair)\w+\s+.{0,30}\b(at|in)\s+(its|their|the\s+(consultant|contractor)['\s]*s)\s+own\s+(cost|expense|time)/i,
      /\bdefective\s+work.{0,40}(own\s+cost|own\s+expense|own\s+time|without\s+(charge|cost|fee))/i,
      /\bmake\s+good\s+.{0,40}(at\s+(its|their)\s+own\s+(cost|expense|time)|without\s+(charge|cost|fee)|at\s+no\s+(cost|charge|fee)\s+to\s+(the\s+)?client)/i,
      /\b(rectif|correct|remed|repair|fix)\w*\s+.{0,40}at\s+no\s+(cost|charge|fee)\s+to\s+(the\s+)?client/i,
    ],
    description:
      "Contractor must fix defective work at their own cost or in their own time.",
    whyMatters:
      "Bearing the cost of correcting defects is a textbook indicator of financial risk and self-employment.",
    caseLawRefs: ["hall-v-lorimer-1994"],
  },
  {
    id: "no-financial-risk",
    factor: "financial-risk",
    severity: "medium",
    direction: "inside",
    matchers: [
      /\bpaid\s+regardless\s+of\s+(performance|outcome|result)/i,
      /\bguaranteed\s+(payment|fees)\s+(regardless|whether)/i,
    ],
    description:
      "Payment guaranteed regardless of performance — no financial risk.",
    whyMatters:
      "Absence of financial risk weighs against self-employment under the multi-factorial test.",
  },

  // Equipment
  {
    id: "client-provides-equipment",
    factor: "equipment",
    severity: "low",
    direction: "inside",
    matchers: [
      /\b(client|company)\s+(shall|will)\s+(provide|supply|issue|furnish)\s+(all\s+)?(equipment|tools|materials|laptop|hardware|workstation|computer)/i,
      /\b(equipment|tools|laptop|hardware|workstation|computer)\s+(shall|will|to)\s+be\s+(provided|supplied|issued|furnished)\s+by\s+(the\s+)?(client|company)/i,
    ],
    description: "Client provides all equipment.",
    whyMatters:
      "Provision of equipment by the engager is a marginal indicator of employment, especially for IT contractors where it may be necessary for security reasons.",
  },
  {
    id: "contractor-provides-equipment",
    factor: "equipment",
    severity: "low",
    direction: "outside",
    matchers: [
      /\b(consultant|contractor|worker|supplier)\s+(shall|will|must)\s+(provide|use|supply|bring)\s+(its|their)\s+own\s+(equipment|tools|hardware|laptop|workstation|computer)/i,
      /\busing\s+(its|their|the\s+(consultant|contractor)['\s]*s)\s+own\s+(equipment|tools|hardware|laptop|workstation|computer)/i,
    ],
    description: "Contractor provides own equipment.",
    whyMatters:
      "Use of own equipment is a marginal but consistent indicator of being in business on own account.",
  },

  // Exclusivity
  {
    id: "exclusivity-clause",
    factor: "exclusivity",
    severity: "medium",
    direction: "inside",
    matchers: [
      // Require positive framing before "exclusively" so "shall NOT be
      // provided exclusively" doesn't false-positive as exclusive.
      /\b(shall|will|must|are|is)\s+(be\s+)?(provided\s+|engaged\s+|retained\s+)?exclusiv(e|ity|ely)\s+(to|for)\s+(the\s+)?(client|company)/i,
      /\bshall\s+not\s+(provide|undertake|accept)\s+(services|work).{0,40}other\s+(client|customer|engager)/i,
      /\bnon-?compete\b/i,
    ],
    description:
      "Exclusivity clause prohibits other clients during the engagement.",
    whyMatters:
      "Exclusivity restricts the contractor's ability to be in business on own account and was a key factor in Ackroyd.",
    saferRewrite:
      "Nothing in this Agreement shall prevent the Consultant from providing services to other clients during the term, provided no conflict of interest arises.",
    caseLawRefs: ["ackroyd-2019"],
  },

  // Notice / termination
  {
    id: "long-notice-period",
    factor: "mutuality-of-obligation",
    severity: "low",
    direction: "inside",
    matchers: [
      // Long notice = months (any count) OR ≥4 weeks. "1 weeks notice" is
      // short notice, not employment-like.
      /\b(notice\s+period\s+of\s+)?(\d+\s+months?|(?:[4-9]|\d{2,})\s+weeks?)['\s]+(notice|written\s+notice)/i,
      /\b(three|four|six)\s+months?['\s]+notice\b/i,
    ],
    description:
      "Long notice period (weeks or months) is more characteristic of employment.",
    whyMatters:
      "Long notice periods point to a continuous, employment-like relationship rather than discrete deliverable-based engagements.",
    saferRewrite:
      "Either party may terminate this Agreement on completion of any then-current deliverable, or earlier by written agreement.",
  },

  // Part and parcel
  {
    id: "part-of-organisation",
    factor: "part-and-parcel",
    severity: "medium",
    direction: "inside",
    matchers: [
      /\b(team\s+member|member\s+of\s+(the\s+)?team)\b/i,
      /\bperformance\s+(review|appraisal)\b/i,
      /\breport(s|ing)?\s+to\s+(the\s+)?(line\s+)?manager\b/i,
    ],
    description:
      "Language treating contractor as part of client's organisation (team member, performance reviews, line manager).",
    whyMatters:
      "Integration into the client's organisation is a 'part and parcel' factor pointing toward employment.",
    saferRewrite:
      "The Consultant is engaged as an independent contractor and is not a member of the Client's staff. The Consultant has no line manager within the Client and is not subject to the Client's performance management processes.",
    caseLawRefs: ["dragonfly-2008", "northern-light-solutions-2021"],
  },
];
