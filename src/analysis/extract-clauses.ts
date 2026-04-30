import { CLAUSE_PATTERNS, type ClausePattern } from "../corpus/clause-patterns";

const CONTEXT_WINDOW_CHARS = 120;

export interface ClauseSnippet {
  context: string;
  matched: string;
  offset: number;
  length: number;
}

export interface ClauseMatch {
  pattern: ClausePattern;
  snippets: readonly ClauseSnippet[];
}

function withGlobalFlag(re: RegExp): RegExp {
  return re.flags.includes("g") ? re : new RegExp(re.source, re.flags + "g");
}

function buildSnippet(text: string, m: RegExpExecArray): ClauseSnippet {
  const start = Math.max(0, m.index - CONTEXT_WINDOW_CHARS);
  const end = Math.min(
    text.length,
    m.index + m[0].length + CONTEXT_WINDOW_CHARS,
  );
  return {
    context: text.slice(start, end),
    matched: m[0],
    offset: m.index,
    length: m[0].length,
  };
}

// Word-processed contracts ship smart quotes, NBSP, and Unicode hyphens
// that ASCII-only matchers don't recognise.
function normaliseContractText(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/ /g, " ");
}

export function extractClauses(rawText: string): readonly ClauseMatch[] {
  const text = normaliseContractText(rawText);
  const out: ClauseMatch[] = [];
  for (const pattern of CLAUSE_PATTERNS) {
    const snippets: ClauseSnippet[] = [];
    const seenOffsets = new Set<number>();
    for (const matcher of pattern.matchers) {
      const re = withGlobalFlag(matcher);
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        if (!seenOffsets.has(m.index)) {
          seenOffsets.add(m.index);
          snippets.push(buildSnippet(text, m));
        }
        if (m[0].length === 0) re.lastIndex++;
      }
    }
    if (snippets.length > 0) {
      snippets.sort((a, b) => a.offset - b.offset);
      // Drop snippets that overlap an earlier one — same clause matched by
      // multiple matchers in the same pattern.
      const deduped: ClauseSnippet[] = [];
      for (const s of snippets) {
        const last = deduped[deduped.length - 1];
        if (!last || s.offset >= last.offset + last.length) {
          deduped.push(s);
        }
      }
      out.push({ pattern, snippets: deduped });
    }
  }
  return out;
}
