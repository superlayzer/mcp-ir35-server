// Inlined into each widget's HTML at compile time so widgets are
// self-contained iframes with no runtime fetch.
export const SHARED_WIDGET_CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  padding: 16px;
  -webkit-font-smoothing: antialiased;
  background: var(--bg);
  color: var(--fg);
}

body.dark {
  --bg: #0a0a0a;
  --surface: #18181b;
  --surface-2: #27272a;
  --fg: #fafafa;
  --muted: #a1a1aa;
  --border: #27272a;
  --border-strong: #3f3f46;
  --inside: #ef4444;
  --b-inside: #f59e0b;
  --b-outside: #84cc16;
  --outside: #22c55e;
  --indeterminate: #71717a;
  --accent: #818cf8;
}

body.light, body:not(.dark):not(.light) {
  --bg: #ffffff;
  --surface: #fafafa;
  --surface-2: #f4f4f5;
  --fg: #18181b;
  --muted: #71717a;
  --border: #e4e4e7;
  --border-strong: #d4d4d8;
  --inside: #dc2626;
  --b-inside: #d97706;
  --b-outside: #65a30d;
  --outside: #16a34a;
  --indeterminate: #71717a;
  --accent: #6366f1;
}

a { color: var(--accent); }

h1, h2, h3, h4 { font-weight: 600; line-height: 1.2; }
h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 8px; }

.muted { color: var(--muted); }
.mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace; }

.disclaimer {
  background: color-mix(in srgb, var(--b-inside) 12%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--b-inside) 30%, var(--border));
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
  margin-bottom: 16px;
}
.disclaimer summary {
  cursor: pointer;
  list-style: none;
  display: flex;
  gap: 6px;
  align-items: center;
  user-select: none;
}
.disclaimer summary::-webkit-details-marker { display: none; }
.disclaimer summary::after { content: "▾"; margin-left: auto; transition: transform 0.15s; opacity: 0.6; }
.disclaimer[open] summary::after { transform: rotate(180deg); }
.disclaimer p { margin-top: 8px; color: var(--muted); }

.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border: 1px solid var(--border-strong);
  background: var(--surface-2);
  color: var(--muted);
}
.badge-high     { background: color-mix(in srgb, var(--inside)   18%, transparent); color: var(--inside);   border-color: color-mix(in srgb, var(--inside) 35%, transparent); }
.badge-medium   { background: color-mix(in srgb, var(--b-inside) 18%, transparent); color: var(--b-inside); border-color: color-mix(in srgb, var(--b-inside) 35%, transparent); }
.badge-low      { background: var(--surface-2); }
.badge-inside   { background: color-mix(in srgb, var(--inside)   18%, transparent); color: var(--inside);   border-color: color-mix(in srgb, var(--inside) 35%, transparent); }
.badge-outside  { background: color-mix(in srgb, var(--outside)  18%, transparent); color: var(--outside);  border-color: color-mix(in srgb, var(--outside) 35%, transparent); }

section { margin-bottom: 18px; }
section:last-child { margin-bottom: 0; }
`;
