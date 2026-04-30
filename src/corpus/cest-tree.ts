import type { IR35Factor } from "./case-law";

export type CESTAnswerOption = "yes" | "no" | "unclear";

export interface CESTQuestion {
  id: string;
  factor: IR35Factor;
  text: string;
  helpText?: string;
  weight: number;
  outsideAnswer: CESTAnswerOption;
  caseLawRefs?: readonly string[];
  esmRefs?: readonly string[];
}

export const CEST_QUESTIONS: readonly CESTQuestion[] = [
  {
    id: "substitution-right",
    factor: "substitution",
    text: "Does the contract give you a genuine, unfettered right to send a substitute to perform the work?",
    helpText:
      "Unfettered means: no client approval required, not limited to specific circumstances (illness, holiday), and not restricted to a named pool.",
    weight: 25,
    outsideAnswer: "yes",
    caseLawRefs: ["express-echo-tanton-1999", "pimlico-plumbers-smith-2018"],
    esmRefs: ["ESM0506"],
  },
  {
    id: "substitution-exercised",
    factor: "substitution",
    text: "Has substitution actually been exercised in practice (or would the client genuinely accept a substitute)?",
    helpText:
      "Tribunals look at the reality, not just the contract. A clause never used and never intended to be used will be treated as a sham (Autoclenz).",
    weight: 15,
    outsideAnswer: "yes",
    caseLawRefs: ["autoclenz-belcher-2011", "dragonfly-2008"],
    esmRefs: ["ESM0506"],
  },
  {
    id: "substitute-payment",
    factor: "substitution",
    text: "If you send a substitute, do you (not the client) pay them?",
    weight: 10,
    outsideAnswer: "yes",
    caseLawRefs: ["pimlico-plumbers-smith-2018"],
  },
  {
    id: "control-what",
    factor: "control",
    text: "Does the client direct WHAT specific tasks you perform day-to-day (beyond defining the overall deliverable)?",
    weight: 12,
    outsideAnswer: "no",
    caseLawRefs: ["ackroyd-2019", "northern-light-solutions-2021"],
    esmRefs: ["ESM0518"],
  },
  {
    id: "control-how",
    factor: "control",
    text: "Does the client direct HOW you perform the work (methods, tools, processes)?",
    weight: 12,
    outsideAnswer: "no",
    esmRefs: ["ESM0518"],
  },
  {
    id: "control-when",
    factor: "control",
    text: "Does the client set your working hours (rather than letting you choose when to work)?",
    weight: 8,
    outsideAnswer: "no",
    esmRefs: ["ESM0518"],
  },
  {
    id: "control-where",
    factor: "control",
    text: "Does the client require you to work at specific premises (rather than work-from-anywhere)?",
    helpText:
      "Where on-site presence is genuinely necessary for the deliverable (e.g. accessing physical kit), this carries less weight.",
    weight: 6,
    outsideAnswer: "no",
    esmRefs: ["ESM0518"],
  },
  {
    id: "moo-offer",
    factor: "mutuality-of-obligation",
    text: "Is the client obliged to offer you further work after the current deliverable, or to keep paying you when no work is available?",
    weight: 10,
    outsideAnswer: "no",
    caseLawRefs: ["pgmol-2024"],
    esmRefs: ["ESM0509"],
  },
  {
    id: "moo-accept",
    factor: "mutuality-of-obligation",
    text: "Are you obliged to accept further work the client offers?",
    weight: 8,
    outsideAnswer: "no",
    caseLawRefs: ["pgmol-2024"],
    esmRefs: ["ESM0509"],
  },
  {
    id: "financial-risk-correction",
    factor: "financial-risk",
    text: "Would you have to fix defective work in your own time, at your own cost?",
    weight: 10,
    outsideAnswer: "yes",
    esmRefs: ["ESM0532"],
  },
  {
    id: "business-insurance",
    factor: "in-business-on-own-account",
    text: "Do you carry your own professional indemnity and public liability insurance for this work?",
    weight: 6,
    outsideAnswer: "yes",
    esmRefs: ["ESM0532"],
  },
  {
    id: "multiple-clients",
    factor: "in-business-on-own-account",
    text: "Have you (or your company) had multiple clients in the past 12 months, or actively marketed for them?",
    weight: 10,
    outsideAnswer: "yes",
    caseLawRefs: ["hall-v-lorimer-1994", "basic-broadcasting-chiles-2022"],
    esmRefs: ["ESM0532"],
  },
  {
    id: "equipment",
    factor: "equipment",
    text: "Do you provide significant equipment yourself (beyond a laptop)?",
    weight: 4,
    outsideAnswer: "yes",
    esmRefs: ["ESM0533"],
  },
  {
    id: "exclusivity",
    factor: "exclusivity",
    text: "Are you free to take on other clients during this engagement (no exclusivity clause)?",
    weight: 6,
    outsideAnswer: "yes",
    caseLawRefs: ["ackroyd-2019"],
  },
  {
    id: "part-and-parcel",
    factor: "part-and-parcel",
    text: "Are you treated as separate from the client's organisation (no line management, no performance reviews, not in internal directories or org charts)?",
    weight: 8,
    outsideAnswer: "yes",
    caseLawRefs: ["dragonfly-2008", "northern-light-solutions-2021"],
  },
];
