import { CEST_QUESTIONS } from "../corpus/cest-tree";
import { IR35_DISCLAIMER } from "../analysis/disclaimer";
import { SHARED_WIDGET_CSS } from "../widgets/shared-css";

const QUESTIONS_JSON = JSON.stringify(CEST_QUESTIONS);
const DISCLAIMER_JSON = JSON.stringify(IR35_DISCLAIMER);

export const CEST_CHECK_WIDGET_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>IR35 CEST Check</title>
<style>
${SHARED_WIDGET_CSS}

.cest-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--muted);
}
.cest-header strong { color: var(--fg); font-weight: 600; }

.progress-bar {
  height: 6px;
  background: var(--surface-2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 18px;
}
.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width 0.2s;
}

.question {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 14px;
}
.question-text {
  font-size: 15px;
  font-weight: 500;
  color: var(--fg);
  margin-bottom: 10px;
  line-height: 1.4;
}
.question-help {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 12px;
  padding: 8px 12px;
  background: var(--surface-2);
  border-radius: 6px;
  border-left: 3px solid var(--accent);
  line-height: 1.5;
}
.question-meta {
  font-size: 11px;
  color: var(--muted);
  margin-bottom: 6px;
}
.question-meta strong { color: var(--fg); }

.answers {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.answer-btn {
  flex: 1;
  min-width: 80px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-strong);
  background: var(--surface-2);
  color: var(--fg);
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.answer-btn:hover { background: color-mix(in srgb, var(--accent) 12%, var(--surface-2)); }
.answer-btn[aria-pressed="true"] {
  background: color-mix(in srgb, var(--accent) 30%, transparent);
  border-color: var(--accent);
  color: var(--accent);
}

.nav {
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
  gap: 8px;
}
.nav-btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-strong);
  background: var(--surface-2);
  color: var(--fg);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
}
.nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.nav-btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}
.nav-btn.primary:hover { filter: brightness(1.1); }

.question-jumper {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 14px;
  font-size: 11px;
}
.jumper-dot {
  width: 26px;
  height: 26px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}
