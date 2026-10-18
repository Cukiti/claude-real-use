// Tests del mapa del proyecto (scripts/mapa.js) y del estado "revisión pendiente".
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const SCRIPTS = path.join(__dirname, "..", "plugins", "real-use", "scripts");
const { build, render } = require(path.join(SCRIPTS, "mapa.js"));

function proyecto(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mapa-"));
  for (const [rel, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), content);
  }
  return dir;
}

const PROJECT = `# Proyecto
- Nombre: Cartas
- Tipo: juego
- Fase: Vertical slice
- Verificación: \`godot --headless\`
- Presupuesto: gratis primero

## Visión (una frase)
Roguelike de cartas para móvil.

## Definición de terminado del producto
Publicado en Google Play.

## Fuera de alcance
- Multijugador

## Hitos
1. Prototipo — divertido en 2 min — ✔
2. Vertical slice — un nivel final

## Stack
- Motor: Godot 4.7 (gratis)
- Base de datos: Supabase (freemium)
- Analítica: GameAnalytics (pago)
`;

const TASKS = `## En curso
- [~] T-003 Guardado · queda: inventario
## Pendiente
- [ ] T-004 Pausa · hecho: pausa y sale
## Bloqueado
- [!] T-007 Logros · bloqueado por: cuenta
## Hecho
- [x] T-001 Combate · ✔ 2026-10-15 · revisión: pendiente
- [x] T-002 Mapa · revisado ✔ 2026-10-16
`;

test("build lee objetivo, hitos, stack con gratis/pago, tareas y revisión pendiente", () => {
  const d = build(proyecto({ ".cru/PROJECT.md": PROJECT, ".cru/TASKS.md": TASKS, ".cru/DECISIONS.md": "## D-001 · 2026 · Godot\n" }));
  assert.equal(d.name, "Cartas");
  assert.equal(d.vision, "Roguelike de cartas para móvil.");
  assert.equal(d.done, "Publicado en Google Play.");
  assert.equal(d.milestones.length, 2);
  assert.deepEqual(
    d.stack.map((s) => [s.label, s.value, s.tier]),
    [["Motor", "Godot 4.7", "gratis"], ["Base de datos", "Supabase", "freemium"], ["Analítica", "GameAnalytics", "pago"]]
  );
  assert.equal(d.tasks.done.length, 2);
  assert.deepEqual(d.tasks.review.map((t) => t.title), ["T-001 Combate"]);
  assert.deepEqual(d.decisions, ["D-001 · 2026 · Godot"]);
});

test("render: fragmento para artifact, con título, temas, visto bueno y botones", () => {
  const html = render(build(proyecto({ ".cru/PROJECT.md": PROJECT, ".cru/TASKS.md": TASKS })));
  assert.match(html, /^<title>Mapa de Cartas<\/title>/);
  assert.doesNotMatch(html, /<!doctype|<body/i, "el artifact pone el esqueleto");
  assert.match(html, /prefers-color-scheme:dark/);
  assert.match(html, /:root\[data-theme="dark"\]/);
  assert.match(html, /Necesita tu visto bueno[\s\S]*T-001 Combate/);
  assert.match(html, /2 de 5 tareas hechas \(40 %\)/);
  assert.match(html, /class="ms cur"[^>]*>◻ Vertical slice/, "el hito actual es el primero sin ✔");
  assert.match(html, /data-copy="\/real-use:siguiente T-003"/);
  assert.match(html, /badge pago/);
});

test("render escapa el contenido del proyecto", () => {
  const html = render(build(proyecto({ ".cru/PROJECT.md": "- Nombre: <script>x</script>\n", ".cru/TASKS.md": "- [ ] T-1 a <b>\n" })));
  assert.doesNotMatch(html, /<script>x<\/script>/);
  assert.match(html, /&lt;b&gt;/);
});

test("modo adoptar: lee las tareas y la bitácora del proyecto", () => {
  const dir = proyecto({
    ".cru/PROJECT.md": "- Nombre: Colmado\n- Tareas: `Pendientes.md` (adoptado)\n- Bitácora: `docs/BIT.md` (entrada arriba)\n",
    "Pendientes.md": "# Falta\n## 0 · Bugs\n- Tú: algo\n## 1 · En marcha\n",
    "docs/BIT.md": "# B\n## 2026-10-17 — nueva\n- hecho X\n## 2026-10-01 — vieja\n",
  });
  const html = render(build(dir));
  assert.match(html, /Tareas en Pendientes\.md: 0 · Bugs · 1 · En marcha/);
  assert.match(html, /2026-10-17 — nueva/);
});

test("CLI: --completo genera página con esqueleto; sin .cru falla con mensaje claro", () => {
  const dir = proyecto({ ".cru/PROJECT.md": PROJECT, ".cru/TASKS.md": TASKS });
  const out = path.join(dir, "m.html");
  execFileSync("node", [path.join(SCRIPTS, "mapa.js"), dir, out, "--completo"]);
  const html = fs.readFileSync(out, "utf8");
  assert.match(html, /^<!doctype html>/);
  assert.match(html, /<\/style><\/head><body>/);
  const vacio = fs.mkdtempSync(path.join(os.tmpdir(), "mapa-"));
  assert.throws(() => execFileSync("node", [path.join(SCRIPTS, "mapa.js"), vacio], { stdio: "pipe" }), /No hay \.cru\/PROJECT\.md/);
});

test("session-start avisa de las tareas que esperan el visto bueno", () => {
  const dir = proyecto({ ".cru/PROJECT.md": PROJECT, ".cru/TASKS.md": TASKS });
  const out = execFileSync("node", [path.join(SCRIPTS, "session-start.js")], {
    input: JSON.stringify({ cwd: dir }),
    env: { ...process.env, CLAUDE_PROJECT_DIR: "" },
    encoding: "utf8",
  });
  assert.match(JSON.parse(out).hookSpecificOutput.additionalContext, /Esperando el visto bueno del usuario[^\n]*\n- T-001 Combate/);
});
