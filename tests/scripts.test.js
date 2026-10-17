// Tests de los scripts del plugin: ejecutar con `npm test` (node --test).
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const SCRIPTS = path.join(__dirname, "..", "plugins", "real-use", "scripts");

function run(script, input, env = {}) {
  return execFileSync("node", [path.join(SCRIPTS, script)], {
    input: JSON.stringify(input),
    env: { ...process.env, CLAUDE_PROJECT_DIR: "", ...env },
    encoding: "utf8",
  });
}

function project(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cru-"));
  fs.mkdirSync(path.join(dir, ".cru"));
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, ".cru", name), content);
  }
  return dir;
}

const TASKS = [
  "# Tareas",
  "<!-- Marcas: `[ ]` pendiente · `[~]` en curso -->",
  "## En curso",
  "- [~] T-003 Guardado local · hecho: restaura · verif: gut · queda: inventario",
  "## Pendiente",
  "- [ ] T-004 Pausa",
  "- [ ] T-005 Sonido",
  "- [ ] T-006 Tienda",
  "- [ ] T-008 Extra",
  "## Bloqueado",
  "- [!] T-007 Logros · bloqueado por: cuenta",
  "## Hecho",
  "- [x] T-001 Combate",
  "- [X] T-002 Mapa",
].join("\r\n");

const PROJECT = [
  "# Proyecto",
  "- Nombre: Cartas",
  "- Tipo: juego",
  "- Metodología: <ver referencias/metodologias.md>",
  "- Fase: Vertical slice",
  "- Verificación: `godot --headless --quit-after 2`",
].join("\n");

function context(dir) {
  const out = run("session-start.js", { cwd: dir, source: "startup" });
  return JSON.parse(out).hookSpecificOutput.additionalContext;
}

test("session-start no imprime nada sin .cru/", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nocru-"));
  assert.equal(run("session-start.js", { cwd: dir }), "");
});

test("session-start resume tareas y proyecto", () => {
  const ctx = context(project({ "TASKS.md": TASKS, "PROJECT.md": PROJECT }));
  assert.match(ctx, /Cartas/);
  assert.match(ctx, /Tareas: 2\/8 hechas, 1 en curso, 4 pendientes, 1 bloqueadas/);
  assert.match(ctx, /T-003 Guardado local/);
  assert.match(ctx, /T-007 Logros/);
  assert.match(ctx, /godot --headless/);
  assert.match(ctx, /T-006 Tienda/);
  assert.doesNotMatch(ctx, /T-008/, "solo las 3 primeras pendientes");
  assert.match(ctx, /Metodología: \?/, "ignora valores de plantilla sin rellenar");
  assert.doesNotMatch(ctx, /<ver referencias/);
});

test("session-start ignora la entrada de plantilla del LOG y muestra la real", () => {
  const plantilla = "# Bitácora\n\n## <AAAA-MM-DD> · <título>\n- Hecho: <x>\n";
  assert.doesNotMatch(context(project({ "LOG.md": plantilla })), /AAAA/);
  const real = plantilla + "\n## 2026-10-17 · Guardado\n- Hecho: T-002\n- Queda: inventario\n";
  const ctx = context(project({ "LOG.md": real }));
  assert.match(ctx, /2026-10-17 · Guardado/);
  assert.match(ctx, /Queda: inventario/);
});

test("session-start resume cada tarea al título y a los campos para retomar", () => {
  const ctx = context(project({ "TASKS.md": TASKS }));
  assert.match(ctx, /- T-003 Guardado local · queda: inventario\n/);
  assert.match(ctx, /- T-007 Logros · bloqueado por: cuenta/);
  assert.doesNotMatch(ctx, /verif: gut/, "los criterios completos se quedan en TASKS.md");
});

test("session-start con muchas tareas sigue mostrando la bitácora", () => {
  const muchas = Array.from({ length: 200 }, (_, i) => `- [!] T-${i} ${"x".repeat(80)}`).join("\n");
  const log = "## 2026-10-17 · Sesión\n- Prompt para retomar: \"sigue con T-1\"\n";
  const ctx = context(project({ "TASKS.md": muchas, "LOG.md": log }));
  assert.ok(ctx.length < 1900);
  assert.match(ctx, /… y 195 más/);
  assert.match(ctx, /Prompt para retomar/);
});

test("statusline muestra modelo, tarea y contexto con avisos", () => {
  const dir = project({ "TASKS.md": TASKS });
  const base = { model: { display_name: "Opus" }, workspace: { current_dir: dir } };
  assert.equal(
    run("statusline.js", { ...base, context_window: { used_percentage: 12.4 } }),
    "Opus │ T-003 Guardado local │ ctx 12%"
  );
  assert.match(run("statusline.js", { ...base, context_window: { used_percentage: 55 } }), /\/compact/);
  assert.match(run("statusline.js", { ...base, context_window: { used_percentage: 80 } }), /cerrar/);
});

test("statusline sin .cru ni contexto solo muestra el modelo", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nocru-"));
  assert.equal(run("statusline.js", { model: { display_name: "Opus" }, cwd: dir }), "Opus");
});
