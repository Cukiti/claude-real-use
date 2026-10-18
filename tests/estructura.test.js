// Comprueba que las referencias internas del plugin apuntan a archivos que existen.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..", "plugins", "real-use");

function markdownFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return markdownFiles(p);
    return e.name.endsWith(".md") ? [p] : [];
  });
}

const sources = [...markdownFiles(path.join(ROOT, "skills")), ...markdownFiles(path.join(ROOT, "agents"))];

test("toda ruta ${CLAUDE_PLUGIN_ROOT}/… citada existe", () => {
  const missing = [];
  for (const file of sources) {
    const text = fs.readFileSync(file, "utf8");
    for (const m of text.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([\w./-]+)/g)) {
      const rel = m[1].replace(/[.)]+$/, "");
      if (rel.includes("<")) continue;
      if (!fs.existsSync(path.join(ROOT, rel))) missing.push(`${path.relative(ROOT, file)} → ${rel}`);
    }
  }
  assert.deepEqual(missing, []);
});

test("cada lente de la tabla de /experto tiene su archivo y viceversa", () => {
  const skill = fs.readFileSync(path.join(ROOT, "skills", "experto", "SKILL.md"), "utf8");
  const listed = [...skill.matchAll(/^\| `([\w-]+)` \|/gm)].map((m) => m[1]).sort();
  const files = fs
    .readdirSync(path.join(ROOT, "referencias", "lentes"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
  assert.deepEqual(listed, files);
});

test("cada lente tiene las secciones que usan /experto y el revisor", () => {
  const dir = path.join(ROOT, "referencias", "lentes");
  for (const f of fs.readdirSync(dir)) {
    const text = fs.readFileSync(path.join(dir, f), "utf8");
    for (const s of ["## Preguntas antes de empezar", "## Antipatrones", "## Entrega", "## Cómo se verifica"]) {
      assert.ok(text.includes(s), `${f} no tiene "${s}"`);
    }
  }
});

test("los evals solo esperan skills que existen y que el modelo puede invocar", () => {
  const evals = path.join(ROOT, "evals");
  for (const caso of fs.readdirSync(evals).filter((d) => d !== "results")) {
    for (const g of fs.readdirSync(path.join(evals, caso, "graders"))) {
      const text = fs.readFileSync(path.join(evals, caso, "graders", g), "utf8");
      const m = text.match(/\?(\w[\w-]*)"'$/m);
      if (!m) continue;
      const skill = fs.readFileSync(path.join(ROOT, "skills", m[1], "SKILL.md"), "utf8");
      assert.doesNotMatch(skill, /^disable-model-invocation: true$/m, `${caso}: ${m[1]} no es invocable por el modelo`);
    }
  }
});

test("cada skill tiene name igual a su carpeta y description", () => {
  for (const dir of fs.readdirSync(path.join(ROOT, "skills"))) {
    const text = fs.readFileSync(path.join(ROOT, "skills", dir, "SKILL.md"), "utf8");
    assert.match(text, new RegExp(`^---[\\s\\S]*?^name: ${dir}$`, "m"), dir);
    const desc = text.match(/^description: (.+)$/m);
    assert.ok(desc && desc[1].length <= 1536, `${dir}: description ausente o > 1536`);
  }
});
