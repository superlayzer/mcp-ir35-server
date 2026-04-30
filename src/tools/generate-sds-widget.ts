import { IR35_DISCLAIMER } from "../analysis/disclaimer";
import { SHARED_WIDGET_CSS } from "../widgets/shared-css";

const DISCLAIMER_JSON = JSON.stringify(IR35_DISCLAIMER);

export const GENERATE_SDS_WIDGET_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>IR35 SDS Builder</title>
<style>
${SHARED_WIDGET_CSS}

.form-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 14px;
}

.field {
  display: block;
  margin-bottom: 14px;
}
.field-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 6px;
}
.field-hint { font-size: 11px; color: var(--muted); margin-top: 4px; }
.field input, .field textarea, .field select {
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-strong);
  background: var(--surface-2);
  color: var(--fg);
  font-size: 13px;
  font-family: inherit;
  line-height: 1.4;
  resize: vertical;
}
.field input:focus, .field textarea:focus, .field select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 25%, transparent);
}
.field textarea { min-height: 110px; }

.status-group { display: flex; gap: 8px; }
.status-option {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-strong);
  background: var(--surface-2);
  color: var(--fg);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  text-align: center;
}
.status-option[aria-pressed="true"][data-status="outside"] {
  background: color-mix(in srgb, var(--outside) 25%, transparent);
  border-color: var(--outside);
  color: var(--outside);
}
.status-option[aria-pressed="true"][data-status="inside"] {
  background: color-mix(in srgb, var(--inside) 25%, transparent);
  border-color: var(--inside);
  color: var(--inside);
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 16px;
}
.btn {
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid var(--border-strong);
  background: var(--surface-2);
  color: var(--fg);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}
.btn.primary:hover:not(:disabled) { filter: brightness(1.1); }

.field-error { color: var(--inside); font-size: 11px; margin-top: 4px; }

