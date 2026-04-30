import type { IR35Factor } from "../corpus/case-law";
import type { ClauseSeverity } from "../corpus/clause-patterns";
import type { ClauseMatch } from "./extract-clauses";
import { CEST_QUESTIONS, type CESTAnswerOption } from "../corpus/cest-tree";

const SEVERITY_WEIGHT: Record<ClauseSeverity, number> = {
  high: 10,
  medium: 6,
  low: 3,
};

// Per-factor importance weights. Substitution and personal-service are the
// gateway limbs of Ready Mixed Concrete; control is the second limb. Other
// factors weight the multi-factorial third stage (Hall v Lorimer).
const FACTOR_WEIGHT: Record<IR35Factor, number> = {
  substitution: 50,
  "personal-service": 25,
  control: 38,
  "mutuality-of-obligation": 18,
  "in-business-on-own-account": 16,
  "financial-risk": 10,
  "part-and-parcel": 8,
  exclusivity: 6,
  equipment: 4,
};

export type IR35Band =
  | "outside"
  | "borderline-outside"
  | "borderline-inside"
  | "inside"
  | "indeterminate";

export interface FactorScore {
  factor: IR35Factor;
  weight: number;
  insidePoints: number;
  outsidePoints: number;
  verdict: number;
  contribution: number;
}

export interface ScoreResult {
  overall: number;
  band: IR35Band;
  factors: readonly FactorScore[];
}

function bandFor(overall: number): Exclude<IR35Band, "indeterminate"> {
  if (overall >= 75) return "outside";
  if (overall >= 55) return "borderline-outside";
  if (overall >= 30) return "borderline-inside";
  return "inside";
}

function buildFactorScores(
  factorTotals: Map<IR35Factor, { positive: number; negative: number }>,
): { factors: FactorScore[]; totalContribution: number; totalWeight: number } {
  const factors: FactorScore[] = [];
  let totalContribution = 0;
  let totalWeight = 0;
  for (const factor of Object.keys(FACTOR_WEIGHT) as IR35Factor[]) {
    const totals = factorTotals.get(factor) ?? { positive: 0, negative: 0 };
    const totalPoints = totals.positive + totals.negative;
    const verdict =
      totalPoints === 0 ? 0 : (totals.positive - totals.negative) / totalPoints;
    const weight = FACTOR_WEIGHT[factor];
    const contribution = verdict * weight;
    factors.push({
      factor,
      weight,
      insidePoints: totals.negative,
      outsidePoints: totals.positive,
      verdict,
      contribution,
    });
    totalContribution += contribution;
    totalWeight += weight;
  }
  return { factors, totalContribution, totalWeight };
}

export function scoreMatches(matches: readonly ClauseMatch[]): ScoreResult {
  const factorTotals = new Map<
    IR35Factor,
    { positive: number; negative: number }
  >();
  for (const m of matches) {
    const totals = factorTotals.get(m.pattern.factor) ?? {
      positive: 0,
      negative: 0,
    };
    const points = SEVERITY_WEIGHT[m.pattern.severity];
    if (m.pattern.direction === "outside") totals.positive += points;
    else totals.negative += points;
    factorTotals.set(m.pattern.factor, totals);
  }

  const { factors, totalContribution, totalWeight } =
    buildFactorScores(factorTotals);

  if (matches.length === 0) {
    return { overall: 50, band: "indeterminate", factors };
  }

  // Defensive: totalWeight could be 0 if every FACTOR_WEIGHT entry was 0 —
  // not possible today but guards against future config changes producing NaN.
  const overall =
    totalWeight === 0
      ? 50
      : Math.round(50 + (totalContribution / totalWeight) * 50);
  return { overall, band: bandFor(overall), factors };
}

export type CESTResponses = Record<string, CESTAnswerOption>;

export interface CESTResponseDetail {
  questionId: string;
  factor: IR35Factor;
  answer: CESTAnswerOption;
  weight: number;
  contribution: number;
  caseLawRefs: readonly string[];
  esmRefs: readonly string[];
}

export interface CESTScoreResult {
  overall: number;
  band: IR35Band;
  factors: readonly FactorScore[];
  responses: readonly CESTResponseDetail[];
  answered: number;
  unclear: number;
  total: number;
}

export function scoreCest(responses: CESTResponses): CESTScoreResult {
  const factorTotals = new Map<
    IR35Factor,
    { positive: number; negative: number }
  >();
  const responseDetails: CESTResponseDetail[] = [];
  let answered = 0;
  let unclear = 0;

  for (const q of CEST_QUESTIONS) {
    const answer = responses[q.id];
    if (!answer) continue;
    answered++;

    let contribution = 0;
    if (answer === "unclear") {
      unclear++;
    } else if (answer === q.outsideAnswer) {
      contribution = q.weight;
    } else {
      contribution = -q.weight;
    }

    const totals = factorTotals.get(q.factor) ?? { positive: 0, negative: 0 };
    if (contribution > 0) totals.positive += contribution;
    if (contribution < 0) totals.negative += -contribution;
    factorTotals.set(q.factor, totals);

    responseDetails.push({
      questionId: q.id,
      factor: q.factor,
      answer,
      weight: q.weight,
      contribution,
      caseLawRefs: q.caseLawRefs ?? [],
      esmRefs: q.esmRefs ?? [],
    });
  }

  const { factors, totalContribution, totalWeight } =
    buildFactorScores(factorTotals);

  if (answered === 0) {
    return {
      overall: 50,
      band: "indeterminate",
      factors,
      responses: [],
      answered: 0,
      unclear: 0,
      total: CEST_QUESTIONS.length,
    };
  }

  // All-unclear has no signal. Without this branch, overall=50 falls in
  // bandFor's 30-54 range and renders as "borderline-inside".
  if (unclear === answered) {
    return {
      overall: 50,
      band: "indeterminate",
      factors,
      responses: responseDetails,
      answered,
      unclear,
      total: CEST_QUESTIONS.length,
    };
  }

  const overall =
    totalWeight === 0
      ? 50
      : Math.round(50 + (totalContribution / totalWeight) * 50);
  return {
    overall,
    band: bandFor(overall),
    factors,
    responses: responseDetails,
    answered,
    unclear,
    total: CEST_QUESTIONS.length,
  };
}
