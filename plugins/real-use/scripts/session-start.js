#!/usr/bin/env node
// SessionStart: si el proyecto tiene .cru/, inyecta el resumen de retomar.js.
// Si no hay .cru/, no imprime contexto: cero tokens en proyectos que no usan el sistema.

const fs = require("fs");
const path = require("path");
const { summarize } = require("./retomar.js");

function readStdin() {
  try {
    const data = JSON.parse(fs.readFileSync(0, "utf8") || "{}");
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

function resumeWarning(input) {
  const nivel = (process.env.CLAUDE_PLUGIN_OPTION_AVISOS || "todos").toLowerCase();
  if (nivel === "ninguno") return null;
  const tokens = Number(input.context_tokens) || 0;
  if (!input.prompt_cache_likely_expired || tokens < 50000) return null;
  const usd = Number(input.estimated_cache_write_usd);
  const coste = Number.isFinite(usd) && usd > 0 ? ` (~$${usd.toFixed(2)} en precio de API)` : "";
  return (
    `⏱ Retomas una sesión de ~${Math.round(tokens / 1000)}k tokens con la caché caducada: ` +
    `el primer mensaje la reprocesa entera${coste}. ` +
    "Si el estado está en .cru/, una sesión nueva con /real-use:siguiente arranca casi desde cero."
  );
}

function emit(context, warning) {
  if (!context && !warning) return;
  const out = {};
  if (context) out.hookSpecificOutput = { hookEventName: "SessionStart", additionalContext: context };
  if (warning) out.systemMessage = warning;
  process.stdout.write(JSON.stringify(out));
}

function main() {
  const input = readStdin();
  const warning = resumeWarning(input);
  const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  if (!fs.existsSync(path.join(root, ".cru"))) return emit(null, warning);
  try {
    emit(summarize(root), warning);
  } catch {
    emit(null, warning);
  }
}

try {
  main();
} catch {
  // Un hook de contexto nunca debe romper la sesión.
}