.jumper-dot.answered {
  background: color-mix(in srgb, var(--accent) 25%, var(--surface));
  border-color: var(--accent);
  color: var(--accent);
}
.jumper-dot.current {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

.result-hero {
  text-align: center;
  padding: 24px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 18px;
}
.result-hero-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 8px; }
.result-hero-score { font-size: 56px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; margin-bottom: 4px; }
.result-hero-score.score-outside { color: var(--outside); }
.result-hero-score.score-b-outside { color: var(--b-outside); }
.result-hero-score.score-b-inside { color: var(--b-inside); }
.result-hero-score.score-inside { color: var(--inside); }
.result-hero-score.score-indeterminate { color: var(--indeterminate); }
.result-hero-band { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
.result-hero-band.band-outside { background: color-mix(in srgb, var(--outside) 20%, transparent); color: var(--outside); }
.result-hero-band.band-b-outside { background: color-mix(in srgb, var(--b-outside) 20%, transparent); color: var(--b-outside); }
.result-hero-band.band-b-inside { background: color-mix(in srgb, var(--b-inside) 20%, transparent); color: var(--b-inside); }
.result-hero-band.band-inside { background: color-mix(in srgb, var(--inside) 20%, transparent); color: var(--inside); }
.result-hero-band.band-indeterminate { background: var(--surface-2); color: var(--indeterminate); }
.result-hero-meta { color: var(--muted); font-size: 12px; margin-top: 10px; }

.factor-row { display: grid; grid-template-columns: 140px 1fr 48px; gap: 10px; align-items: center; padding: 6px 0; font-size: 13px; }
.factor-name { text-transform: capitalize; color: var(--fg); }
.factor-bar { position: relative; height: 8px; background: var(--surface-2); border-radius: 4px; overflow: hidden; }
.factor-bar-fill { position: absolute; top: 0; bottom: 0; left: 0; border-radius: 4px; }
.factor-bar-fill.dir-inside { background: var(--inside); }
.factor-bar-fill.dir-outside { background: var(--outside); }
.factor-bar-fill.dir-neutral { background: var(--indeterminate); opacity: 0.4; }
.factor-points { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; color: var(--muted); }
.factor-points.dir-inside { color: var(--inside); }
.factor-points.dir-outside { color: var(--outside); }

.result-actions { margin-top: 18px; display: flex; gap: 8px; }

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
<div id="app" class="loading">Loading…</div>

<script>
(function () {
  var QUESTIONS = ${QUESTIONS_JSON};
  var DISCLAIMER_TEXT = ${DISCLAIMER_JSON};
  var TOTAL = QUESTIONS.length;

  var state = {
    currentIndex: 0,
    responses: {},
    submitted: false,
    result: null
  };

  var nextRequestId = 100;
  var pending = {};
  var REQUEST_TIMEOUT_MS = 30000;

  function postToHost(msg) { window.parent.postMessage(msg, "*"); }

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

  function applyTheme(theme) { document.body.className = theme || "dark"; }

  var heightTimer;
  function reportHeight() {
    postToHost({ jsonrpc: "2.0", method: "ui/notifications/size-changed", params: { height: document.documentElement.scrollHeight } });
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
    var map = { "outside": "outside", "borderline-outside": "b-outside", "borderline-inside": "b-inside", "inside": "inside", "indeterminate": "indeterminate" };
    return map[band] || "indeterminate";
  }
  function bandLabel(band) {
    var map = { "outside": "Outside IR35", "borderline-outside": "Borderline · leans outside", "borderline-inside": "Borderline · leans inside", "inside": "Inside IR35", "indeterminate": "Insufficient signal" };
    return map[band] || band;
  }
  function formatFactor(name) { return name.replace(/-/g, " "); }

  function extractTextFromResult(r) {
    if (!r) return null;
    if (Array.isArray(r.content)) {
      var tc1 = r.content.find(function (c) { return c.type === "text"; });
      if (tc1 && typeof tc1.text === "string") return tc1.text;
    }
    if (r.result && Array.isArray(r.result.content)) {
      var tc2 = r.result.content.find(function (c) { return c.type === "text"; });
      if (tc2 && typeof tc2.text === "string") return tc2.text;
    }
    if (r.structuredContent) return JSON.stringify(r.structuredContent);
    if (typeof r.text === "string") return r.text;
    return null;
  }

  var saveTimer;
  function saveState() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      call("ui/state/set", { state: state }).catch(function () { /* silent — over-cap or host rejection */ });
    }, 200);
  }

  function restoreState(saved) {
    if (!saved || typeof saved !== "object") return;
    if (typeof saved.currentIndex === "number" && saved.currentIndex >= 0 && saved.currentIndex < TOTAL) {
      state.currentIndex = saved.currentIndex;
    }
    if (saved.responses && typeof saved.responses === "object") {
      state.responses = saved.responses;
    }
    if (saved.submitted === true) state.submitted = true;
    if (saved.result && typeof saved.result === "object") state.result = saved.result;
  }

  function findNextUnanswered(fromIndex) {
    for (var i = fromIndex; i < TOTAL; i++) {
      if (!state.responses[QUESTIONS[i].id]) return i;
    }
    return -1;
  }

  function selectAnswer(answer) {
    var q = QUESTIONS[state.currentIndex];
    state.responses[q.id] = answer;
    var next = findNextUnanswered(state.currentIndex + 1);
    if (next === -1) next = findNextUnanswered(0);
    if (next !== -1 && next !== state.currentIndex) state.currentIndex = next;
    saveState();
    render();
  }

  function navTo(index) {
    if (index < 0 || index >= TOTAL) return;
    state.currentIndex = index;
    saveState();
    render();
  }

  function reset() {
    state = { currentIndex: 0, responses: {}, submitted: false, result: null };
    saveState();
    render();
  }

  function reviewAnswers() {
    state.submitted = false;
    state.result = null;
    saveState();
    render();
  }

  function submitForScoring() {
    var btn = document.querySelector('[data-action="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = "Scoring…"; }
    call("ui/request-tool-call", {
      toolName: "cest_check",
      arguments: { responses: state.responses }
    }).then(function (result) {
      var text = extractTextFromResult(result);
      if (!text) {
        var keys = result ? Object.keys(result).join(",") : "no result";
        throw new Error("No text. result keys: " + keys);
      }
      state.submitted = true;
      state.result = JSON.parse(text);
      saveState();
      render();
    }).catch(function (err) {
      if (btn) { btn.disabled = false; btn.textContent = "Failed: " + (err.message || "try again"); }
    });
  }

  function renderQuestion() {
    var q = QUESTIONS[state.currentIndex];
    var answered = Object.keys(state.responses).length;
    var pct = Math.round((answered / TOTAL) * 100);
    var currentAnswer = state.responses[q.id] || null;

    var helpHtml = q.helpText ? '<div class="question-help">' + escapeHtml(q.helpText) + '</div>' : "";
    var caseLawHtml = q.caseLawRefs && q.caseLawRefs.length > 0
      ? '<div class="question-meta"><strong>Cases:</strong> ' + q.caseLawRefs.map(escapeHtml).join(", ") + '</div>'
      : "";
    var esmHtml = q.esmRefs && q.esmRefs.length > 0
      ? '<div class="question-meta"><strong>HMRC ESM:</strong> ' + q.esmRefs.map(escapeHtml).join(", ") + '</div>'
      : "";

    var canSubmit = answered === TOTAL;
    var nextHtml;
    if (canSubmit && state.currentIndex === TOTAL - 1) {
      nextHtml = '<button class="nav-btn primary" data-action="submit">Submit for scoring →</button>';
    } else {
      var disabled = state.currentIndex >= TOTAL - 1 ? " disabled" : "";
      nextHtml = '<button class="nav-btn primary" data-action="next"' + disabled + '>Next ›</button>';
    }

    var jumperHtml = QUESTIONS.map(function (qq, idx) {
      var classes = "jumper-dot";
      if (state.responses[qq.id]) classes += " answered";
      if (idx === state.currentIndex) classes += " current";
      return '<button class="' + classes + '" data-jump="' + idx + '" title="Q' + (idx + 1) + ': ' + escapeHtml(qq.text) + '">' + (idx + 1) + '</button>';
    }).join("");

    var html = [
      '<details class="disclaimer">',
        '<summary>⚠ This analysis is general guidance — not legal advice</summary>',
        '<p>', escapeHtml(DISCLAIMER_TEXT), '</p>',
      '</details>',

      '<div class="cest-header">',
        '<span><strong>Question ', (state.currentIndex + 1), '</strong> of ', TOTAL, '</span>',
        '<span>Factor: <strong>', escapeHtml(formatFactor(q.factor)), '</strong></span>',
      '</div>',
      '<div class="progress-bar"><div class="progress-fill" style="width:', pct, '%"></div></div>',

      '<div class="question">',
        '<div class="question-text">', escapeHtml(q.text), '</div>',
        helpHtml,
        caseLawHtml,
        esmHtml,
        '<div class="answers">',
          '<button class="answer-btn" data-answer="yes" aria-pressed="', currentAnswer === "yes" ? "true" : "false", '">Yes</button>',
          '<button class="answer-btn" data-answer="no" aria-pressed="', currentAnswer === "no" ? "true" : "false", '">No</button>',
          '<button class="answer-btn" data-answer="unclear" aria-pressed="', currentAnswer === "unclear" ? "true" : "false", '">Unclear</button>',
        '</div>',
      '</div>',

      '<div class="nav">',
        '<button class="nav-btn" data-action="prev"', state.currentIndex === 0 ? " disabled" : "", '>‹ Previous</button>',
        nextHtml,
      '</div>',

      '<div class="question-jumper">', jumperHtml, '</div>'
    ].join("");

    var app = document.getElementById("app");
    app.innerHTML = html;
    app.className = "";
  }

  function renderResult() {
    var r = state.result;
    var factorsHtml = (r.factors || []).map(function (f) {
      var pct = f.weight === 0 ? 0 : Math.round((Math.abs(f.contribution) / f.weight) * 100);
      var dir = f.contribution > 0 ? "outside" : f.contribution < 0 ? "inside" : "neutral";
      var pointsLabel = f.contribution === 0 ? "—" : (f.contribution > 0 ? "+" : "") + Math.round(f.contribution);
      return '<div class="factor-row">'
           + '<div class="factor-name">' + escapeHtml(formatFactor(f.factor)) + '</div>'
           + '<div class="factor-bar"><div class="factor-bar-fill dir-' + dir + '" style="width:' + pct + '%"></div></div>'
           + '<div class="factor-points dir-' + dir + '">' + pointsLabel + '</div>'
           + '</div>';
    }).join("");

    var html = [
      '<details class="disclaimer">',
        '<summary>⚠ This analysis is general guidance — not legal advice</summary>',
        '<p>', escapeHtml(DISCLAIMER_TEXT), '</p>',
      '</details>',

      '<section class="result-hero">',
        '<div class="result-hero-label">CEST-Style IR35 Result</div>',
        '<div class="result-hero-score score-', bandClass(r.band), '">', r.band === "indeterminate" ? "?" : r.overall, '</div>',
        '<div class="result-hero-band band-', bandClass(r.band), '">', bandLabel(r.band), '</div>',
        '<div class="result-hero-meta">', r.answered, ' of ', r.total, ' answered',
          r.unclear > 0 ? ' · ' + r.unclear + ' unclear' : '',
        '</div>',
      '</section>',

      '<section><h3>Factor breakdown</h3>', factorsHtml, '</section>',

      '<div class="result-actions">',
        '<button class="nav-btn" data-action="review">‹ Review answers</button>',
        '<button class="nav-btn" data-action="reset">↺ Start over</button>',
      '</div>'
    ].join("");

    var app = document.getElementById("app");
    app.innerHTML = html;
    app.className = "";
  }

  function render() {
    if (state.submitted && state.result) renderResult();
    else renderQuestion();
    reportHeightDebounced();
  }

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
    if (d.method === "ui/notifications/tool-input") {
      // Seed responses from the tool's input args so an LLM-pre-filled call
      // shows up as already-answered. Persisted state still wins.
      try {
        var args = d.params && (d.params.input || d.params.arguments || d.params);
        if (args && args.responses && typeof args.responses === "object") {
          var seeded = false;
          for (var qid in args.responses) {
            if (!state.responses[qid]) {
              var v = args.responses[qid];
              if (v === "yes" || v === "no" || v === "unclear") {
                state.responses[qid] = v;
                seeded = true;
              }
            }
          }
          if (seeded) {
            var firstUnanswered = findNextUnanswered(0);
            if (firstUnanswered !== -1) state.currentIndex = firstUnanswered;
            saveState();
            render();
          }
        }
      } catch (err) { /* silent — seeding is best-effort */ }
      return;
    }
    if (d.method === "ui/notifications/host-context-changed") {
      if (d.params && d.params.theme) applyTheme(d.params.theme);
      return;
    }
    if (d.method === "ui/notifications/tool-result") {
      // Render only when complete (answered === total). Includes all-unclear
      // (band="indeterminate" but every question answered).
      try {
        var content = (d.params && d.params.result && d.params.result.content) || (d.params && d.params.content) || [];
        var tc = content.find(function (c) { return c.type === "text"; });
        if (tc) {
          var payload = JSON.parse(tc.text);
          if (payload && payload.answered === payload.total) {
            state.submitted = true;
            state.result = payload;
            saveState();
            render();
          }
        }
      } catch (err) { /* silent — fall through to whatever state we restored */ }
      return;
    }
  });

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.dataset) return;

    if (t.classList.contains("answer-btn") && t.dataset.answer) {
      selectAnswer(t.dataset.answer);
      return;
    }
    if (t.classList.contains("jumper-dot") && t.dataset.jump !== undefined) {
      navTo(parseInt(t.dataset.jump, 10));
      return;
    }

    var action = t.dataset.action;
    if (!action) return;
    if (action === "prev") navTo(state.currentIndex - 1);
    else if (action === "next") navTo(state.currentIndex + 1);
    else if (action === "submit") submitForScoring();
    else if (action === "reset") reset();
    else if (action === "review") reviewAnswers();
  });

  document.addEventListener("toggle", reportHeightDebounced, true);
  window.addEventListener("resize", reportHeightDebounced);

  call("ui/initialize", {
    protocolVersion: "2026-01-26",
    capabilities: {},
    clientInfo: { name: "ir35-cest-check-widget", version: "1.0.0" }
  }).then(function (result) {
    if (result && result.hostContext && result.hostContext.theme) applyTheme(result.hostContext.theme);
    return call("ui/state/get", {}).catch(function () { return null; });
  }).then(function (r) {
    if (r && r.state) restoreState(r.state);
    render();
  }).catch(function (err) {
    var app = document.getElementById("app");
    app.className = "error";
    app.textContent = "Init failed: " + (err && err.message || JSON.stringify(err));
    reportHeightDebounced();
  });
})();
</script>
</body>
</html>`;
