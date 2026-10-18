#!/usr/bin/env node
// Genera el mapa visual del proyecto (HTML autocontenido) a partir de .cru/.
// Es determinista y no usa el modelo: regenerarlo no cuesta tokens.
// Uso: node mapa.js [carpeta del proyecto] [archivo de salida]   (por defecto .cru/mapa.html)

const fs = require("fs");
const path = require("path");

const read = (f) => {
  try {
    return fs.readFileSync(f, "utf8");
  } catch {
    return null;
  }
};
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const code = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");

function field(text, name) {
  if (!text) return null;
  const m = text.match(new RegExp(`^\\s*[-*]?\\s*\\**${name}\\**\\s*:\\s*(.+)$`, "im"));
  if (!m) return null;
  const v = m[1].trim();
  return v.startsWith("<") ? null : v;
}

// Secciones "## Título" de un markdown → { título: cuerpo }
function sections(text) {
  const out = {};
  if (!text) return out;
  for (const part of text.split(/^## /m).slice(1)) {
    const [title, ...body] = part.split(/\r?\n/);
    out[title.trim()] = body.join("\n").trim();
  }
  return out;
}

const bullets = (body) =>
  (body || "")
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*(?:[-*]|\d+\.)\s+(.+)$/))
    .filter(Boolean)
    .map((m) => m[1].trim())
    .filter((l) => !l.startsWith("<"));

