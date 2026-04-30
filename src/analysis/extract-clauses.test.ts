import { describe, it, expect } from "vitest";
import { extractClauses } from "./extract-clauses";

function ids(text: string): string[] {
  return extractClauses(text).map((m) => m.pattern.id);
}

describe("extractClauses — basics", () => {
  it("returns empty array for empty input", () => {
    expect(extractClauses("")).toEqual([]);
  });

  it("returns empty array when nothing matches", () => {
    expect(extractClauses("This is just some unrelated prose.")).toEqual([]);
  });

  it("captures snippet context with offset and matched text", () => {
    const text =
      "Some preamble. The Consultant shall personally provide the Services. Trailing.";
    const matches = extractClauses(text);
    const m = matches.find((p) => p.pattern.id === "personal-service-required");
    expect(m).toBeDefined();
    expect(m!.snippets).toHaveLength(1);
    const snippet = m!.snippets[0]!;
    expect(snippet.offset).toBeGreaterThan(0);
    expect(snippet.context).toContain("Consultant");
    expect(snippet.matched.toLowerCase()).toContain("personally");
  });

  it("deduplicates identical-offset matches across multiple matchers per pattern", () => {
    const text = "The Consultant shall personally provide the Services.";
    const m = extractClauses(text).find(
      (p) => p.pattern.id === "personal-service-required",
    );
    const offsets = (m?.snippets ?? []).map((s) => s.offset);
    expect(new Set(offsets).size).toBe(offsets.length);
  });
});

describe("extractClauses — personal-service-required (audit-pass variants)", () => {
  it("matches '<role> shall personally'", () => {
    expect(ids("The Consultant shall personally provide.")).toContain(
      "personal-service-required",
    );
  });

  it("matches 'shall be performed personally' (added in audit pass 2)", () => {
    expect(ids("The Services shall be performed personally.")).toContain(
      "personal-service-required",
    );
  });

  it("matches 'personal service is required'", () => {
    expect(ids("Personal service is required.")).toContain(
      "personal-service-required",
    );
  });

  it("matches 'named individual'", () => {
    expect(ids("The named individual must perform.")).toContain(
      "personal-service-required",
    );
  });
});

describe("extractClauses — substitution-with-consent (audit pass 1)", () => {
  it("matches 'Client prior consent'", () => {
    expect(
      ids("No substitution permitted without the Client prior consent."),
    ).toContain("substitution-with-consent");
  });

  it("matches 'Client prior WRITTEN consent' (word between modifier and consent)", () => {
    expect(
      ids(
        "No substitution permitted without the Client prior written consent.",
      ),
    ).toContain("substitution-with-consent");
  });

  it("matches with 'permission' synonym", () => {
    expect(
      ids("Substitution requires the Client prior written permission."),
    ).toContain("substitution-with-consent");
  });

  it("matches with possessive apostrophe-s (the canonical contract phrasing)", () => {
    expect(
      ids(
        "Substitution requires the Client's prior written consent in writing.",
      ),
    ).toContain("substitution-with-consent");
  });
});

describe("extractClauses — client-premises-required (audit pass 1)", () => {
  it("matches with intervening text between verb and preposition", () => {
    expect(
      ids(
        "The Consultant shall work Monday to Friday, 9am to 5pm at the Client offices.",
      ),
    ).toContain("client-premises-required");
  });

  it("matches 'based at the Client premises' (audit pass 1 addition)", () => {
    expect(ids("The Consultant is based at the Client premises.")).toContain(
      "client-premises-required",
    );
  });
});

describe("extractClauses — client-controls-method (audit pass 2)", () => {
  it("matches 'as instructed by the line manager' (audit pass 2 addition)", () => {
    expect(
      ids(
        "The Consultant shall perform the work as instructed by the line manager.",
      ),
    ).toContain("client-controls-method");
  });

  it("matches 'in accordance with the Company procedures'", () => {
    expect(
      ids(
        "Work shall be carried out in accordance with the Company procedures.",
      ),
    ).toContain("client-controls-method");
  });

  it("matches the broader post-verb 'specify the method'", () => {
    expect(ids("The Client shall specify the method of work.")).toContain(
      "client-controls-method",
    );
  });
});

