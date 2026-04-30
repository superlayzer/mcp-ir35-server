import { describe, it, expect } from "vitest";
import { scoreCest, scoreMatches, type CESTResponses } from "./score";

describe("scoreMatches", () => {
  it("returns indeterminate when no matches", () => {
    const r = scoreMatches([]);
    expect(r.band).toBe("indeterminate");
    expect(r.overall).toBe(50);
    expect(r.factors.length).toBeGreaterThan(0);
    for (const f of r.factors) {
      expect(f.contribution).toBe(0);
    }
  });
});

describe("scoreCest — banding edge cases", () => {
  it("returns indeterminate when no responses", () => {
    const r = scoreCest({});
    expect(r.band).toBe("indeterminate");
    expect(r.answered).toBe(0);
    expect(r.unclear).toBe(0);
    expect(r.overall).toBe(50);
  });

  it("returns indeterminate when EVERY answer is unclear", () => {
    const responses: CESTResponses = {
      "substitution-right": "unclear",
      "control-what": "unclear",
      "moo-offer": "unclear",
      "financial-risk-correction": "unclear",
    };
    const r = scoreCest(responses);
    expect(r.band).toBe("indeterminate");
    expect(r.answered).toBe(4);
    expect(r.unclear).toBe(4);
    expect(r.responses).toHaveLength(4);
  });

  it("does NOT return indeterminate when mixing real and unclear answers", () => {
    const responses: CESTResponses = {
      "substitution-right": "yes",
      "control-what": "unclear",
    };
    const r = scoreCest(responses);
    expect(r.band).not.toBe("indeterminate");
    expect(r.answered).toBe(2);
    expect(r.unclear).toBe(1);
  });

  it("ignores unknown question ids without crashing", () => {
    const responses: CESTResponses = {
      "substitution-right": "yes",
      "this-question-does-not-exist": "yes",
    };
    const r = scoreCest(responses);
    expect(r.answered).toBe(1);
  });
});

describe("scoreCest — directional behavior", () => {
  it("strongly outside-leaning answers produce 'outside' band", () => {
    const responses: CESTResponses = {
      "substitution-right": "yes",
      "substitution-exercised": "yes",
      "substitute-payment": "yes",
      "control-what": "no",
      "control-how": "no",
      "moo-offer": "no",
      "financial-risk-correction": "yes",
      "multiple-clients": "yes",
    };
    const r = scoreCest(responses);
    expect(r.band).toBe("outside");
    expect(r.overall).toBeGreaterThanOrEqual(75);
  });

  it("strongly inside-leaning answers produce 'inside' band", () => {
    const responses: CESTResponses = {
      "substitution-right": "no",
      "substitution-exercised": "no",
      "control-what": "yes",
      "control-how": "yes",
      "control-when": "yes",
      "moo-offer": "yes",
      exclusivity: "no",
      "part-and-parcel": "no",
    };
    const r = scoreCest(responses);
    expect(r.band).toBe("inside");
    expect(r.overall).toBeLessThan(30);
  });

  it("returns per-question contribution details", () => {
    const r = scoreCest({ "substitution-right": "yes" });
    expect(r.responses).toHaveLength(1);
    const detail = r.responses[0];
    expect(detail).toBeDefined();
    expect(detail?.questionId).toBe("substitution-right");
    expect(detail?.answer).toBe("yes");
    expect(detail?.contribution).toBeGreaterThan(0);
  });
});
