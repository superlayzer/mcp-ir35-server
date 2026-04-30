import { SHARED_WIDGET_CSS } from "../widgets/shared-css";

export const ANALYZE_CONTRACT_WIDGET_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>IR35 Contract Analysis</title>
<style>
${SHARED_WIDGET_CSS}

.hero {
  text-align: center;
  padding: 24px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 18px;
}
.hero-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  margin-bottom: 8px;
}
.hero-score {
  font-size: 56px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  margin-bottom: 4px;
}
.hero-score.score-outside    { color: var(--outside); }
.hero-score.score-b-outside  { color: var(--b-outside); }
.hero-score.score-b-inside   { color: var(--b-inside); }
.hero-score.score-inside     { color: var(--inside); }
.hero-score.score-indeterminate { color: var(--indeterminate); }
.hero-band {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 4px;
}
.hero-band.band-outside    { background: color-mix(in srgb, var(--outside)   20%, transparent); color: var(--outside); }
.hero-band.band-b-outside  { background: color-mix(in srgb, var(--b-outside) 20%, transparent); color: var(--b-outside); }
.hero-band.band-b-inside   { background: color-mix(in srgb, var(--b-inside)  20%, transparent); color: var(--b-inside); }
.hero-band.band-inside     { background: color-mix(in srgb, var(--inside)    20%, transparent); color: var(--inside); }
.hero-band.band-indeterminate { background: var(--surface-2); color: var(--indeterminate); }
.hero-meta { color: var(--muted); font-size: 12px; margin-top: 10px; }

.factor-row {
  display: grid;
  grid-template-columns: 140px 1fr 48px;
  gap: 10px;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
}
.factor-name { text-transform: capitalize; color: var(--fg); }
.factor-bar {
  position: relative;
  height: 8px;
  background: var(--surface-2);
  border-radius: 4px;
  overflow: hidden;
}
.factor-bar-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  border-radius: 4px;
}
.factor-bar-fill.dir-inside  { background: var(--inside); }
.factor-bar-fill.dir-outside { background: var(--outside); }
.factor-bar-fill.dir-neutral { background: var(--indeterminate); opacity: 0.4; }
.factor-points {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--muted);
}
.factor-points.dir-inside  { color: var(--inside); }
.factor-points.dir-outside { color: var(--outside); }

.clauses-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
.clauses-count { color: var(--muted); font-size: 12px; }

.clause {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
}
.clause[open] { border-color: var(--border-strong); }
.clause summary {
  padding: 10px 12px;
  cursor: pointer;
  list-style: none;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  user-select: none;
}
.clause summary::-webkit-details-marker { display: none; }
.clause summary::after { content: "▾"; margin-left: auto; opacity: 0.5; transition: transform 0.15s; }
.clause[open] summary::after { transform: rotate(180deg); }
.clause-desc { flex: 1 1 100%; margin-top: 4px; font-weight: 500; }
@media (min-width: 480px) {
  .clause-desc { flex: 1 1 auto; margin-top: 0; }
}
.clause-body { padding: 0 12px 12px 12px; border-top: 1px solid var(--border); padding-top: 12px; }
.clause-body p { margin-bottom: 8px; font-size: 13px; }
.clause-body p strong { color: var(--fg); }
.clause-body p:last-child { margin-bottom: 0; }

.snippet {
  background: var(--surface-2);
  border-left: 3px solid var(--border-strong);
  border-radius: 0 6px 6px 0;
  padding: 8px 12px;
  margin: 8px 0;
  font-size: 12px;
}
.snippet-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  margin-bottom: 4px;
}
.snippet-text {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--fg);
}

.rewrite {
  background: color-mix(in srgb, var(--outside) 10%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--outside) 30%, var(--border));
  border-radius: 6px;
  padding: 8px 12px;
  margin: 8px 0;
  font-size: 12px;
}
.rewrite-label { color: var(--outside); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }

.case-refs {
  font-size: 12px;
  color: var(--muted);
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}
.case-chip {
  display: inline-block;
  padding: 2px 8px;
  background: var(--surface-2);
  border-radius: 4px;
  font-size: 11px;
  color: var(--fg);
}