describe("extractClauses — false-positive guards (PR-review fixes)", () => {
  it("does NOT match 'shall NOT be provided exclusively' as exclusivity", () => {
    expect(
      ids(
        "The Services shall not be provided exclusively to the Client and the Consultant may serve other clients.",
      ),
    ).not.toContain("exclusivity-clause");
  });

  it("does NOT match 'we do not provide guaranteed work' as obligation-to-offer-work", () => {
    expect(ids("The Client does not provide guaranteed work.")).not.toContain(
      "obligation-to-offer-work",
    );
  });

  it("does NOT match '1 weeks notice' as long-notice-period (1 week is short)", () => {
    expect(
      ids("Either party may terminate on 1 weeks written notice."),
    ).not.toContain("long-notice-period");
  });

  it("DOES match '4 weeks notice' as long-notice-period (4+ weeks is long)", () => {
    expect(
      ids("Either party may terminate on 4 weeks written notice."),
    ).toContain("long-notice-period");
  });

  it("DOES match '12 weeks notice' as long-notice-period", () => {
    expect(
      ids("Either party may terminate on 12 weeks written notice."),
    ).toContain("long-notice-period");
  });

  it("does NOT match 'either party may substitute' as unfettered (no role)", () => {
    expect(
      ids("Either party may substitute the named representative."),
    ).not.toContain("unfettered-substitution");
  });

  it("DOES match 'Consultant may substitute' as unfettered (role present)", () => {
    expect(ids("The Consultant may substitute at its discretion.")).toContain(
      "unfettered-substitution",
    );
  });

  it("DOES match 'Consultant shall be entitled to substitute' as unfettered", () => {
    expect(
      ids("The Consultant shall be entitled to substitute at any time."),
    ).toContain("unfettered-substitution");
  });

  it("does NOT match bare 'office hours' without contractor context", () => {
    expect(
      ids("Visitors must arrive during office hours and sign in at reception."),
    ).not.toContain("fixed-working-hours");
  });

  it("DOES match 'Consultant works during core hours'", () => {
    expect(
      ids("The Consultant shall work during core hours each day."),
    ).toContain("fixed-working-hours");
  });
});

describe("extractClauses — Unicode normalisation (audit pass 3)", () => {
  it("matches 'Client's' with smart-quote apostrophe", () => {
    // The text has U+2019 (right single quotation mark) instead of ASCII '
    expect(
      ids(
        "Substitution requires the Client’s prior written consent in writing.",
      ),
    ).toContain("substitution-with-consent");
  });

  it("matches 'non‑compete' with non-breaking hyphen", () => {
    // U+2011 (non-breaking hyphen) instead of ASCII -
    expect(ids("The Consultant agrees to a non‑compete clause.")).toContain(
      "exclusivity-clause",
    );
  });
});

describe("extractClauses — directional sanity", () => {
  it("unfettered-substitution is direction=outside", () => {
    const matches = extractClauses(
      "The Consultant has an unfettered right of substitution.",
    );
    const m = matches.find((p) => p.pattern.id === "unfettered-substitution");
    expect(m).toBeDefined();
    expect(m!.pattern.direction).toBe("outside");
  });

  it("personal-service-required is direction=inside, severity=high", () => {
    const matches = extractClauses("The Consultant shall personally perform.");
    const m = matches.find((p) => p.pattern.id === "personal-service-required");
    expect(m).toBeDefined();
    expect(m!.pattern.direction).toBe("inside");
    expect(m!.pattern.severity).toBe("high");
  });

  it("fix-at-own-cost is direction=outside (the contractor good news)", () => {
    const matches = extractClauses(
      "The Consultant shall correct defective work at their own cost.",
    );
    const m = matches.find((p) => p.pattern.id === "fix-at-own-cost");
    expect(m).toBeDefined();
    expect(m!.pattern.direction).toBe("outside");
  });

  it("matches the audit-pass-2 'make good ... at no cost to the client' variant", () => {
    expect(
      ids(
        "The Consultant shall make good defective work at no cost to the client.",
      ),
    ).toContain("fix-at-own-cost");
  });
});
