#!/usr/bin/env node
// Único resumen de retoma. El hook de Claude y los otros agentes leen esta salida.
// No escribe archivos. Si el git o la bitácora van detrás, solo lo anuncia.

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const MAX_PENDING = 3;
const MAX_LISTED = 5;
const MAX_CHARS = 1800;

function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function version() {
  try {
    const manifest = JSON.parse(read(path.join(__dirname, "..", ".claude-plugin", "plugin.json")) || "{}");
    return manifest.version || "?";
  } catch {
    return "?";
  }
}

function field(text, name) {
  if (!text) return null;
  const re = new RegExp(`^\\s*[-*]?\\s*\\**${name}\\**\\s*:\\s*(.+)$`, "im");
  const m = text.match(re);
  if (!m) return null;
  const value = m[1].trim();
  return value.startsWith("<") ? null : value;
}

function parseTasks(text) {
  const out = { doing: [], todo: [], blocked: [], done: 0, review: [] };
  if (!text) return out;
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*[-*]\s*\[(.)\]\s*(.+)$/);
    if (!m) continue;
    const mark = m[1].toLowerCase();
    const body = m[2].trim();
    if (body.split(" · ").slice(1).some((f) => /^revisi[oó]n:\s*pendiente/i.test(f.trim()))) out.review.push(body);
    if (mark === "~") out.doing.push(body);
    else if (mark === "!") out.blocked.push(body);
    else if (mark === "x") out.done++;
    else if (mark === " ") out.todo.push(body);
  }
  return out;
}

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

