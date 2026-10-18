// Tests del hook copiloto (UserPromptSubmit) y del aviso de reanudación de session-start.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const SCRIPTS = path.join(__dirname, "..", "plugins", "real-use", "scripts");

let n = 0;
function setup({ tokens = 0, minutesAgo = 1, cru = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cop-"));
  if (cru) fs.mkdirSync(path.join(dir, ".cru"));
  const transcript = path.join(dir, "t.jsonl");
  const ts = new Date(Date.now() - minutesAgo * 60000).toISOString();
  const lines = [
    JSON.stringify({ type: "user", message: { content: "hola" } }),
    JSON.stringify({
      type: "assistant",
      timestamp: ts,
      message: { usage: { input_tokens: 10, cache_read_input_tokens: tokens, cache_creation_input_tokens: 0 } },
    }),
  ];
  fs.writeFileSync(transcript, lines.join("\n") + "\n");
  return { dir, transcript, session: `s${Date.now()}-${n++}`, data: path.join(dir, "data") };
}

function ask(ctx, prompt, env = {}) {
  const out = execFileSync("node", [path.join(SCRIPTS, "copiloto.js")], {
    input: JSON.stringify({ session_id: ctx.session, transcript_path: ctx.transcript, cwd: ctx.dir, prompt }),
    env: { ...process.env, CLAUDE_PLUGIN_DATA: ctx.data, CLAUDE_EFFORT: "", CLAUDE_PLUGIN_OPTION_AVISOS: "", ...env },
    encoding: "utf8",
  });
  return out ? JSON.parse(out).systemMessage : "";
}

test("sin señales no avisa (y no imprime nada)", () => {
  assert.equal(ask(setup({ tokens: 5000 }), "explícame cómo funciona el guardado en save.gd"), "");
});

test("avisa una sola vez al pasar 80k y otra al pasar 150k", () => {
  const ctx = setup({ tokens: 90000 });
  assert.match(ask(ctx, "sigue"), /🟡 Contexto en ~90k/);
  assert.equal(ask(ctx, "sigue"), "", "no repite");
  const big = { ...setup({ tokens: 160000 }), session: ctx.session, data: ctx.data };
  assert.match(ask(big, "sigue"), /🔴 Contexto en ~160k/);
});

test("avisa de caché fría tras más de una hora con contexto grande", () => {
  assert.match(ask(setup({ tokens: 40000, minutesAgo: 90 }), "sigue"), /⏱ Pasaron 90 min/);
  assert.equal(ask(setup({ tokens: 40000, minutesAgo: 30 }), "sigue"), "");
  assert.equal(ask(setup({ tokens: 10000, minutesAgo: 90 }), "sigue"), "", "contexto pequeño: no compensa avisar");
});

test("segunda corrección seguida sugiere /clear; una petición normal reinicia la cuenta", () => {
  const ctx = setup();
  assert.equal(ask(ctx, "no, sigue mal el salto"), "");
  assert.match(ask(ctx, "sigue fallando igual"), /🔁 Segunda corrección/);
  const otro = setup();
  assert.equal(ask(otro, "no, eso no"), "");
  assert.equal(ask(otro, "ahora añade el menú de pausa"), "");
  assert.equal(ask(otro, "otra vez falla"), "", "la cuenta se reinició");
});

test("effort que no encaja con la tarea", () => {
  assert.match(ask(setup(), "renombra la variable vida a salud", { CLAUDE_EFFORT: "max" }), /Effort max para un cambio pequeño/);
  assert.match(ask(setup(), "revisa la migración de la base de datos de usuarios", { CLAUDE_EFFORT: "low" }), /effort high/);
  assert.equal(ask(setup(), "renombra la variable vida a salud", { CLAUDE_EFFORT: "medium" }), "");
});

test("petición vaga solo en proyectos con .cru/ y sin detalles", () => {
  assert.match(ask(setup({ cru: true }), "arregla el menú"), /\/real-use:hacer/);
  assert.equal(ask(setup({ cru: false }), "arregla el menú"), "");
  assert.equal(ask(setup({ cru: true }), "arregla el menú en ui/menu.gd"), "", "con ruta ya hay detalle");
});

test("nivel coste solo deja contexto y caché; ninguno lo apaga todo", () => {
  const coste = { CLAUDE_PLUGIN_OPTION_AVISOS: "coste", CLAUDE_EFFORT: "max" };
  assert.equal(ask(setup({ cru: true }), "renombra la variable vida", coste), "");
  assert.match(ask(setup({ tokens: 90000 }), "sigue", coste), /Contexto/);
  assert.equal(ask(setup({ tokens: 160000, minutesAgo: 120 }), "sigue", { CLAUDE_PLUGIN_OPTION_AVISOS: "ninguno" }), "");
});

test("transcript ausente o roto no rompe el hook", () => {
  const ctx = { ...setup(), transcript: path.join(os.tmpdir(), "no-existe.jsonl") };
  assert.equal(ask(ctx, "hola"), "");
  const roto = setup();
  fs.writeFileSync(roto.transcript, '{"usage": roto\n');
  assert.equal(ask(roto, "hola"), "");
});

function hook(ctx, event, extra = {}, env = {}) {
  const out = execFileSync("node", [path.join(SCRIPTS, "copiloto.js")], {
    input: JSON.stringify({ session_id: ctx.session, cwd: ctx.dir, hook_event_name: event, ...extra }),
    env: { ...process.env, CLAUDE_PLUGIN_DATA: ctx.data, CLAUDE_PLUGIN_OPTION_AVISOS: "", ...env },
    encoding: "utf8",
  });
  return out ? JSON.parse(out).systemMessage : "";
}
const edit = (ctx, file) => hook(ctx, "PostToolUse", { tool_name: "Edit", tool_input: { file_path: file } });
const bash = (ctx, command) => hook(ctx, "PostToolUse", { tool_name: "Bash", tool_input: { command } });
const stop = (ctx) => hook(ctx, "Stop", { stop_hook_active: false });

test("avisa al terminar un turno con archivos cambiados sin verificar", () => {
  const ctx = setup();
  assert.equal(edit(ctx, "/p/player.gd"), "", "PostToolUse no avisa");
  edit(ctx, "/p/enemy.gd");
  assert.match(stop(ctx), /✏ 2 archivos cambiados sin ejecutar verificación \(player\.gd, enemy\.gd\)/);
});

test("ejecutar una verificación borra la cuenta", () => {
  const ctx = setup();
  edit(ctx, "/p/a.ts");
  bash(ctx, "cd app && npm test -- --run");
  assert.equal(stop(ctx), "");
});

test("reconoce el comando de Verificación: de .cru/PROJECT.md", () => {
  const ctx = setup({ cru: true });
  fs.writeFileSync(path.join(ctx.dir, ".cru", "PROJECT.md"), "- Verificación: `./check-all.sh`\n");
  edit(ctx, "/p/a.gd");
  bash(ctx, "./check-all.sh --fast");
  assert.equal(stop(ctx), "");
});

test("no avisa en cada turno: primero y luego cada 3", () => {
  const ctx = setup();
  edit(ctx, "/p/a.gd");
  const avisos = [stop(ctx), stop(ctx), stop(ctx), stop(ctx)].map((m) => Boolean(m));
  assert.deepEqual(avisos, [true, false, false, true]);
});

test("ignora ediciones en .cru/, stop_hook_active y nivel coste", () => {
  const ctx = setup();
  edit(ctx, "/p/.cru/TASKS.md");
  assert.equal(stop(ctx), "");
  const otro = setup();
  edit(otro, "/p/a.gd");
  assert.equal(hook(otro, "Stop", { stop_hook_active: true }), "");
  const coste = setup();
  hook(coste, "PostToolUse", { tool_name: "Write", tool_input: { file_path: "/p/b.gd" } }, { CLAUDE_PLUGIN_OPTION_AVISOS: "coste" });
  assert.equal(hook(coste, "Stop", {}, { CLAUDE_PLUGIN_OPTION_AVISOS: "coste" }), "");
});

function start(input, env = {}) {
  const out = execFileSync("node", [path.join(SCRIPTS, "session-start.js")], {
    input: JSON.stringify(input),
    env: { ...process.env, CLAUDE_PROJECT_DIR: "", CLAUDE_PLUGIN_OPTION_AVISOS: "", ...env },
    encoding: "utf8",
  });
  return out ? JSON.parse(out) : null;
}

test("session-start avisa al reanudar una sesión grande con caché caducada, aunque no haya .cru/", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "res-"));
  const base = { cwd: dir, source: "resume", context_tokens: 182340, prompt_cache_likely_expired: true };
  const out = start({ ...base, estimated_cache_write_usd: 1.1396 });
  assert.match(out.systemMessage, /~182k tokens/);
  assert.match(out.systemMessage, /\$1\.14/);
  assert.equal(out.hookSpecificOutput, undefined, "sin .cru/ no añade contexto");
  assert.equal(start({ ...base, prompt_cache_likely_expired: false }), null);
  assert.equal(start({ ...base, context_tokens: 20000 }), null);
  assert.equal(start(base, { CLAUDE_PLUGIN_OPTION_AVISOS: "ninguno" }), null);
});
