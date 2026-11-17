#!/usr/bin/env node
// Adaptador de Codex. No tiene resumen propio: delega en retomar.js.
// No se instala solo. Quien use Codex puede copiarlo sobre resume.cjs.

const { spawnSync } = require("child_process");
const path = require("path");

const script = path.join(__dirname, "..", "scripts", "retomar.js");
const result = spawnSync(process.execPath, [script, ...process.argv.slice(2)], { stdio: "inherit" });
process.exit(result.status == null ? 1 : result.status);