function adoptedFile(project, name) {
  const v = field(project, name);
  if (!v) return null;
  const m = v.match(/`([^`]+)`/);
  return { file: (m ? m[1] : v.split(/\s+/)[0]).trim(), newestFirst: /arriba|primero|top/i.test(v) };
}

function parseTasks(text) {
  const t = { doing: [], todo: [], blocked: [], done: [], review: [], groups: [] };
  if (!text) return t;
  for (const line of text.split(/\r?\n/)) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) t.groups.push(h[1].trim());
    const m = line.match(/^\s*[-*]\s*\[(.)\]\s*(.+)$/);
    if (!m) continue;
    const parts = m[2].split(" · ");
    const task = { title: parts[0].trim(), extra: parts.slice(1) };
    if (/revisi[oó]n:\s*pendiente/i.test(m[2])) t.review.push(task);
    const mark = m[1].toLowerCase();
    if (mark === "~") t.doing.push(task);
    else if (mark === "!") t.blocked.push(task);
    else if (mark === "x") t.done.push(task);
    else if (mark === " ") t.todo.push(task);
  }
  return t;
}

function latestLog(text, newestFirst) {
  if (!text) return null;
  const parts = text.split(/^## /m).slice(1);
  if (!parts.length) return null;
  const e = (newestFirst ? parts[0] : parts[parts.length - 1]).trim();
  if (e.startsWith("<")) return null;
  const [title, ...rest] = e.split(/\r?\n/);
  return { title: title.trim(), lines: bullets(rest.join("\n")).slice(0, 5) };
}

function decisions(text) {
  return (text ? text.match(/^##\s+D-\d+.*$/gm) || [] : []).map((d) => d.replace(/^##\s+/, "")).slice(-6).reverse();
}

const extra = (task, key) => {
  const e = task.extra.find((x) => x.toLowerCase().startsWith(key));
  return e ? e.slice(key.length).trim() : "";
};

function build(root) {
  const dir = path.join(root, ".cru");
  const project = read(path.join(dir, "PROJECT.md"));
  if (project == null) throw new Error(`No hay .cru/PROJECT.md en ${root}`);
  const sec = sections(project);
  const tasksRef = read(path.join(dir, "TASKS.md")) == null ? adoptedFile(project, "Tareas") : null;
  const tasksText = tasksRef ? read(path.join(root, tasksRef.file)) : read(path.join(dir, "TASKS.md"));
  const tasks = parseTasks(tasksText);
  const logRef = adoptedFile(project, "Bitácora");
  const log = logRef ? latestLog(read(path.join(root, logRef.file)), logRef.newestFirst) : latestLog(read(path.join(dir, "LOG.md")), false);

  return {
    name: field(project, "Nombre") || path.basename(root),
    type: field(project, "Tipo"),
    method: field(project, "Metodología"),
    phase: field(project, "Fase"),
    verif: field(project, "Verificación"),
    budget: field(project, "Presupuesto"),
    vision: (sec["Visión (una frase)"] || sec["Visión"] || "").split(/\r?\n/).find((l) => l.trim() && !l.startsWith("<")) || "",
    done: bullets(sec["Definición de terminado del producto"]).concat(
      (sec["Definición de terminado del producto"] || "").split(/\r?\n/).filter((l) => l.trim() && !/^\s*[-*\d]/.test(l) && !l.startsWith("<"))
    )[0] || "",
    milestones: bullets(sec["Hitos"]),
    stack: bullets(sec["Stack"]).map((l) => {
      const m = l.match(/^([^:]+):\s*(.+)$/);
      const value = m ? m[2] : l;
      const tier = /\((gratis|libre|free)\)/i.test(value) ? "gratis" : /\((pago|premium|de pago)\)/i.test(value) ? "pago" : /\(freemium\)/i.test(value) ? "freemium" : "";
      return { label: m ? m[1].trim() : "", value: value.replace(/\s*\((gratis|libre|free|pago|premium|de pago|freemium)\)/i, "").trim(), tier };
    }),
    out: bullets(sec["Fuera de alcance"]),
    tasks,
    tasksWhere: tasksRef ? tasksRef.file : ".cru/TASKS.md",
    log,
    decisions: decisions(read(path.join(dir, "DECISIONS.md"))),
  };
}

function render(d) {
  const t = d.tasks;
  const total = t.doing.length + t.todo.length + t.blocked.length + t.done.length;
  const pct = total ? Math.round((t.done.length / total) * 100) : 0;
  const li = (task, cls, note) =>
    `<li class="${cls}"><span class="dot"></span><span>${code(task.title)}${note ? `<small>${code(note)}</small>` : ""}</span></li>`;
  const copy = (label, prompt) => `<button data-copy="${esc(prompt)}">${esc(label)}</button>`;

  const next = [];
  if (t.review.length) next.push(copy("Dar el visto bueno", `Revisemos lo que tengo pendiente de visto bueno: ${t.review.map((x) => x.title).join("; ")}`));
  if (t.doing.length) next.push(copy("Continuar", `/real-use:siguiente ${t.doing[0].title.split(" ")[0]}`));
  else if (t.todo.length) next.push(copy("Empezar la siguiente", `/real-use:siguiente ${t.todo[0].title.split(" ")[0]}`));
  if (t.blocked.length) next.push(copy("Desbloquear", `Ayúdame a desbloquear: ${t.blocked[0].title}`));
  next.push(copy("Menú", "/real-use:menu"), copy("Cerrar sesión", "/real-use:cerrar"));

  const tierBadge = (tier) => (tier ? `<span class="badge ${tier}">${tier}</span>` : "");

  return `<title>Mapa de ${esc(d.name)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* Tablero de obra: estado primero, detalle después; tonos de plano técnico */
:root{--bg:#f4f5f2;--card:#ffffff;--ink:#1c2321;--muted:#5d6763;--line:#dde2de;--accent:#2563c9;--ok:#2d7d4f;--warn:#a8650f;--bad:#b83a34;--soft:#eaf0f8}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#141816;--card:#1d2220;--ink:#e6ebe8;--muted:#9aa49f;--line:#2f3633;--accent:#7ea7ee;--ok:#62bf87;--warn:#e3a54e;--bad:#ea7b74;--soft:#1c2636;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#141816;--card:#1d2220;--ink:#e6ebe8;--muted:#9aa49f;--line:#2f3633;--accent:#7ea7ee;--ok:#62bf87;--warn:#e3a54e;--bad:#ea7b74;--soft:#1c2636;color-scheme:dark}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:980px;margin:0 auto;padding-block:24px 48px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
h1{font-size:24px;margin:0 0 4px;font-weight:600;text-wrap:balance}h2{font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin:0 0 10px;font-weight:600}
.sub{color:var(--muted);margin:0 0 16px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr));gap:14px;margin-top:14px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px;min-width:0}small,li span{min-width:0;overflow-wrap:anywhere}button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}.num{font-variant-numeric:tabular-nums}
.bar{height:8px;background:var(--line);border-radius:6px;overflow:hidden;margin:8px 0 4px}.bar>i{display:block;height:100%;background:var(--ok)}
ul{list-style:none;margin:0;padding:0}li{display:flex;gap:10px;padding:6px 0;border-bottom:1px solid var(--line)}li:last-child{border-bottom:0}
small{display:block;color:var(--muted);font-size:13px}.dot{flex:none;width:9px;height:9px;border-radius:50%;margin-top:7px;background:var(--muted)}
.doing .dot{background:var(--accent)}.done .dot{background:var(--ok)}.blocked .dot{background:var(--bad)}.review .dot{background:var(--warn)}
.tree{border-left:2px solid var(--line);margin-left:6px;padding-left:14px}.goal{font-weight:600}
.ms{padding:4px 0}.ms.cur{color:var(--accent);font-weight:600}
.badge{font-size:11px;padding:1px 7px;border-radius:9px;margin-left:6px;border:1px solid var(--line)}.badge.gratis{color:var(--ok)}.badge.pago{color:var(--warn)}.badge.freemium{color:var(--accent)}
.stack{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:8px}.chip{background:var(--soft);border-radius:8px;padding:8px 10px}.chip b{display:block;font-size:12px;color:var(--muted);font-weight:500}
.actions{display:flex;flex-wrap:wrap;gap:8px}button{font:inherit;font-size:14px;padding:7px 12px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}button:hover{border-color:var(--accent)}
code{font-family:ui-monospace,Consolas,monospace;font-size:13px;background:var(--soft);padding:0 4px;border-radius:4px}.empty{color:var(--muted)}
.wide{grid-column:1/-1}.note{font-size:13px;color:var(--muted);margin-top:8px}
</style>
<main>
<h1>${esc(d.name)}</h1>
<p class="sub">${[d.type, d.method, d.phase && `fase: ${d.phase}`].filter(Boolean).map(esc).join(" · ")}</p>

