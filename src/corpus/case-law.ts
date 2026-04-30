export type IR35Factor =
  | "substitution"
  | "control"
  | "mutuality-of-obligation"
  | "personal-service"
  | "in-business-on-own-account"
  | "financial-risk"
  | "equipment"
  | "exclusivity"
  | "part-and-parcel";

export interface CaseRecord {
  id: string;
  name: string;
  year: number;
  court: string;
  citation: string;
  factors: readonly IR35Factor[];
  holding: string;
  relevance: string;
}

export const CASE_LAW: readonly CaseRecord[] = [
  {
    id: "ready-mixed-concrete-1968",
    name: "Ready Mixed Concrete (South East) Ltd v Minister of Pensions and National Insurance",
    year: 1968,
    court: "High Court (QBD)",
    citation: "[1968] 2 QB 497",
    factors: ["control", "mutuality-of-obligation", "personal-service"],
    holding:
      "MacKenna J established the foundational three-part test: (1) the worker agrees to provide personal service in exchange for a wage, (2) the worker accepts the employer's control to a sufficient degree, and (3) the other contract terms are consistent with employment.",
    relevance:
      "Still the bedrock test for distinguishing employment from self-employment. Every IR35 case is decided against this framework. If any one limb fails (e.g. genuine right of substitution), the contract cannot be one of employment.",
  },
  {
    id: "hall-v-lorimer-1994",
    name: "Hall (HMIT) v Lorimer",
    year: 1994,
    court: "Court of Appeal",
    citation: "[1994] 1 WLR 209",
    factors: ["in-business-on-own-account", "financial-risk", "exclusivity"],
    holding:
      "Mummery J's 'in business on own account' approach: status depends on the cumulative picture of multiple factors. No single factor is decisive; 'painting a picture' is more useful than a checklist.",
    relevance:
      "Foundational for the multi-factorial approach courts apply at the third stage of the Ready Mixed Concrete test. A contractor with multiple clients, business overheads, and genuine financial risk paints a self-employed picture even where individual factors are ambiguous.",
  },
  {
    id: "express-echo-tanton-1999",
    name: "Express and Echo Publications Ltd v Tanton",
    year: 1999,
    court: "Court of Appeal",
    citation: "[1999] ICR 693",
    factors: ["substitution", "personal-service"],
    holding:
      "A contract containing an unfettered right of substitution cannot be a contract of employment, since the obligation of personal service is essential to employment.",
    relevance:
      "The substitution gateway. A genuinely unfettered right to send a substitute (not requiring client approval, not limited to absence) is fatal to employment status. HMRC and tribunals scrutinise such clauses for shams.",
  },
  {
    id: "synaptek-young-2003",
    name: "Synaptek Ltd v Young (HMIT)",
    year: 2003,
    court: "High Court (Ch)",
    citation: "[2003] EWHC 645 (Ch)",
    factors: [
      "control",
      "mutuality-of-obligation",
      "in-business-on-own-account",
    ],
    holding:
      "Early IR35 case applying the Ready Mixed Concrete test to an IT contractor working through a personal service company. The hypothetical contract test was endorsed and IR35 was held to apply on the facts.",
    relevance:
      "Established that IR35 analysis must look through the intermediary and construct a hypothetical direct contract between worker and end-client. Still the analytical framework for IR35 today.",
  },
  {
    id: "dragonfly-2008",
    name: "Dragonfly Consultancy Ltd v HMRC",
    year: 2008,
    court: "High Court (Ch)",
    citation: "[2008] EWHC 2113 (Ch)",
    factors: ["control", "substitution", "part-and-parcel"],
    holding:
      "IT contractor at AA found to be inside IR35. The contractual substitution clause was disregarded as 'window dressing' because the parties had no genuine intention to use it; the level of integration with AA's team indicated employment.",
    relevance:
      "Demonstrates that contractual provisions on substitution will be ignored if they don't reflect the parties' actual intentions. Working practices weigh heavily.",
  },
  {
    id: "autoclenz-belcher-2011",
    name: "Autoclenz Ltd v Belcher",
    year: 2011,
    court: "Supreme Court",
    citation: "[2011] UKSC 41",
    factors: ["substitution", "mutuality-of-obligation", "personal-service"],
    holding:
      "Where a written contract does not reflect the true agreement between the parties, courts will look behind the document to the actual relationship. Substitution and right-to-refuse-work clauses can be disregarded as shams.",
    relevance:
      "The leading authority on 'sham' clauses. A polished substitution clause that nobody intended to use will not save a contract from being one of employment. Working practices govern.",
  },
  {
    id: "pimlico-plumbers-smith-2018",
    name: "Pimlico Plumbers Ltd v Smith",
    year: 2018,
    court: "Supreme Court",
    citation: "[2018] UKSC 29",
    factors: ["substitution", "personal-service"],
    holding:
      "A 'limited' right of substitution (e.g. only with another Pimlico operative) is insufficient to defeat the requirement of personal service. The dominant feature of the contract was personal performance.",
    relevance:
      "Tightened the substitution test: substitution must be genuinely unfettered. Substitution limited to a pool of approved replacements, or requiring client consent, will not exclude personal service.",
  },
  {
    id: "ackroyd-2019",
    name: "Christa Ackroyd Media Ltd v HMRC",
    year: 2019,
    court: "Upper Tribunal (TCC)",
    citation: "[2019] UKUT 326 (TCC)",
    factors: ["control", "exclusivity", "part-and-parcel"],
    holding:
      "BBC presenter found inside IR35. The BBC had ultimate editorial control, the contract restricted other engagements, and the relationship was sufficiently integrated to constitute employment in substance.",
    relevance:
      "First major presenter case to find IR35 applied. Editorial control by the end-client and exclusivity provisions are significant indicators of employment.",
  },
  {
    id: "red-white-green-holmes-2020",
    name: "Red, White and Green Ltd v HMRC",
    year: 2020,
    court: "First-tier Tribunal",
    citation: "[2020] UKFTT 109 (TC)",
    factors: ["control", "mutuality-of-obligation"],
    holding:
      "Eamonn Holmes' arrangements with ITV held inside IR35. ITV had a sufficient framework of control over what, when and where work was done, satisfying the Ready Mixed Concrete control limb.",
    relevance:
      "Reinforces that even high-profile, ostensibly independent media talent can fall inside IR35 where the end-client retains a structural right of control, regardless of how that right is exercised in practice.",
  },
  {
    id: "northern-light-solutions-2021",
    name: "Northern Light Solutions Ltd v HMRC",
    year: 2021,
    court: "Upper Tribunal (TCC)",
    citation: "[2021] UKUT 134 (TCC)",
    factors: ["control", "mutuality-of-obligation", "part-and-parcel"],
    holding:
      "IT project manager engaged by Nationwide on successive contracts held inside IR35. Sufficient mutuality of obligation existed within each engagement and Nationwide's control framework satisfied the test.",
    relevance:
      "Particularly relevant to long-term IT contractors at financial-services clients. A pattern of rolling contracts and integration into the client's project structure tends toward employment.",
  },
  {
    id: "atholl-house-2022",
    name: "Atholl House Productions Ltd v HMRC",
    year: 2022,
    court: "Court of Appeal",
    citation: "[2022] EWCA Civ 501",
    factors: [
      "in-business-on-own-account",
      "control",
      "mutuality-of-obligation",
    ],
    holding:
      "Kaye Adams case. The Court of Appeal held that the third-stage 'all the circumstances' analysis in Ready Mixed Concrete must include whether the worker was in business on their own account, taking account of factors outside the specific engagement under review.",
    relevance:
      "Clarified that the multi-factorial third stage is wider than just the engagement under review. A contractor's wider business activity and history with multiple clients is a relevant factor.",
  },
  {
    id: "kickabout-hawksbee-2022",
    name: "Kickabout Productions Ltd v HMRC",
    year: 2022,
    court: "Court of Appeal",
    citation: "[2022] EWCA Civ 502",
    factors: ["control", "mutuality-of-obligation"],
    holding:
      "Talkradio presenter Paul Hawksbee found inside IR35. Mutuality of obligation existed (obligation to perform shows offered, obligation to pay) and the broadcaster had sufficient control over the production.",
    relevance:
      "Companion judgment to Atholl House. Confirms that broad editorial direction and a structured working pattern can satisfy the control test for a presenter, even where day-to-day creative freedom exists.",
  },
  {
    id: "basic-broadcasting-chiles-2022",
    name: "Basic Broadcasting Ltd v HMRC",
    year: 2022,
    court: "First-tier Tribunal",
    citation: "[2022] UKFTT 48 (TC)",
    factors: ["in-business-on-own-account", "exclusivity"],
    holding:
      "Adrian Chiles found OUTSIDE IR35 in his BBC and ITV engagements. On a multi-factorial assessment, the tribunal concluded he was in business on his own account given his wider portfolio of clients and commercial activities.",
    relevance:
      "A rare presenter win for the contractor. Demonstrates the importance of evidencing genuine business-on-own-account: multiple clients, business infrastructure, marketing, and commercial risk.",
  },
  {
    id: "pgmol-2024",
    name: "HMRC v Professional Game Match Officials Ltd",
    year: 2024,
    court: "Supreme Court",
    citation: "[2024] UKSC 29",
    factors: ["mutuality-of-obligation", "control"],
    holding:
      "Mutuality of obligation can be satisfied by the obligations existing within an individual engagement (offer of work + acceptance + payment). An overarching framework of obligations between engagements is not required.",
    relevance:
      "Significantly lowered the bar for finding mutuality of obligation in single-engagement contractor scenarios. After PGMOL, MOO is rarely a winning argument for contractors on its own.",
  },
];
