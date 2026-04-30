import { describe, it, expect } from "vitest";
import {
  buildSdsMarkdown,
  isPlaceholder,
  isValidIsoDate,
  sanitizeDate,
  sanitizeText,
} from "./generate-sds";

describe("isPlaceholder — values that should be REJECTED", () => {
  const cases = [
    "TBD",
    "tbd",
    "T.B.D.",
    "  TBD  ",
    "TBA",
    "N/A",
    "n/a",
    "na",
    "none",
    "null",
    "undefined",
    "todo",
    "to be determined",
    "to be confirmed",
    "to be advised",
    "to be filled",
    "to be completed",
    "client name",
    "Client Name",
    "worker name",
    "Consultant Name",
    "<name>",
    "<engagement description>",
    "[Name]",
    "[Worker]",
    "?",
    "???",
    "---",
    "This is placeholder text for the field.",
    "Lorem ipsum dolor sit amet",
  ];

  it.each(cases)("isPlaceholder(%j) === true", (input) => {
    expect(isPlaceholder(input)).toBe(true);
  });
});

describe("isPlaceholder — legitimate values that should pass through", () => {
  const cases = [
    "Acme Consulting Ltd",
    "BigCo plc",
    "Sky", // short but legitimate
    "ABC", // short but legitimate
    "6-month senior data engineer engagement on the customer-data platform",
    "Jane Doe, Head of Engineering",
    "The contract includes an unfettered right of substitution and the contractor controls the manner of work.",
    "TBD Industries Ltd",
    "The consultant's name is Jane Doe.",
  ];

  it.each(cases)("isPlaceholder(%j) === false", (input) => {
    expect(isPlaceholder(input)).toBe(false);
  });
});

describe("isPlaceholder — falsy inputs", () => {
  it("undefined → false (treats as 'no value supplied' rather than 'placeholder supplied')", () => {
    expect(isPlaceholder(undefined)).toBe(false);
  });

  it("null → false", () => {
    expect(isPlaceholder(null)).toBe(false);
  });

  it("empty string → false", () => {
    expect(isPlaceholder("")).toBe(false);
  });
});

describe("isValidIsoDate — accepts well-formed ISO YYYY-MM-DD", () => {
  it.each([
    "2026-05-01",
    "2024-01-01",
    "1999-12-31",
    "2000-02-29", // leap year
  ])("isValidIsoDate(%j) === true", (input) => {
    expect(isValidIsoDate(input)).toBe(true);
  });
});

describe("isValidIsoDate — rejects malformed / impossible / placeholder", () => {
  it.each([
    "TBD",
    "tomorrow",
    "next week",
    "01/05/2026", // wrong format
    "2026/05/01",
    "2026-5-1", // missing zero-pad
    "2026-13-01", // impossible month
    "2026-02-30", // impossible day for Feb
    "2023-02-29", // not a leap year
    "26-05-01", // 2-digit year
    "",
    "  2026-05-01  ",
  ])("isValidIsoDate(%j) === false", (input) => {
    expect(isValidIsoDate(input)).toBe(false);
  });

  it("undefined → false", () => {
    expect(isValidIsoDate(undefined)).toBe(false);
  });

  it("null → false", () => {
    expect(isValidIsoDate(null)).toBe(false);
  });
});

describe("sanitizeText — trims and rejects unusable inputs", () => {
  it("returns undefined and DOES NOT push when input is undefined", () => {
    const rejected: string[] = [];
    expect(sanitizeText(undefined, "worker", rejected)).toBeUndefined();
    expect(rejected).toEqual([]);
  });

  it.each(["", "   ", "\t", "\n", " \t\n "])(
    "rejects whitespace-only %j",
    (input) => {
      const rejected: string[] = [];
      expect(sanitizeText(input, "worker", rejected)).toBeUndefined();
      expect(rejected).toEqual(["worker"]);
    },
  );

  it("rejects placeholders even after trimming", () => {
    const rejected: string[] = [];
    expect(sanitizeText("  TBD  ", "client", rejected)).toBeUndefined();
    expect(rejected).toEqual(["client"]);
  });

  it("returns the trimmed value for legitimate input", () => {
    const rejected: string[] = [];
    expect(sanitizeText("  Acme Ltd  ", "worker", rejected)).toBe("Acme Ltd");
    expect(rejected).toEqual([]);
  });
});

describe("sanitizeDate — trims, rejects placeholders + bad ISO", () => {
  it("returns undefined and DOES NOT push when input is undefined", () => {
    const rejected: string[] = [];
    expect(sanitizeDate(undefined, "effectiveDate", rejected)).toBeUndefined();
    expect(rejected).toEqual([]);
  });

  it("accepts and returns a trimmed valid ISO date", () => {
    const rejected: string[] = [];
    expect(sanitizeDate("  2026-05-01  ", "effectiveDate", rejected)).toBe(
      "2026-05-01",
    );
    expect(rejected).toEqual([]);
  });

  it.each(["", "   ", "TBD", "tomorrow", "2026-13-01", "01/05/2026"])(
    "rejects %j",
    (input) => {
      const rejected: string[] = [];
      expect(sanitizeDate(input, "effectiveDate", rejected)).toBeUndefined();
      expect(rejected).toEqual(["effectiveDate"]);
    },
  );
});

describe("buildSdsMarkdown — output shape", () => {
  const fixture = {
    worker: "Acme Consulting Ltd",
    client: "BigCo plc",
    engagement: "6-month senior data engineer engagement",
    status: "outside" as const,
    reasoning:
      "The contract includes an unfettered right of substitution and the contractor determines the manner of work.",
    effectiveDate: "2026-05-01",
    issuedBy: "Jane Doe, Head of Engineering",
    issuedDate: "2026-04-30",
  };

  it("includes every required statutory section", () => {
    const md = buildSdsMarkdown(fixture);
    expect(md).toContain("# Status Determination Statement");
    expect(md).toContain("Chapter 10 of Part 2");
    expect(md).toContain("## Engagement details");
    expect(md).toContain("## Determination");
    expect(md).toContain("## Reasons for the determination");
    expect(md).toContain("## Right to dispute");
    expect(md).toContain("## Issued by");
  });

  it("includes the supplied field values", () => {
    const md = buildSdsMarkdown(fixture);
    expect(md).toContain(fixture.worker);
    expect(md).toContain(fixture.client);
    expect(md).toContain(fixture.engagement);
    expect(md).toContain(fixture.reasoning);
    expect(md).toContain(fixture.effectiveDate);
    expect(md).toContain(fixture.issuedBy);
    expect(md).toContain(fixture.issuedDate);
  });

  it("renders OUTSIDE label for outside status", () => {
    const md = buildSdsMarkdown({ ...fixture, status: "outside" });
    expect(md).toContain("OUTSIDE IR35");
    expect(md).not.toContain("INSIDE IR35");
  });

  it("renders INSIDE label for inside status", () => {
    const md = buildSdsMarkdown({ ...fixture, status: "inside" });
    expect(md).toContain("INSIDE IR35");
    expect(md).not.toContain("OUTSIDE IR35");
  });

  it("mentions the 45-day dispute response window", () => {
    const md = buildSdsMarkdown(fixture);
    expect(md).toContain("45 days");
  });
});
