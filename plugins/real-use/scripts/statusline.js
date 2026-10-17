#!/usr/bin/env node
// Status line de Real Use: tarea en curso de .cru/TASKS.md + uso de contexto con aviso.
// Uso en ~/.claude/settings.json: { "statusLine": { "type": "command", "command": "node \"<ruta>/statusline.js\"" } }

const fs = require("fs");
const path = require("path");

const WARN = 50;
const CRIT = 75;

function readStdin() {
  try {
    const data = JSON.parse(fs.readFileSync(0, "utf8") || "{}");
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

function currentTask(dir) {
  try {
    const text = fs.readFileSync(path.join(dir, ".cru", "TASKS.md"), "utf8");
    // [ \t] y no \s: un [~] sin título no debe tomar el texto de la línea siguiente.
    const m = text.match(/^[ \t]*[-*][ \t]*\[~\][ \t]*(\S.*)$/m);
    const title = m ? m[1].split("·")[0].trim() : "";
    if (!title) return "sin tarea en curso";
    const chars = Array.from(title); // por puntos de código, para no partir emojis
    return chars.length > 48 ? chars.slice(0, 47).join("") + "…" : title;
  } catch {
    return null;
  }
}

function contextPart(input) {
  const pct = input.context_window && input.context_window.used_percentage;
  if (typeof pct !== "number" || !Number.isFinite(pct)) return null;
  const n = Math.min(100, Math.max(0, Math.round(pct)));
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
