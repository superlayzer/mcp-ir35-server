import { describe, it, expect } from "vitest";
import { CASE_LAW } from "./case-law";
import { ESM_EXCERPTS } from "./esm-excerpts";
import { CEST_QUESTIONS } from "./cest-tree";
import { CLAUSE_PATTERNS } from "./clause-patterns";

describe("corpus referential integrity", () => {
  const caseIds = new Set(CASE_LAW.map((c) => c.id));
  const esmRefs = new Set(ESM_EXCERPTS.map((e) => e.ref));

  it("every clause-pattern caseLawRef resolves to a case", () => {
    const broken: Array<{ pattern: string; ref: string }> = [];
    for (const p of CLAUSE_PATTERNS) {
      for (const ref of p.caseLawRefs ?? []) {
        if (!caseIds.has(ref)) broken.push({ pattern: p.id, ref });
      }
    }
    expect(broken).toEqual([]);
  });

  it("every CEST question caseLawRef resolves to a case", () => {
    const broken: Array<{ question: string; ref: string }> = [];
    for (const q of CEST_QUESTIONS) {
      for (const ref of q.caseLawRefs ?? []) {
        if (!caseIds.has(ref)) broken.push({ question: q.id, ref });
      }
    }
    expect(broken).toEqual([]);
  });

  it("every CEST question esmRef resolves to an ESM excerpt", () => {
    const broken: Array<{ question: string; ref: string }> = [];
    for (const q of CEST_QUESTIONS) {
      for (const ref of q.esmRefs ?? []) {
        if (!esmRefs.has(ref)) broken.push({ question: q.id, ref });
      }
    }
    expect(broken).toEqual([]);
  });
});

describe("corpus uniqueness", () => {
  it("case ids are unique", () => {
    const ids = CASE_LAW.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("CEST question ids are unique", () => {
    const ids = CEST_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("clause pattern ids are unique", () => {
    const ids = CLAUSE_PATTERNS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ESM refs are unique", () => {
    const refs = ESM_EXCERPTS.map((e) => e.ref);
    expect(new Set(refs).size).toBe(refs.length);
  });
});

describe("corpus shape", () => {
  it("every case record has a non-empty citation, holding and relevance", () => {
    for (const c of CASE_LAW) {
      expect(c.citation.trim()).not.toBe("");
      expect(c.holding.trim()).not.toBe("");
      expect(c.relevance.trim()).not.toBe("");
    }
  });

  it("every CEST question has a positive weight", () => {
    for (const q of CEST_QUESTIONS) {
      expect(q.weight).toBeGreaterThan(0);
    }
  });

  it("every clause pattern has at least one matcher", () => {
    for (const p of CLAUSE_PATTERNS) {
      expect(p.matchers.length).toBeGreaterThan(0);
    }
  });
});
