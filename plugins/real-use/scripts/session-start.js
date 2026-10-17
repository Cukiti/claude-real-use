#!/usr/bin/env node
// SessionStart hook: si el proyecto tiene .cru/, inyecta un resumen compacto del estado
// (fase, tarea en curso, siguientes pendientes, bloqueos, último registro).
// Si no hay .cru/, no imprime nada: cero tokens en proyectos que no usan el sistema.

const fs = require("fs");
const path = require("path");

const MAX_PENDING = 3;
const MAX_CHARS = 1800;

function readStdin() {
  try {
    return JSON.parse(fs.readFileSync(0, "utf8") || "{}");
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

function lastLogEntry(text) {
  if (!text) return null;
  const parts = text.split(/^## /m).slice(1);
  if (!parts.length) return null;
  const last = parts[parts.length - 1].trim();
  if (last.startsWith("<")) return null;
  return last.split(/\r?\n/).slice(0, 6).join("\n");
}

function main() {
  const input = readStdin();
  const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const dir = path.join(root, ".cru");
  if (!fs.existsSync(dir)) return;

  const project = read(path.join(dir, "PROJECT.md"));
  const tasks = parseTasks(read(path.join(dir, "TASKS.md")));
  const log = lastLogEntry(read(path.join(dir, "LOG.md")));

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
  lines.push(
    `Tareas: ${tasks.done}/${total} hechas, ${tasks.doing.length} en curso, ${tasks.todo.length} pendientes, ${tasks.blocked.length} bloqueadas.`
  );
  if (tasks.doing.length) lines.push("En curso:\n" + tasks.doing.map((t) => `- ${t}`).join("\n"));
  if (tasks.blocked.length) lines.push("Bloqueadas:\n" + tasks.blocked.map((t) => `- ${t}`).join("\n"));
  if (tasks.todo.length) {
    lines.push(
      "Siguientes pendientes:\n" +
        tasks.todo
          .slice(0, MAX_PENDING)
          .map((t) => `- ${t}`)
          .join("\n")
    );
  }
  if (log) lines.push("Última entrada de .cru/LOG.md:\n" + log);
  lines.push("El estado completo está en .cru/TASKS.md; /real-use:siguiente continúa el trabajo y /real-use:cerrar cierra la sesión.");

  let text = lines.join("\n");
  if (text.length > MAX_CHARS) text = text.slice(0, MAX_CHARS) + "\n…(recortado; ver .cru/)";

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: text },
    })
  );
}

try {
  main();
} catch {
  // Un hook de contexto nunca debe romper la sesión.
}