function fullLatestEntry(text, newestFirst = false) {
  if (!text) return null;
  const parts = text.split(/^## /m).slice(1);
  if (!parts.length) return null;
  const entry = (newestFirst ? parts[0] : parts[parts.length - 1]).trim();
  if (!entry || entry.startsWith("<")) return null;
  return entry;
}

function latestLogEntry(text, newestFirst = false) {
  const entry = fullLatestEntry(text, newestFirst);
  if (!entry) return null;
  return entry
    .split(/\r?\n/)
    .slice(0, 6)
    .map((l) => (Array.from(l).length > 200 ? Array.from(l).slice(0, 199).join("") + "…" : l))
    .join("\n");
}

function realDir(p) {
  // Resuelve rutas cortas 8.3 de Windows (RUNNER~1) y enlaces; si falla, la ruta tal cual.
  try {
    return fs.realpathSync.native(path.resolve(p));
  } catch {
    return path.resolve(p);
  }
}

function sameDir(a, b) {
  const left = realDir(a);
  const right = realDir(b);
  return process.platform === "win32" ? left.toLowerCase() === right.toLowerCase() : left === right;
}

function gitDirtyCount(root) {
  const git = (args) =>
    execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
  let top;
  try {
    top = git(["rev-parse", "--show-toplevel"]).trim();
  } catch {
    return null;
  }
  if (!sameDir(top, root)) return null;
  try {
    const out = git(["status", "--short"]);
    return out.split(/\r?\n/).filter((line) => line.trim()).length;
  } catch {
    return null;
  }
}

function doneIds(text) {
  const ids = new Map();
  if (!text) return ids;
  for (const line of text.split(/\r?\n/)) {
    const row = line.match(/^\s*[-*]\s*\[x\]\s*(.*)$/i);
    if (!row) continue;
    for (const id of row[1].matchAll(/\bT-(\d+)\b/gi)) {
      const canonical = "T-" + id[1];
      if (!ids.has(canonical.toUpperCase())) ids.set(canonical.toUpperCase(), canonical);
    }
  }
  return ids;
}

function staleMentions(entry, done) {
  if (!entry) return [];
  const found = [];
  for (const line of entry.split(/\r?\n/)) {
    if (!/^\s*-\s*(Queda:|Prompt para retomar:)/i.test(line)) continue;
    for (const id of line.matchAll(/\bT-(\d+)\b/gi)) {
      const canonical = done.get(("T-" + id[1]).toUpperCase());
      if (canonical && !found.includes(canonical)) found.push(canonical);
    }
  }
  return found;
}

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

function outside(rel) {
  return rel === ".." || rel.startsWith(".." + path.sep) || path.isAbsolute(rel);
}

function inside(root, file) {
  const target = path.resolve(root, file);
  if (outside(path.relative(root, target))) {
    throw Object.assign(new Error("Referencia fuera del proyecto: " + file), { code: "OUTSIDE" });
  }
  try {
    const realRoot = fs.realpathSync(root);
    const realTarget = fs.realpathSync(target);
    if (outside(path.relative(realRoot, realTarget))) {
      throw Object.assign(new Error("Referencia fuera del proyecto: " + file), { code: "OUTSIDE" });
    }
  } catch (error) {
    if (error.code === "OUTSIDE") throw error;
    if (error.code !== "ENOENT") throw error;
  }
  return target;
}

function readProjectFile(root, file) {
  return read(inside(root, file));
}

function nextStep(tasks) {
  if (tasks.doing.length) return brief(tasks.doing[0], ["queda:", "sesión:"]);
  if (tasks.todo.length) return brief(tasks.todo[0], []);
  return "no hay tarea pendiente";
}

function summarize(root) {
  root = path.resolve(root);
  if (!fs.existsSync(path.join(root, ".cru"))) return "No hay .cru/ en este proyecto.\n";

  const project = read(path.join(root, ".cru", "PROJECT.md"));
  const tasksRef = adopted(project, "Tareas");
  const ownTasks = tasksRef ? null : read(path.join(root, ".cru", "TASKS.md"));
  const tasksText = tasksRef ? readProjectFile(root, tasksRef.file) : ownTasks;
  const tasks = parseTasks(tasksText);
  const logRef = adopted(project, "Bitácora");
  const logText = logRef ? readProjectFile(root, logRef.file) : read(path.join(root, ".cru", "LOG.md"));
  const log = logText != null ? latestLogEntry(logText, !!(logRef && logRef.newestFirst)) : null;
  const tasksWhere = tasksRef ? tasksRef.file : ".cru/TASKS.md";
  const logWhere = logRef ? logRef.file : ".cru/LOG.md";

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
  if (tasksRef && tasksText == null) {
    lines.push(`Tareas: PROJECT.md apunta a ${tasksWhere}, pero ese archivo no existe.`);
  } else if (total) {
    lines.push(
      `Tareas${tasksRef ? ` (${tasksWhere})` : ""}: ${tasks.done}/${total} hechas, ${tasks.doing.length} en curso, ${tasks.todo.length} pendientes, ${tasks.blocked.length} bloqueadas.`
    );
    if (tasks.review.length) lines.push("Esperando el visto bueno del usuario (menciónalo al empezar):\n" + list(tasks.review, [], MAX_LISTED));
    if (tasks.doing.length) lines.push("En curso:\n" + list(tasks.doing, ["queda:", "sesión:"], MAX_LISTED));
    if (tasks.blocked.length) lines.push("Bloqueadas:\n" + list(tasks.blocked, ["bloqueado por:"], MAX_LISTED));
    if (tasks.todo.length) lines.push("Siguientes pendientes:\n" + list(tasks.todo, [], MAX_PENDING));
  } else if (tasksRef && tasksText) {
    const hs = headings(tasksText, MAX_LISTED);
    lines.push(`Tareas en ${tasksWhere} (seguimiento adoptado)${hs ? ", secciones:\n" + hs : "."}`);
  } else if (!tasksRef && ownTasks == null && fs.existsSync(path.join(root, ".cru"))) {
    // Sin archivo de tareas: el resumen sigue, y el siguiente paso lo dice abajo.
  }
  if (logRef && logText == null) {
    lines.push(`Bitácora: PROJECT.md apunta a ${logWhere}, pero ese archivo no existe.`);
  } else if (log) {
    lines.push(`Última entrada de ${logWhere}:\n` + log);
  }

  const desfase = [];
  const dirty = gitDirtyCount(root);
  if (dirty) desfase.push(`Desfase: ${dirty} caminos sin commit.`);
  const entry = fullLatestEntry(logText, !!(logRef && logRef.newestFirst));
  for (const id of staleMentions(entry, doneIds(tasksText))) {
    desfase.push(`Desfase: la bitácora todavía habla de ${id} y en las tareas ya está hecha.`);
  }

  const head = `Real Use retomar ${version()}\n`;
  const final =
    `El estado completo está en ${tasksWhere}${logWhere !== ".cru/LOG.md" ? ` y ${logWhere}` : ""}; ` +
    "/real-use:siguiente continúa el trabajo y /real-use:cerrar cierra la sesión.";
  const tail = [...desfase, `Siguiente paso: ${nextStep(tasks)}`, final].join("\n");
  const room = MAX_CHARS - head.length - tail.length - 1;
  let body = lines.join("\n");
  if (body.length > room) body = body.slice(0, Math.max(0, room - 12)) + "\n…(recortado)";
  return head + body + "\n" + tail;
}

module.exports = { summarize };

if (require.main === module) {
  try {
    const text = summarize(process.argv[2] || process.cwd());
    process.stdout.write(text.endsWith("\n") ? text : text + "\n");
  } catch (error) {
    process.stderr.write(String(error.message || error) + "\n");
    process.exitCode = 1;
  }
}
