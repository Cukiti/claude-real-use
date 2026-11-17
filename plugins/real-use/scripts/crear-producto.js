#!/usr/bin/env node
// Selector de categoría: dado un directorio y una categoría, devuelve la recomendación.
// recomendar() no escribe nada. crear() escribe solo lo que falta y nunca pisa un .cru/ existente.
// No instala nada.
// Uso: node crear-producto.js <directorio> <juego|movil|web|escritorio> [--producto] [--pantallas] [--crear]

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CATEGORIAS = ["juego", "movil", "web", "escritorio"];

function tieneComando(cmd) {
  try {
    execFileSync(process.platform === "win32" ? "where" : "which", [cmd], { stdio: "ignore", windowsHide: true });
    return true;
  } catch {
    return false;
  }
}

function hay(dir, ...nombres) {
  return nombres.some((n) => fs.existsSync(path.join(dir, n)));
}

// Stack ya presente en el directorio (primer nivel). null si está vacío.
function detectar(dir) {
  if (hay(dir, "package.json")) return { stack: "Node", verificacion: "npm test", comando: "npm" };
  if (hay(dir, "pyproject.toml")) return { stack: "Python", verificacion: "pytest", comando: "pytest" };
  if (hay(dir, "Cargo.toml")) return { stack: "Rust", verificacion: "cargo test", comando: "cargo" };
  if (hay(dir, "go.mod")) return { stack: "Go", verificacion: "go test ./...", comando: "go" };
  return null;
}

function recomendar(dir, categoria, opciones = {}) {
  const tiene = opciones.tiene || tieneComando;
  if (!CATEGORIAS.includes(categoria)) {
    throw new Error(`Categoría desconocida "${categoria}". Elige una de: ${CATEGORIAS.join(", ")}.`);
  }
  let r;
  if (categoria === "juego") {
    r = {
      recomendacion: "Godot",
      metodologia: "Vertical slice",
      fase: "Prototipo",
      verificacion: "godot --headless",
      comando: "godot",
      presente: tiene("godot"),
    };
  } else if (categoria === "movil") {
    r = {
      recomendacion: "Android con Gradle",
      metodologia: "MVP por features",
      fase: "MVP",
      verificacion: "gradlew test",
      comando: "gradlew",
      presente: hay(dir, "gradlew", "gradlew.bat") || tiene("gradlew"),
    };
  } else if (categoria === "web") {
    const det = detectar(dir);
    r = {
      recomendacion: det ? `${det.stack} (stack detectado)` : "Sitio estático",
      metodologia: opciones.producto ? "Shape Up ligero" : "Kanban",
      fase: opciones.producto ? "Apuesta" : "Flujo continuo",
      verificacion: det ? det.verificacion : "abrir el HTML",
      comando: det ? det.comando : null,
      presente: det ? tiene(det.comando) : true,
    };
  } else {
    const det = detectar(dir);
    r = {
      recomendacion: det ? `${det.stack} (stack detectado)` : "Herramienta Node",
      metodologia: opciones.pantallas ? "MVP por features" : "TDD + semver",
      fase: opciones.pantallas ? "MVP" : "Pruebas primero",
      verificacion: det ? det.verificacion : "npm test",
      comando: det ? det.comando : "npm",
      presente: det ? tiene(det.comando) : tiene("npm"),
    };
  }
  const falta = r.comando && !r.presente ? r.comando : null;
  return {
    categoria,
    recomendacion: r.recomendacion,
    metodologia: r.metodologia,
    fase: r.fase,
    verificacion: r.verificacion,
    comandoFalta: falta,
    aviso: falta
      ? `Falta el comando \`${falta}\`: aún no se puede verificar y el proyecto no corre. Instala ese comando tú antes de seguir.`
      : null,
    primeraTarea: falta ? `Instalar ${falta} y comprobar que \`${r.verificacion}\` responde` : null,
  };
}

// Primera rebanada de tareas por categoría (metodologias.md). Cada una con hecho: y verif:.
function tareasDe(r, categoria) {
  const v = r.verificacion;
  const base = {
    juego: [
      ["Escena principal con el bucle de juego con placeholders", "se puede jugar 2 minutos", "ejecutar el proyecto y anotar si es divertido"],
      ["Una mecánica núcleo con su lógica separada de la escena", "la lógica se prueba sin escena", v],
      ["Checklist de la rebanada vertical", "un nivel con arte, sonido, UI y guardado listo", "build ejecutable sin errores"],
    ],
    movil: [
      ["Esqueleto de la app: navegación y tema", "la app compila y abre", v],
      ["Primera feature núcleo: datos, dominio y UI", "el flujo principal funciona", v],
      ["Prueba de UI del flujo principal", "el flujo pasa en emulador", v],
    ],
    web: [
      ["Página inicial con la estructura base", "la página se ve sin errores", v],
      ["Contenido y navegación principales", "se llega a cada sección", v],
      ["Revisión en móvil y escritorio", "se ve bien en 360 px y en pantalla ancha", "capturas en ambos tamaños"],
    ],
    escritorio: [
      ["Esqueleto del proyecto con un primer comando que funciona", "el comando responde", v],
      ["Primera función núcleo con su prueba", "la prueba pasa", v],
      ["Versión y registro de cambios", "versión inicial etiquetada", "git tag"],
    ],
  }[categoria];
  const lista = base.slice();
  if (r.primeraTarea) lista.unshift([r.primeraTarea, `\`${r.comandoFalta}\` responde en el PATH`, `\`${r.comandoFalta} --version\``]);
  return lista.map(([t, h, vf], i) => `- [ ] T-${String(i + 1).padStart(3, "0")} ${t} · hecho: ${h} · verif: ${vf}`);
}