.sds-doc {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 14px;
  font-size: 13px;
  line-height: 1.6;
}
.sds-doc h2 {
  font-size: 18px;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--border-strong);
  color: var(--fg);
  text-transform: none;
  letter-spacing: 0;
}
.sds-doc h3 {
  font-size: 14px;
  margin-top: 16px;
  margin-bottom: 8px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.sds-doc h4 {
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 8px;
  color: var(--fg);
  text-transform: none;
  letter-spacing: 0;
}
.sds-doc h4.status-outside { color: var(--outside); }
.sds-doc h4.status-inside { color: var(--inside); }
.sds-doc p { margin-bottom: 10px; color: var(--fg); }
.sds-doc p strong { color: var(--fg); font-weight: 600; }
.sds-doc em { font-style: italic; color: var(--muted); }

.copy-feedback { font-size: 11px; color: var(--outside); margin-left: 8px; }

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
  var DISCLAIMER_TEXT = ${DISCLAIMER_JSON};

  var state = {
    form: {
      worker: "",
      client: "",
      engagement: "",
      status: "",
      reasoning: "",
      effectiveDate: "",
      issuedBy: "",
      issuedDate: ""
    },
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
      // sdsMarkdown can exceed the 8 KB ui/state cap; the host then rejects
      // the WHOLE state, losing form values too. Slim payload only.
      var slim = { form: state.form, submitted: state.submitted };
      call("ui/state/set", { state: slim }).catch(function () { /* silent */ });
    }, 250);
  }

  function restoreState(saved) {
    if (!saved || typeof saved !== "object") return;
    if (saved.form && typeof saved.form === "object") {
      var keys = Object.keys(state.form);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (typeof saved.form[k] === "string") state.form[k] = saved.form[k];
      }
    }
    if (saved.submitted === true) state.submitted = true;
    // result is intentionally not persisted (see saveState).
  }

  function todayUTC() {
    return new Date().toISOString().slice(0, 10);
  }

  function renderMarkdown(md) {
    var lines = md.split("\\n");
    var out = [];
    var inPara = false;
    function closePara() {
      if (inPara) { out.push("</p>"); inPara = false; }
    }
    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      var line = raw.trim();
      if (line === "") { closePara(); continue; }

      var m = line.match(/^(#{1,4})\\s+(.+)$/);
      if (m) {
        closePara();
        var depth = m[1].length;
        var text = m[2];
        if (depth === 3) {
          var statusClass = "";
          if (/INSIDE\\s+IR35/i.test(text)) statusClass = ' class="status-inside"';
          else if (/OUTSIDE\\s+IR35/i.test(text)) statusClass = ' class="status-outside"';
          out.push('<h4' + statusClass + '>' + renderInline(text) + '</h4>');
        } else {
          var tagName = depth === 1 ? "h2" : depth === 2 ? "h3" : "h4";
          out.push('<' + tagName + '>' + renderInline(text) + '</' + tagName + '>');
        }
        continue;
      }

      if (!inPara) { out.push("<p>"); inPara = true; }
      else { out.push("<br>"); }
      out.push(renderInline(line));
    }
    closePara();
    return out.join("");
  }

  function renderInline(text) {
    var s = escapeHtml(text);
    s = s.replace(/\\*\\*(.+?)\\*\\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|\\s)_([^_]+)_(?=\\s|$|[.,;:!?])/g, "$1<em>$2</em>");
    return s;
  }

  function setField(name, value) {
    if (!(name in state.form)) return;
    state.form[name] = value;
    saveState();
  }

  function isFormComplete() {
    var f = state.form;
    return !!(f.worker && f.client && f.engagement && f.status && f.reasoning && f.effectiveDate && f.issuedBy);
  }

  function submitSds() {
    var btn = document.querySelector('[data-action="generate"]');
    if (btn) { btn.disabled = true; btn.textContent = "Generating…"; }
    var args = Object.assign({}, state.form);
    if (!args.issuedDate) args.issuedDate = todayUTC();
    call("ui/request-tool-call", { toolName: "generate_sds", arguments: args })
      .then(function (result) {
        var text = extractTextFromResult(result);
        if (!text) {
          var keys = result ? Object.keys(result).join(",") : "no result";
          throw new Error("No text. result keys: " + keys);
        }
        var payload = JSON.parse(text);
        if (!payload.ready) throw new Error(payload.message || "Tool returned unready payload");
        state.submitted = true;
        state.result = payload;
        saveState();
        render();
      })
      .catch(function (err) {
        if (btn) { btn.disabled = false; btn.textContent = "Failed: " + (err.message || "try again"); }
      });
  }

  function editAgain() {
    state.submitted = false;
    state.result = null;
    saveState();
    render();
  }

  function reset() {
    state = {
      form: { worker: "", client: "", engagement: "", status: "", reasoning: "", effectiveDate: "", issuedBy: "", issuedDate: "" },
      submitted: false,
      result: null
    };
    saveState();
    render();
  }

  function copyMarkdown() {
    if (!state.result || !state.result.sdsMarkdown) return;
    var fb = document.getElementById("copy-feedback");
    var text = state.result.sdsMarkdown;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { if (fb) { fb.textContent = "Copied ✓"; setTimeout(function () { fb.textContent = ""; }, 2000); } },
        function () { fallbackCopy(text, fb); }
      );
    } else {
      fallbackCopy(text, fb);
    }
  }

  function fallbackCopy(text, fb) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); if (fb) { fb.textContent = "Copied ✓"; setTimeout(function () { fb.textContent = ""; }, 2000); } }
    catch (e) { if (fb) { fb.textContent = "Copy failed"; } }
    document.body.removeChild(ta);
  }

  function renderForm() {
    var f = state.form;
    var ready = isFormComplete();
    var html = [
      '<details class="disclaimer">',
        '<summary>⚠ This analysis is general guidance — not legal advice</summary>',
        '<p>', escapeHtml(DISCLAIMER_TEXT), '</p>',
      '</details>',

      '<h3>Status Determination Statement builder</h3>',

      '<div class="form-card">',
        '<label class="field">',
          '<span class="field-label">Worker / Personal Service Company</span>',
          '<input type="text" data-field="worker" value="', escapeHtml(f.worker), '" placeholder="e.g. Acme Consulting Ltd">',
        '</label>',

        '<label class="field">',
          '<span class="field-label">Client (engager)</span>',
          '<input type="text" data-field="client" value="', escapeHtml(f.client), '" placeholder="e.g. BigCo plc">',
        '</label>',

        '<label class="field">',
          '<span class="field-label">Engagement</span>',
          '<input type="text" data-field="engagement" value="', escapeHtml(f.engagement), '" placeholder="e.g. 6-month senior data engineer engagement on the customer-data platform">',
        '</label>',

        '<label class="field">',
          '<span class="field-label">Effective date</span>',
          '<input type="date" data-field="effectiveDate" value="', escapeHtml(f.effectiveDate), '">',
        '</label>',

        '<div class="field">',
          '<span class="field-label">Status conclusion</span>',
          '<div class="status-group">',
            '<button class="status-option" data-status="outside" data-field="status" aria-pressed="', f.status === "outside" ? "true" : "false", '">Outside IR35</button>',
            '<button class="status-option" data-status="inside" data-field="status" aria-pressed="', f.status === "inside" ? "true" : "false", '">Inside IR35</button>',
          '</div>',
        '</div>',

        '<label class="field">',
          '<span class="field-label">Reasons for the determination</span>',
          '<textarea data-field="reasoning" placeholder="Describe the contractual terms and working practices that led to the determination. Reference specific factors: substitution, control, MOO, financial risk, etc.">', escapeHtml(f.reasoning), '</textarea>',
          '<span class="field-hint">Typically 200-500 words. The end-client must take reasonable care in reaching the determination.</span>',
        '</label>',

        '<label class="field">',
          '<span class="field-label">Issued by</span>',
          '<input type="text" data-field="issuedBy" value="', escapeHtml(f.issuedBy), '" placeholder="e.g. Jane Doe, Head of Engineering">',
        '</label>',
      '</div>',

      '<div class="actions">',
        '<button class="btn" data-action="reset">↺ Reset</button>',
        '<button class="btn primary" data-action="generate"', ready ? "" : " disabled", '>Generate SDS →</button>',
      '</div>'
    ].join("");

    var app = document.getElementById("app");
    app.innerHTML = html;
    app.className = "";
  }

  function renderResult() {
    var r = state.result;
    var rendered = renderMarkdown(r.sdsMarkdown);
    var html = [
      '<details class="disclaimer">',
        '<summary>⚠ This analysis is general guidance — not legal advice</summary>',
        '<p>', escapeHtml(DISCLAIMER_TEXT), '</p>',
      '</details>',

      '<div class="sds-doc">', rendered, '</div>',

      '<div class="actions">',
        '<button class="btn" data-action="edit">‹ Edit</button>',
        '<div>',
          '<button class="btn primary" data-action="copy">Copy markdown</button>',
          '<span id="copy-feedback" class="copy-feedback"></span>',
        '</div>',
      '</div>'
    ].join("");

    var app = document.getElementById("app");
    app.innerHTML = html;
    app.className = "";
  }

  function render() {
    if (state.submitted && state.result && state.result.sdsMarkdown) renderResult();
    else renderForm();
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
      try {
        var args = d.params && (d.params.input || d.params.arguments || d.params);
        if (args && typeof args === "object") {
          var seeded = false;
          var fields = ["worker", "client", "engagement", "status", "reasoning", "effectiveDate", "issuedBy", "issuedDate"];
          for (var i = 0; i < fields.length; i++) {
            var k = fields[i];
            if (typeof args[k] === "string" && args[k] && !state.form[k]) {
              state.form[k] = args[k];
              seeded = true;
            }
          }
          if (seeded) { saveState(); render(); }
        }
      } catch (err) { /* silent */ }
      return;
    }
    if (d.method === "ui/notifications/host-context-changed") {
      if (d.params && d.params.theme) applyTheme(d.params.theme);
      return;
    }
    if (d.method === "ui/notifications/tool-result") {
      // If the tool was called directly with all required fields, render the
      // generated document. Partial calls return ready=false; in that case
      // fall through and the widget renders the form.
      try {
        var content = (d.params && d.params.result && d.params.result.content) || (d.params && d.params.content) || [];
        var tc = content.find(function (c) { return c.type === "text"; });
        if (tc) {
          var payload = JSON.parse(tc.text);
          if (payload && payload.ready === true && payload.sdsMarkdown) {
            state.submitted = true;
            state.result = payload;
            saveState();
            render();
          }
        }
      } catch (err) { /* silent */ }
      return;
    }
  });

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (!t || !t.dataset || !t.dataset.field) return;
    setField(t.dataset.field, t.value);
    var genBtn = document.querySelector('[data-action="generate"]');
    if (genBtn) genBtn.disabled = !isFormComplete();
  });

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.dataset) return;

    if (t.classList.contains("status-option") && t.dataset.status) {
      state.form.status = t.dataset.status;
      saveState();
      render();
      return;
    }

    var action = t.dataset.action;
    if (!action) return;
    if (action === "generate") submitSds();
    else if (action === "reset") reset();
    else if (action === "edit") editAgain();
    else if (action === "copy") copyMarkdown();
  });

  document.addEventListener("toggle", reportHeightDebounced, true);
  window.addEventListener("resize", reportHeightDebounced);

  call("ui/initialize", {
    protocolVersion: "2026-01-26",
    capabilities: {},
    clientInfo: { name: "ir35-generate-sds-widget", version: "1.0.0" }
  }).then(function (result) {
    if (result && result.hostContext && result.hostContext.theme) applyTheme(result.hostContext.theme);
    return call("ui/state/get", {}).catch(function () { return null; });
  }).then(function (r) {
    if (r && r.state) restoreState(r.state);
    if (!state.form.effectiveDate) state.form.effectiveDate = todayUTC();
    // result isn't persisted (see saveState) — re-derive by calling the tool.
    if (state.submitted && !state.result && isFormComplete()) {
      submitSds();
    } else {
      render();
    }
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
