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

// Modo "adoptar" (hallado en Colmadón): PROJECT.md apunta al seguimiento propio del proyecto.
function adoptedProject({ tasksFile = "Pendientes.md", tasks, log, order = "(entrada arriba)" }) {
  const dir = project({
    "PROJECT.md": `- Nombre: Juego\n- Tareas: \`${tasksFile}\` (adoptado)\n- Bitácora: \`docs/BITACORA.md\` ${order}\n`,
  });
  if (tasks != null) fs.writeFileSync(path.join(dir, tasksFile), tasks);
  fs.mkdirSync(path.join(dir, "docs"));
  if (log != null) fs.writeFileSync(path.join(dir, "docs", "BITACORA.md"), log);
  return dir;
}

test("adoptar: sin casillas muestra las secciones del archivo de tareas, no 'Tareas 0/0'", () => {
  const ctx = context(adoptedProject({ tasks: "# Lo que falta\n## 0 · Bugs\n- Tú: arreglar\n## 1 · En marcha\n" }));
  assert.match(ctx, /Tareas en Pendientes\.md \(seguimiento adoptado\), secciones:\n- 0 · Bugs\n- 1 · En marcha/);
  assert.doesNotMatch(ctx, /0\/0/);
  assert.doesNotMatch(ctx, /\.cru\/TASKS\.md/);
});

test("adoptar: con casillas cuenta las tareas del archivo adoptado", () => {
  const ctx = context(adoptedProject({ tasks: "- [x] A\n- [ ] B\n- [~] C · queda: algo\n" }));
  assert.match(ctx, /Tareas \(Pendientes\.md\): 1\/3 hechas, 1 en curso/);
});

test("adoptar: bitácora con la entrada más reciente arriba o abajo", () => {
  const log = "# Bitácora\n## 2026-10-17 — nueva\n- a\n## 2026-10-01 — vieja\n- b\n";
  assert.match(context(adoptedProject({ tasks: "## x\n", log })), /Última entrada de docs\/BITACORA\.md:\n2026-10-17 — nueva/);
  const abajo = context(adoptedProject({ tasks: "## x\n", log, order: "" }));
  assert.match(abajo, /2026-10-01 — vieja/);
});

test("retomar nombra fase, conteos, siguiente paso y bitácora, y el hook usa esa salida", () => {
  const dir = project({
    "PROJECT.md": PROJECT,
    "TASKS.md": TASKS,
    "LOG.md": "## 2026-10-17 · Guardado\n- Hecho: T-002\n- Queda: inventario\n",
  });
  const out = execFileSync("node", [path.join(SCRIPTS, "retomar.js"), dir], { encoding: "utf8" });
  assert.match(out, /^Real Use retomar 0\.7\.0\n/);
  assert.match(out, /Fase: Vertical slice/);
  assert.match(out, /Tareas: 2\/8 hechas, 1 en curso, 4 pendientes, 1 bloqueadas/);
  assert.match(out, /Siguiente paso: T-003 Guardado local · queda: inventario/);
  assert.match(out, /Última entrada de \.cru\/LOG\.md:\n2026-10-17 · Guardado/);
  assert.equal(out, execFileSync("node", [path.join(SCRIPTS, "retomar.js"), dir], { encoding: "utf8" }));
  assert.match(context(dir), /^Real Use retomar 0\.7\.0/);
  assert.match(context(dir), /Siguiente paso: T-003 Guardado local/);
});

test("retomar sin .cru/ imprime una sola línea", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nocru-"));
  const out = execFileSync("node", [path.join(SCRIPTS, "retomar.js"), dir], { encoding: "utf8" });
  assert.equal(out, "No hay .cru/ en este proyecto.\n");
});

test("retomar con seguimiento adoptado lee esas rutas y no sustituye un archivo ausente", () => {
  const dir = project({
    "PROJECT.md": "- Nombre: Juego\n- Fase: Demo\n- Tareas: `Pendientes.md`\n- Bitácora: `docs/BITACORA.md` (entrada arriba)\n",
    "LOG.md": "NO-DEBE-SALIR\n",
    "TASKS.md": "- [ ] NO-DEBE-SALIR-TAREA\n",
  });
  fs.mkdirSync(path.join(dir, "docs"));
  fs.writeFileSync(path.join(dir, "Pendientes.md"), "- [~] C · queda: algo\n- [ ] B\n- [x] A\n");
  fs.writeFileSync(path.join(dir, "docs", "BITACORA.md"), "## 2026-11-07 · arriba\n- hoy\n## 2026-10-01 · abajo\n- ayer\n");
  const out = execFileSync("node", [path.join(SCRIPTS, "retomar.js"), dir], { encoding: "utf8" });
  assert.match(out, /Fase: Demo/);
  assert.match(out, /Tareas \(Pendientes\.md\): 1\/3 hechas, 1 en curso, 1 pendientes, 0 bloqueadas/);
  assert.match(out, /Siguiente paso: C · queda: algo/);
  assert.match(out, /2026-11-07 · arriba/);
  assert.doesNotMatch(out, /NO-DEBE-SALIR/);

  const falta = project({
    "PROJECT.md": "- Nombre: Juego\n- Tareas: `NoExiste.md`\n- Bitácora: `docs/NO.md`\n",
    "LOG.md": "NO-DEBE-SALIR\n",
    "TASKS.md": "- [ ] NO-DEBE-SALIR-TAREA\n",
  });
  const aviso = execFileSync("node", [path.join(SCRIPTS, "retomar.js"), falta], { encoding: "utf8" });
  assert.match(aviso, /apunta a NoExiste\.md, pero ese archivo no existe/);
  assert.match(aviso, /apunta a docs\/NO\.md, pero ese archivo no existe/);
  assert.doesNotMatch(aviso, /NO-DEBE-SALIR/);
});