const REGLA = fs.readFileSync(path.join(__dirname, "..", "plantillas", "AGENTS.md"), "utf8");

function escribirSiFalta(file, contenido, creado, nombre) {
  if (fs.existsSync(file)) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contenido);
  creado.push(nombre);
}

function huecosDe(dir) {
  const huecos = [];
  const proyecto = fs.readFileSync(path.join(dir, ".cru", "PROJECT.md"), "utf8");
  if (!/^- Verificación:\s*\S/m.test(proyecto) || /Verificación:\s*<.*>/.test(proyecto)) huecos.push("sin verificación");
  let tareas = "";
  try {
    tareas = fs.readFileSync(path.join(dir, ".cru", "TASKS.md"), "utf8");
  } catch {}
  if (!/^- \[[ ~!x]\] T-\d+/m.test(tareas)) huecos.push("sin tareas");
  let agents = "";
  try {
    agents = fs.readFileSync(path.join(dir, "AGENTS.md"), "utf8");
  } catch {}
  if (!/la persona decide/i.test(agents)) huecos.push("sin la regla en AGENTS.md");
  return huecos;
}

// Crea solo lo que falta. Si .cru/PROJECT.md ya existe no crea nada: devuelve los huecos.
function crear(dir, categoria, opciones = {}) {
  const r = recomendar(dir, categoria, opciones);
  const creado = [];
  if (fs.existsSync(path.join(dir, ".cru", "PROJECT.md"))) return { creado, huecos: huecosDe(dir), recomendacion: r };

  const fecha = opciones.fecha || new Date().toISOString().slice(0, 10);
  const nombre = path.basename(path.resolve(dir));
  const cru = (f) => path.join(dir, ".cru", f);
  const stack = r.recomendacion.replace(/ \(stack detectado\)$/, "");
  escribirSiFalta(
    cru("PROJECT.md"),
    `# Proyecto

- Nombre: ${nombre}
- Tipo: ${categoria}
- Stack: ${stack}
- Metodología: ${r.metodologia}
- Fase: ${r.fase}
- Verificación: \`${r.verificacion}\`

## Visión (una frase)
<Qué es y para quién.>
`,
    creado, ".cru/PROJECT.md");
  escribirSiFalta(
    cru("TASKS.md"),
    `# Tareas

## En curso

## Pendiente
${tareasDe(r, categoria).join("\n")}

## Bloqueado

## Hecho
`,
    creado, ".cru/TASKS.md");
  escribirSiFalta(
    cru("LOG.md"),
    `# Bitácora de sesiones

## ${fecha} · Proyecto creado
- Hecho: categoría ${categoria}, ${r.metodologia}.
- Queda: T-001.
- Decisiones: D-001.
`,
    creado, ".cru/LOG.md");
  escribirSiFalta(
    cru("DECISIONS.md"),
    `# Decisiones

## D-001 · ${fecha} · Categoría y metodología
- Contexto: empezar un producto nuevo.
- Opciones: las cuatro categorías.
- Elegida: ${categoria} con ${r.metodologia}.
- Consecuencias: verificación \`${r.verificacion}\`.
`,
    creado, ".cru/DECISIONS.md");

  const agents = path.join(dir, "AGENTS.md");
  if (!fs.existsSync(agents)) {
    fs.writeFileSync(agents, REGLA);
    creado.push("AGENTS.md");
    const claude = path.join(dir, "CLAUDE.md");
    if (fs.existsSync(claude) && !/@AGENTS\.md/.test(fs.readFileSync(claude, "utf8"))) {
      fs.appendFileSync(claude, "\n@AGENTS.md\n");
      creado.push("CLAUDE.md (importa AGENTS.md)");
    }
  } else if (!/la persona decide/i.test(fs.readFileSync(agents, "utf8"))) {
    fs.appendFileSync(agents, "\n" + REGLA);
    creado.push("AGENTS.md (regla añadida)");
  }
  return { creado, huecos: huecosDe(dir), recomendacion: r };
}

function main(argv) {
  const [dir, categoria, ...flags] = argv;
  if (!dir || !categoria) {
    console.error("Uso: crear-producto.js <directorio> <juego|movil|web|escritorio> [--producto] [--pantallas]");
    return 1;
  }
  try {
    const opciones = { producto: flags.includes("--producto"), pantallas: flags.includes("--pantallas") };
    if (flags.includes("--crear")) {
      const res = crear(path.resolve(dir), categoria, opciones);
      console.log(res.creado.length ? `Creado: ${res.creado.join(", ")}` : "No se creó nada: .cru/ ya existe.");
      console.log(res.huecos.length ? `Huecos: ${res.huecos.join(", ")}` : "Sin huecos.");
      if (res.recomendacion.aviso) console.log(`Aviso: ${res.recomendacion.aviso}`);
      return 0;
    }
    const r = recomendar(path.resolve(dir), categoria, opciones);
    console.log(`Categoría: ${r.categoria}`);
    console.log(`Recomendación: ${r.recomendacion}`);
    console.log(`Metodología: ${r.metodologia} · Fase: ${r.fase}`);
    console.log(`Verificación: ${r.verificacion}`);
    if (r.aviso) console.log(`Aviso: ${r.aviso}`);
    if (r.primeraTarea) console.log(`Primera tarea: ${r.primeraTarea}`);
    return 0;
  } catch (e) {
    console.error(e.message);
    return 1;
  }
}

if (require.main === module) process.exit(main(process.argv.slice(2)));
module.exports = { recomendar, crear, CATEGORIAS };
