#!/usr/bin/env node
// SessionStart hook: si el proyecto tiene .cru/, inyecta un resumen compacto del estado
// (fase, tarea en curso, siguientes pendientes, bloqueos, último registro).
// Si no hay .cru/, no imprime nada: cero tokens en proyectos que no usan el sistema.

const fs = require("fs");
const path = require("path");

const MAX_PENDING = 3;
const MAX_LISTED = 5;
const MAX_CHARS = 1800;

function readStdin() {
  try {
    const data = JSON.parse(fs.readFileSync(0, "utf8") || "{}");
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function field(text, name) {
  if (!text) return null;
  const re = new RegExp(`^\\s*[-*]?\\s*\\**${name}\\**\\s*:\\s*(.+)$`, "im");
  const m = text.match(re);
  if (!m) return null;
  const value = m[1].trim();
  // Un valor de plantilla sin rellenar ("<...>") no aporta nada al contexto.
  return value.startsWith("<") ? null : value;
}

function parseTasks(text) {
  const out = { doing: [], todo: [], blocked: [], done: 0 };
  if (!text) return out;
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*[-*]\s*\[(.)\]\s*(.+)$/);
    if (!m) continue;
    const mark = m[1].toLowerCase();
    const body = m[2].trim();
    if (mark === "~") out.doing.push(body);
    else if (mark === "!") out.blocked.push(body);
    else if (mark === "x") out.done++;
    else if (mark === " ") out.todo.push(body);
  }
  return out;
}

// Resumen de una línea de tarea: el título más los campos que importan al retomar.
// Los criterios completos (hecho:, verif:) siguen en TASKS.md.
function brief(body, keep = []) {
  const parts = body.split(" · ");
  const extra = parts.slice(1).filter((p) => keep.some((k) => p.startsWith(k)));
  return [parts[0], ...extra].join(" · ");
}

function list(items, keep, max) {
  const shown = items.slice(0, max).map((t) => `- ${brief(t, keep)}`);
  if (items.length > max) shown.push(`- … y ${items.length - max} más`);
  return shown.join("\n");
}

// Entrada de bitácora más reciente: la última por defecto, o la primera si la bitácora
// pone las entradas nuevas arriba (modo "adoptar").
function latestLogEntry(text, newestFirst = false) {
  if (!text) return null;
  const parts = text.split(/^## /m).slice(1);
  if (!parts.length) return null;
  const entry = (newestFirst ? parts[0] : parts[parts.length - 1]).trim();
  if (entry.startsWith("<")) return null;
  return entry
    .split(/\r?\n/)
    .slice(0, 6)
    .map((l) => (Array.from(l).length > 200 ? Array.from(l).slice(0, 199).join("") + "…" : l))
    .join("\n");
}

// Modo "adoptar": PROJECT.md apunta al seguimiento propio del proyecto.
//   - Tareas: `Pendientes.md` …     - Bitácora: `docs/BITACORA.md` (entrada arriba) …
function adopted(project, name) {
  const value = field(project, name);
  if (!value) return null;
  const m = value.match(/`([^`]+)`/);
  const file = (m ? m[1] : value.split(/\s+/)[0]).trim();
  return { file, newestFirst: /arriba|primero|al principio|top|newest first/i.test(value) };
}

function headings(text, max) {
  const hs = (text.match(/^##\s+.+$/gm) || []).map((h) => `- ${h.replace(/^##\s+/, "").trim()}`);
  if (hs.length > max) return [...hs.slice(0, max), `- … y ${hs.length - max} más`].join("\n");
  return hs.join("\n");
}

// Aviso al usuario (no entra en el contexto) al reanudar una sesión grande con la caché caducada.
// Los campos los da Claude Code en SessionStart con source "resume" o "fork".
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
  const dir = path.join(root, ".cru");
  if (!fs.existsSync(dir)) return emit(null, warning);

  const project = read(path.join(dir, "PROJECT.md"));
  const ownTasks = read(path.join(dir, "TASKS.md"));
  const tasksRef = ownTasks == null ? adopted(project, "Tareas") : null;
  const tasksText = ownTasks != null ? ownTasks : tasksRef && read(path.join(root, tasksRef.file));
  const tasks = parseTasks(tasksText);
  const logRef = adopted(project, "Bitácora");
  const logText = logRef ? read(path.join(root, logRef.file)) : null;
  const log = logText != null ? latestLogEntry(logText, logRef.newestFirst) : latestLogEntry(read(path.join(dir, "LOG.md")));
  const tasksWhere = tasksRef ? tasksRef.file : ".cru/TASKS.md";
  const logWhere = logText != null ? logRef.file : ".cru/LOG.md";

  const name = field(project, "Nombre") || path.basename(root);
  const lines = [`Proyecto con sistema Real Use (.cru/): ${name}.`];
  const tipo = field(project, "Tipo");
  const metodo = field(project, "Metodología");
  const fase = field(project, "Fase");
  const verif = field(project, "Verificación");
  if (tipo || metodo || fase) {
    lines.push(`Tipo: ${tipo || "?"} · Metodología: ${metodo || "?"} · Fase: ${fase || "?"}`);
  }
  if (verif) lines.push(`Comando de verificación: ${verif}`);

  const total = tasks.doing.length + tasks.todo.length + tasks.blocked.length + tasks.done;
  if (total) {
    lines.push(
      `Tareas${tasksRef ? ` (${tasksWhere})` : ""}: ${tasks.done}/${total} hechas, ${tasks.doing.length} en curso, ${tasks.todo.length} pendientes, ${tasks.blocked.length} bloqueadas.`
    );
    if (tasks.doing.length) lines.push("En curso:\n" + list(tasks.doing, ["queda:", "sesión:"], MAX_LISTED));
    if (tasks.blocked.length) lines.push("Bloqueadas:\n" + list(tasks.blocked, ["bloqueado por:"], MAX_LISTED));
    if (tasks.todo.length) lines.push("Siguientes pendientes:\n" + list(tasks.todo, [], MAX_PENDING));
  } else if (tasksRef && tasksText) {
    // Seguimiento adoptado sin casillas [ ]: sus secciones bastan para orientarse.
    const hs = headings(tasksText, MAX_LISTED);
    lines.push(`Tareas en ${tasksWhere} (seguimiento adoptado)${hs ? ", secciones:\n" + hs : "."}`);
  } else if (tasksRef) {
    lines.push(`Tareas: PROJECT.md apunta a ${tasksWhere}, pero ese archivo no existe.`);
  }
  if (log) lines.push(`Última entrada de ${logWhere}:\n` + log);
  // La línea final dice dónde está el estado completo: nunca se recorta.
  const final =
    `El estado completo está en ${tasksWhere}${logWhere !== ".cru/LOG.md" ? ` y ${logWhere}` : ""}; ` +
    "/real-use:siguiente continúa el trabajo y /real-use:cerrar cierra la sesión.";

  let body = lines.join("\n");
  const room = MAX_CHARS - final.length - 1;
  if (body.length > room) body = body.slice(0, room - 12) + "\n…(recortado)";
  const text = body + "\n" + final;

  emit(text, warning);
}

try {
  main();
} catch {
  // Un hook de contexto nunca debe romper la sesión.
}