test("retomar rechaza una ruta adoptada fuera del proyecto", () => {
  const dir = project({ "PROJECT.md": "- Nombre: X\n- Tareas: `../fuera.md`\n" });
  assert.throws(
    () => execFileSync("node", [path.join(SCRIPTS, "retomar.js"), dir], { encoding: "utf8" }),
    (error) => {
      assert.equal(error.status, 1);
      assert.match(error.stderr, /fuera del proyecto: \.\.\/fuera\.md/);
      return true;
    }
  );
});

function git(dir, args) {
  return execFileSync("git", args, {
    cwd: dir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
}

test("retomar avisa de los caminos sin commit y no escribe archivos", () => {
  const dir = project({ "PROJECT.md": "- Nombre: Git\n- Fase: Prueba\n", "TASKS.md": "- [ ] T-001 Una\n" });
  git(dir, ["init"]);
  fs.writeFileSync(path.join(dir, "nuevo.txt"), "x");
  const before = fs.readFileSync(path.join(dir, ".cru", "TASKS.md"), "utf8");
  const n = git(dir, ["status", "--short"]).split(/\r?\n/).filter((line) => line.trim()).length;
  const out = execFileSync("node", [path.join(SCRIPTS, "retomar.js"), dir], { encoding: "utf8" });
  assert.match(out, new RegExp(`Desfase: ${n} caminos sin commit\\.`));
  assert.equal(fs.readFileSync(path.join(dir, ".cru", "TASKS.md"), "utf8"), before);
});

test("retomar avisa si la bitácora nombra una tarea ya hecha", () => {
  const dir = project({
    "PROJECT.md": "- Nombre: Log\n",
    "TASKS.md": "- [x] T-001 Hecha\n- [ ] T-002 Sigue\n",
    "LOG.md": "## 2026-11-07 · corte\n- Hecho: T-001 quedó atrás\n- Queda: T-001 y también T-002\n- Prompt para retomar: sigue con T-002\n",
  });
  const out = execFileSync("node", [path.join(SCRIPTS, "retomar.js"), dir], { encoding: "utf8" });
  assert.match(out, /Desfase: la bitácora todavía habla de T-001 y en las tareas ya está hecha\./);
  assert.doesNotMatch(out, /habla de T-002/);
});

test("retomar sin repositorio git propio no inventa un desfase de caminos", () => {
  const dir = project({ "PROJECT.md": "- Nombre: Solo\n", "TASKS.md": "- [ ] T-001 Una\n" });
  const out = execFileSync("node", [path.join(SCRIPTS, "retomar.js"), dir], { encoding: "utf8" });
  assert.doesNotMatch(out, /caminos sin commit/);
});

test("adoptar: avisa si el archivo apuntado no existe y la línea final nunca se recorta", () => {
  const larga = "# B\n## hoy\n" + Array.from({ length: 6 }, () => "- " + "x".repeat(600)).join("\n");
  const ctx = context(adoptedProject({ tasksFile: "NoExiste.md", log: larga }));
  assert.match(ctx, /apunta a NoExiste\.md, pero ese archivo no existe/);
  assert.ok(ctx.length <= 1800, String(ctx.length));
  assert.match(ctx, /El estado completo está en NoExiste\.md y docs\/BITACORA\.md; .*cierra la sesión\.$/);
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

// Casos encontrados por /real-use:experto qa sobre statusline.js
test("statusline usa input.cwd cuando no hay workspace", () => {
  const dir = project({ "TASKS.md": TASKS });
  assert.equal(run("statusline.js", { cwd: dir }), "T-003 Guardado local");
});

test("statusline: umbrales exactos de aviso", () => {
  const ctx = (p) => run("statusline.js", { context_window: { used_percentage: p }, cwd: os.tmpdir() });
  assert.equal(ctx(49.4), "ctx 49%");
  assert.match(ctx(50), /^ctx 50% · \/compact/);
  assert.match(ctx(74.4), /\/compact/);
  assert.match(ctx(75), /cerrar/);
});

test("statusline ignora porcentajes no numéricos y acota el rango", () => {
  const ctx = (p) => run("statusline.js", { context_window: { used_percentage: p }, cwd: os.tmpdir() });
  assert.equal(ctx("abc"), "");
  assert.equal(ctx(-5), "ctx 0%");
  assert.match(ctx(130), /^ctx 100%/);
});

test("statusline no toma el título de la línea siguiente si [~] está vacía", () => {
  const dir = project({ "TASKS.md": "- [~]\n- [ ] T-004 Pausa\n" });
  assert.equal(run("statusline.js", { cwd: dir }), "sin tarea en curso");
});

test("statusline trunca sin partir emojis", () => {
  const dir = project({ "TASKS.md": `- [~] ${"😀".repeat(60)}\n` });
  const out = run("statusline.js", { cwd: dir });
  assert.ok(!/[\uD800-\uDFFF](?![\uDC00-\uDFFF])/.test(out.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")), "sin sustitutos sueltos");
  assert.equal(Array.from(out).length, 48);
});

test("los scripts toleran stdin null o malformado", () => {
  const dir = project({ "TASKS.md": TASKS });
  for (const raw of ["null", "[]", "no-json"]) {
    const env = { ...process.env, CLAUDE_PROJECT_DIR: dir };
    const opts = { input: raw, env, encoding: "utf8", cwd: dir };
    assert.equal(execFileSync("node", [path.join(SCRIPTS, "statusline.js")], opts), "T-003 Guardado local", raw);
    assert.match(execFileSync("node", [path.join(SCRIPTS, "session-start.js")], opts), /T-003/, raw);
  }
});