<div class="card wide">
<h2>Dónde estamos</h2>
<div class="goal">Objetivo: ${code(d.vision || "Objetivo sin definir: complétalo en .cru/PROJECT.md")}</div>
${d.done ? `<div class="note">Terminado significa: ${code(d.done)}</div>` : ""}
<div class="tree">${d.milestones.length ? d.milestones.map((m, i) => `<div class="ms${!/✔/.test(m) && !d.milestones.slice(0, i).some((x) => !/✔/.test(x)) ? " cur" : ""}">${/✔/.test(m) ? "✔" : "◻"} ${code(m.replace(/\s*—\s*✔\s*$/, ""))}</div>`).join("") : `<div class="empty">Sin hitos definidos</div>`}</div>
${total ? `<div class="bar"><i style="width:${pct}%"></i></div><small>${t.done.length} de ${total} tareas hechas (${pct} %) · en ${esc(d.tasksWhere)}</small>` : t.groups.length ? `<div class="note">Tareas en ${esc(d.tasksWhere)}: ${t.groups.slice(0, 6).map(esc).join(" · ")}</div>` : ""}
</div>

<div class="grid">
<div class="card"><h2>Necesita tu visto bueno</h2><ul>${t.review.length ? t.review.map((x) => li(x, "review", "Revísalo y dale el visto bueno")).join("") : `<li class="empty">Nada pendiente de revisar</li>`}</ul></div>
<div class="card"><h2>Haciendo ahora</h2><ul>${t.doing.length ? t.doing.map((x) => li(x, "doing", extra(x, "queda:") && `Queda: ${extra(x, "queda:")}`)).join("") : `<li class="empty">Nada en curso</li>`}</ul></div>
<div class="card"><h2>Bloqueado</h2><ul>${t.blocked.length ? t.blocked.map((x) => li(x, "blocked", extra(x, "bloqueado por:"))).join("") : `<li class="empty">Nada bloqueado</li>`}</ul></div>
<div class="card"><h2>Lo que sigue</h2><ul>${t.todo.length ? t.todo.slice(0, 6).map((x) => li(x, "todo", extra(x, "hecho:") && `Terminado: ${extra(x, "hecho:")}`)).join("") : `<li class="empty">Sin pendientes</li>`}</ul></div>
<div class="card"><h2>Hecho recientemente</h2><ul>${t.done.length ? t.done.slice(-6).reverse().map((x) => li(x, "done")).join("") : `<li class="empty">Aún nada</li>`}</ul></div>
<div class="card"><h2>Última sesión</h2>${d.log ? `<b>${code(d.log.title)}</b><ul>${d.log.lines.map((l) => `<li><span>${code(l)}</span></li>`).join("")}</ul>` : `<p class="empty">Sin entradas</p>`}</div>
</div>

