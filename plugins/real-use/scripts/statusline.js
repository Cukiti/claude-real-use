#!/usr/bin/env node
// Status line de Real Use: tarea en curso de .cru/TASKS.md + uso de contexto con aviso.
// Uso en ~/.claude/settings.json: { "statusLine": { "type": "command", "command": "node \"<ruta>/statusline.js\"" } }

const fs = require("fs");
const path = require("path");

const WARN = 50;
const CRIT = 75;

function readStdin() {
  try {
    return JSON.parse(fs.readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

function currentTask(dir) {
  try {
    const text = fs.readFileSync(path.join(dir, ".cru", "TASKS.md"), "utf8");
    const m = text.match(/^\s*[-*]\s*\[~\]\s*(.+)$/m);
    if (!m) return "sin tarea en curso";
    const title = m[1].split("·")[0].trim();
    return title.length > 48 ? title.slice(0, 47) + "…" : title;
  } catch {
    return null;
  }
}

function contextPart(input) {
  const pct = input.context_window && input.context_window.used_percentage;
  if (pct == null) return null;
  const n = Math.round(pct);
  if (n >= CRIT) return `ctx ${n}% · cierra y abre sesión (/real-use:cerrar)`;
  if (n >= WARN) return `ctx ${n}% · /compact o /clear al acabar la tarea`;
  return `ctx ${n}%`;
}

function main() {
  const input = readStdin();
  const dir = (input.workspace && input.workspace.current_dir) || input.cwd || process.cwd();
  const parts = [];
  if (input.model && input.model.display_name) parts.push(input.model.display_name);
  const task = currentTask(dir);
  if (task) parts.push(task);
  const ctx = contextPart(input);
  if (ctx) parts.push(ctx);
  process.stdout.write(parts.join(" │ "));
}

try {
  main();
} catch {
  // La status line nunca debe romper la interfaz.
}