.rewrite-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-strong);
  background: var(--surface-2);
  color: var(--fg);
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}
.rewrite-cta:hover { background: color-mix(in srgb, var(--accent) 15%, var(--surface-2)); }
.rewrite-cta:disabled { cursor: wait; opacity: 0.6; }

.rewrite-result {
  background: color-mix(in srgb, var(--accent) 8%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--border));
  border-radius: 6px;
  padding: 10px 12px;
  margin-top: 8px;
  font-size: 12px;
}
.rewrite-result-label { color: var(--accent); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
.rewrite-result-text { white-space: pre-wrap; color: var(--fg); }
.rewrite-result-meta { margin-top: 8px; padding-top: 8px; border-top: 1px solid color-mix(in srgb, var(--accent) 20%, var(--border)); color: var(--muted); font-size: 11px; }
.rewrite-result-meta strong { color: var(--fg); }

.empty {
  text-align: center;
  padding: 24px;
  color: var(--muted);
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: 8px;
  font-size: 13px;
}

.loading, .error {
  text-align: center;
  padding: 32px 16px;
  color: var(--muted);
  font-size: 13px;
}
.error { color: var(--inside); }
</style>
</head>
<body>
<div id="loading" class="loading">Analysing contract…</div>
<div id="error" class="error" hidden></div>
<div id="content" hidden>
  <details class="disclaimer">
    <summary>⚠ This analysis is general guidance — not legal advice</summary>
    <p id="disclaimer-text"></p>
  </details>

  <section class="hero">
    <div class="hero-label">IR35 Risk Score</div>
    <div id="score" class="hero-score">—</div>
    <div id="band" class="hero-band">—</div>
    <div id="meta" class="hero-meta">—</div>
  </section>

  <section>
    <h3>Factor breakdown</h3>
    <div id="factors"></div>
  </section>

  <section>
    <div class="clauses-header">
      <h3 style="margin: 0;">Clauses identified</h3>
      <span id="clauses-count" class="clauses-count"></span>
    </div>
    <div id="clauses"></div>
  </section>
</div>

<script>
(function () {
  function postToHost(msg) { window.parent.postMessage(msg, "*"); }

  function applyTheme(theme) { document.body.className = theme || "dark"; }

  var heightTimer;
  function reportHeight() {
    var h = document.documentElement.scrollHeight;
    postToHost({ jsonrpc: "2.0", method: "ui/notifications/size-changed", params: { height: h } });
  }
  function reportHeightDebounced() {
    clearTimeout(heightTimer);
    heightTimer = setTimeout(reportHeight, 50);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function bandClass(band) {
    var map = {
      "outside": "outside",
      "borderline-outside": "b-outside",
      "borderline-inside": "b-inside",
      "inside": "inside",
      "indeterminate": "indeterminate"
    };
    return map[band] || "indeterminate";
  }

  function bandLabel(band) {
    var map = {
      "outside": "Outside IR35",
      "borderline-outside": "Borderline · leans outside",
      "borderline-inside": "Borderline · leans inside",
      "inside": "Inside IR35",
      "indeterminate": "Insufficient signal"
    };
    return map[band] || band;
  }

  function formatFactor(name) { return name.replace(/-/g, " "); }

  function severityRank(s) { return { high: 3, medium: 2, low: 1 }[s] || 0; }

  function showError(msg) {
    document.getElementById("loading").hidden = true;
    var e = document.getElementById("error");
    e.hidden = false;
    e.textContent = msg;
    reportHeightDebounced();
  }

  function renderHero(data) {
    var s = data.score;
    var scoreEl = document.getElementById("score");
    scoreEl.textContent = s.band === "indeterminate" ? "?" : s.overall;
    scoreEl.className = "hero-score score-" + bandClass(s.band);

    var bandEl = document.getElementById("band");
    bandEl.textContent = bandLabel(s.band);
    bandEl.className = "hero-band band-" + bandClass(s.band);

    var n = data.matches.length;
    var meta = n + " clause" + (n === 1 ? "" : "s") + " identified · " + data.contractLength.toLocaleString() + " characters analysed";
    document.getElementById("meta").textContent = meta;
  }

  function renderFactors(data) {
    var html = data.score.factors.map(function (f) {
      var pct = f.weight === 0 ? 0 : Math.round((Math.abs(f.contribution) / f.weight) * 100);
      var dir = f.contribution > 0 ? "outside" : f.contribution < 0 ? "inside" : "neutral";
      var pointsLabel = f.contribution === 0 ? "—" : (f.contribution > 0 ? "+" : "") + Math.round(f.contribution);
      return [
        '<div class="factor-row">',
          '<div class="factor-name">', escapeHtml(formatFactor(f.factor)), '</div>',
          '<div class="factor-bar"><div class="factor-bar-fill dir-', dir, '" style="width:', pct, '%"></div></div>',
          '<div class="factor-points dir-', dir, '">', pointsLabel, '</div>',
        '</div>'
      ].join("");
    }).join("");
    document.getElementById("factors").innerHTML = html;
  }

  function renderClauses(data) {
    var countEl = document.getElementById("clauses-count");
    var listEl = document.getElementById("clauses");
    var n = data.matches.length;
    countEl.textContent = n + " found";

    if (n === 0) {
      listEl.innerHTML = '<div class="empty">No problematic clauses matched the corpus patterns. This may mean the contract is genuinely IR35-friendly, or the corpus did not recognise the language used.</div>';
      return;
    }

    var sorted = data.matches.slice().sort(function (a, b) {
      var sevDiff = severityRank(b.severity) - severityRank(a.severity);
      if (sevDiff !== 0) return sevDiff;
      return a.direction === "inside" ? -1 : 1;
    });

    listEl.innerHTML = sorted.map(function (m) {
      var snippet = m.snippets && m.snippets[0];
      var snippetHtml = snippet
        ? '<div class="snippet"><div class="snippet-label">From contract (offset ' + escapeHtml(String(snippet.offset)) + ')</div><div class="snippet-text">' + escapeHtml(snippet.context) + '</div></div>'
        : '';
      var rewriteHtml = m.saferRewrite
        ? '<div class="rewrite"><div class="rewrite-label">Safer alternative</div>' + escapeHtml(m.saferRewrite) + '</div>'
        : '';
      var caseHtml = (m.caseLawRefs && m.caseLawRefs.length > 0)
        ? '<div class="case-refs"><strong>Case law:</strong> ' + m.caseLawRefs.map(function (c) { return '<span class="case-chip">' + escapeHtml(c) + '</span>'; }).join("") + '</div>'
        : '';
      var ctaHtml = m.direction === "inside"
        ? '<button class="rewrite-cta" data-pattern-id="' + escapeHtml(m.patternId) + '">✨ Get rewrite via tool call</button>'
        : '';
      return [
        '<details class="clause">',
          '<summary>',
            '<span class="badge badge-', m.severity, '">', m.severity, '</span>',
            '<span class="badge badge-', m.direction, '">', m.direction, '</span>',
            '<span class="clause-desc">', escapeHtml(m.description), '</span>',
          '</summary>',
          '<div class="clause-body">',
            '<p><strong>Factor:</strong> ', escapeHtml(formatFactor(m.factor)), '</p>',
            '<p><strong>Why it matters:</strong> ', escapeHtml(m.whyMatters), '</p>',
            snippetHtml,
            rewriteHtml,
            caseHtml,
            ctaHtml,
          '</div>',
        '</details>'
      ].join("");
    }).join("");
  }

  function render(data) {
    document.getElementById("loading").hidden = true;
    document.getElementById("content").hidden = false;
    document.getElementById("disclaimer-text").textContent = data.disclaimer;
    renderHero(data);
    renderFactors(data);
    renderClauses(data);
    reportHeightDebounced();
  }

  var nextRequestId = 1;
  var pending = {};
  var REQUEST_TIMEOUT_MS = 30000;

  function call(method, params) {
    return new Promise(function (resolve, reject) {
      var id = nextRequestId++;
      var timer = setTimeout(function () {
        delete pending[id];
        reject(new Error("Host did not respond within 30s"));
      }, REQUEST_TIMEOUT_MS);
      pending[id] = {
        resolve: function (r) { clearTimeout(timer); resolve(r); },
        reject: function (e) { clearTimeout(timer); reject(e); },
      };
      postToHost({ jsonrpc: "2.0", id: id, method: method, params: params });
    });
  }

  function requestRewrite(btn, patternId) {
    btn.disabled = true;
    btn.textContent = "Loading…";
    call("ui/request-tool-call", {
      toolName: "suggest_clause_rewrite",
      arguments: { patternId: patternId }
    }).then(function (result) {
      try {
        var text = extractTextFromResult(result);
        if (!text) {
          var keys = result ? Object.keys(result).join(",") : "no result";
          throw new Error("No text. result keys: " + keys);
        }
        renderRewriteResult(btn, JSON.parse(text));
      } catch (err) {
        btn.disabled = false;
        btn.textContent = "Failed: " + err.message;
      }
    }).catch(function (err) {
      btn.disabled = false;
      btn.textContent = "Failed: " + (err.message || "try again");
    });
  }

  function renderRewriteResult(btn, payload) {
    var caseLawHtml = "";
    if (payload.caseLaw && payload.caseLaw.length > 0) {
      caseLawHtml = '<div class="rewrite-result-meta"><strong>Case law:</strong> '
        + payload.caseLaw.map(function (c) { return escapeHtml(c.name) + " " + escapeHtml(c.citation); }).join("; ")
        + '</div>';
    }
    var reasoningHtml = payload.reasoning
      ? '<div class="rewrite-result-meta"><strong>Reasoning:</strong> ' + escapeHtml(payload.reasoning) + '</div>'
      : "";
    var panel = document.createElement("div");
    panel.className = "rewrite-result";
    panel.innerHTML = [
      '<div class="rewrite-result-label">Suggested rewrite (via suggest_clause_rewrite tool)</div>',
      '<div class="rewrite-result-text">', escapeHtml(payload.suggestedRewrite), '</div>',
      reasoningHtml,
      caseLawHtml
    ].join("");
    btn.parentNode.insertBefore(panel, btn.nextSibling);
    btn.remove();
    reportHeightDebounced();
  }

  function extractTextFromResult(r) {
    if (!r) return null;
    // Different hosts wrap the tool result differently — try the known shapes
    // before giving up. Order is most-common to least-common.
    if (Array.isArray(r.content)) {
      var tc1 = r.content.find(function (c) { return c.type === "text"; });
      if (tc1 && typeof tc1.text === "string") return tc1.text;
    }
    if (r.result && Array.isArray(r.result.content)) {
      var tc2 = r.result.content.find(function (c) { return c.type === "text"; });
      if (tc2 && typeof tc2.text === "string") return tc2.text;
    }
    if (r.structuredContent) {
      return JSON.stringify(r.structuredContent);
    }
    if (typeof r.text === "string") return r.text;
    return null;
  }

  document.getElementById("clauses").addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".rewrite-cta");
    if (!btn || btn.disabled) return;
    var patternId = btn.getAttribute("data-pattern-id");
    if (patternId) requestRewrite(btn, patternId);
  });

  window.addEventListener("message", function (event) {
    var d = event.data;
    if (!d || d.jsonrpc !== "2.0") return;

    if (d.id !== undefined && pending[d.id]) {
      var p = pending[d.id];
      delete pending[d.id];
      if (d.error) p.reject(d.error);
      else p.resolve(d.result);
      return;
    }

    if (d.method === "ui/notifications/initialized") return;
    if (d.method === "ui/notifications/tool-input") return;

    if (d.method === "ui/notifications/host-context-changed") {
      if (d.params && d.params.theme) applyTheme(d.params.theme);
      return;
    }

    if (d.method === "ui/notifications/tool-result") {
      try {
        var content = (d.params.result && d.params.result.content) || d.params.content || [];
        var tc = content.find(function (c) { return c.type === "text"; });
        if (!tc) { showError("No text content in tool result"); return; }
        var data = JSON.parse(tc.text);
        render(data);
      } catch (err) {
        showError("Failed to parse analysis: " + err.message);
      }
      return;
    }
  });

  document.addEventListener("toggle", reportHeightDebounced, true);
  window.addEventListener("resize", reportHeightDebounced);

  call("ui/initialize", {
    protocolVersion: "2026-01-26",
    capabilities: {},
    clientInfo: { name: "ir35-analyze-contract-widget", version: "1.0.0" }
  }).then(function (result) {
    if (result && result.hostContext && result.hostContext.theme) applyTheme(result.hostContext.theme);
  }).catch(function () { /* init timeout — host not responsive; widget is read-only until tool-result arrives */ });
})();
</script>
</body>
</html>`;