<div class="grid">
<div class="card wide"><h2>Tecnología</h2>${d.stack.length ? `<div class="stack">${d.stack.map((s) => `<div class="chip"><b>${esc(s.label || "Pieza")}</b>${code(s.value)}${tierBadge(s.tier)}</div>`).join("")}</div>` : `<p class="empty">Sin stack definido: añade una sección "## Stack" a .cru/PROJECT.md</p>`}
${d.verif ? `<div class="note">Cómo se comprueba: ${code(d.verif)}</div>` : ""}${d.budget ? `<div class="note">Herramientas: ${esc(d.budget)}</div>` : ""}</div>
<div class="card"><h2>Decisiones</h2><ul>${d.decisions.length ? d.decisions.map((x) => `<li><span>${code(x)}</span></li>`).join("") : `<li class="empty">Sin decisiones registradas</li>`}</ul></div>
<div class="card"><h2>Fuera de alcance</h2><ul>${d.out.length ? d.out.map((x) => `<li><span>${code(x)}</span></li>`).join("") : `<li class="empty">Sin definir</li>`}</ul></div>
</div>

<div class="card wide" style="margin-top:14px"><h2>Siguientes pasos</h2><div class="actions">${next.join("")}</div>
<div class="note" id="msg">Cada botón copia el comando: pégalo en Claude.</div></div>
</main>
<script>
document.querySelectorAll("[data-copy]").forEach(function(b){b.addEventListener("click",function(){var t=b.getAttribute("data-copy"),m=document.getElementById("msg");
var ok=function(){m.textContent="Copiado: "+t};var fallo=function(){m.textContent=t;var r=document.createRange();r.selectNodeContents(m);var s=getSelection();s.removeAllRanges();s.addRange(r)};try{navigator.clipboard.writeText(t).then(ok,fallo)}catch(e){fallo()}})});
</script>
`;
}

function main() {
  const root = path.resolve(process.argv.slice(2).filter((a) => !a.startsWith("--"))[0] || process.cwd());
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const out = path.resolve(args[1] || path.join(root, ".cru", "mapa.html"));
  const frag = render(build(root));
  // Para abrirlo como archivo local hace falta el esqueleto; un artifact lo pone al publicar.
  const html = process.argv.includes("--completo") ? `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${frag.replace("</style>", "</style></head><body>")}</body></html>
` : frag;
  fs.writeFileSync(out, html);
  process.stdout.write(out + "\n");
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    process.stderr.write(String(e.message || e) + "\n");
    process.exit(1);
  }
}

module.exports = { build, render };
