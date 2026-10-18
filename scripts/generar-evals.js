#!/usr/bin/env node
// Genera plugins/real-use/evals/: casos de activación de skills (qué skill se dispara con cada frase).
// Fuente de verdad: la tabla CASOS de abajo. Regenerar con `npm run evals:generar`.
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "plugins", "real-use", "evals");

// Las skills con disable-model-invocation (ahorro, panel) no entran: Claude no puede invocarlas.
const CASOS = [
  // [nombre, skill esperada | null, skills que NO deben activarse, prompt]
  ["hacer-bug-vago", "hacer", ["experto"], "arregla lo del guardado, que a veces no guarda la partida"],
  ["hacer-feature", "hacer", ["spec"], "quiero añadir un botón de modo oscuro a la pantalla de ajustes"],
  ["hacer-lista", "hacer", [], "haz esto: que el menú cargue más rápido, cambiar el icono de la app y quitar el log de depuración"],
  ["experto-seguridad", "experto", ["hacer"], "revisa este endpoint como lo haría un experto en seguridad: app.post('/login', (req,res) => db.query(\"SELECT * FROM users WHERE name='\" + req.body.user + \"'\"))"],
  ["experto-game-design", "experto", ["hacer"], "dame la opinión de un diseñador de juegos sobre este bucle: el jugador mata slimes, gana oro y compra espadas que matan slimes más rápido"],
  ["spec-sistema-grande", "spec", ["hacer"], "quiero construir un sistema de inventario con crafteo y comercio entre jugadores; antes de programar nada definamos bien cómo debe funcionar"],
  ["siguiente-continuar", "siguiente", [], "sigue con lo que toca en el proyecto"],
  ["cerrar-dia", "cerrar", [], "ya terminamos por hoy, deja todo listo para seguir mañana"],
  ["iniciar-proyecto", "iniciar", [], "quiero organizar este proyecto nuevo de juego de cartas en Godot con una metodología y una lista de tareas"],
  ["pendientes-cosas-a-medias", "pendientes", [], "siento que en este repo hay muchas cosas a medias, ¿qué quedó sin terminar?"],
  ["enrutar-modelo", "enrutar", [], "¿qué modelo, effort y tipo de agente debería usar para migrar 200 archivos de Python 2 a Python 3?"],
  ["paralelo-tres-tareas", "paralelo", [], "tengo tres tareas independientes y quiero hacerlas a la vez en sesiones separadas"],
  ["verificar-antes-commit", "verificar", [], "antes de hacer commit, comprueba que de verdad funciona lo que hicimos"],
  ["menu-no-se-que-hacer", "menu", ["hacer"], "no sé por dónde seguir con el proyecto ni qué comandos tengo, ¿qué me recomiendas?"],
  ["equipo-varios-roles", "equipo", ["hacer"], "quiero que varios expertos trabajen juntos en la pantalla de tienda del juego: uno de game design, uno de interfaz y alguien de QA que la revise"],
  ["conectar-mcp", "conectar", [], "¿qué servidores MCP o conectores me convienen para este proyecto y cuáles me sobran?"],
  ["neg-concepto", null, [], "¿qué es una closure en JavaScript? Responde en dos frases."],
  ["neg-traduccion", null, [], "traduce al inglés: 'el jugador perdió todas sus vidas'"],
  ["neg-regex", null, [], "escribe una regex que valide un correo electrónico sencillo"],
];

const SISTEMA =
  "Esto es una prueba de activación de skills en un directorio vacío. Actúa con normalidad: si una skill aplica a la petición, invócala. " +
  "Después de invocarla no ejecutes sus pasos ni otras herramientas: responde en una línea qué harías a continuación.";

const skillRegex = (skill) => `'"skill"\\s*:\\s*"(?:[\\w-]+:)?${skill}"'`;

function grader(file, body) {
  fs.writeFileSync(file, body.trim() + "\n");
}

// Borra los casos anteriores pero conserva results/ (informes locales de ejecuciones).
fs.mkdirSync(DIR, { recursive: true });
for (const d of fs.readdirSync(DIR)) {
  if (d !== "results") fs.rmSync(path.join(DIR, d), { recursive: true, force: true });
}
for (const [nombre, skill, evitar, prompt] of CASOS) {
  const dir = path.join(DIR, nombre);
  fs.mkdirSync(path.join(dir, "graders"), { recursive: true });
  const tag = skill ? `activacion-${skill}` : "no-activacion";
  fs.writeFileSync(
    path.join(dir, "prompt.md"),
    [
      "---",
      `description: ${skill ? `debe activar ${skill}` : "no debe activar ninguna skill de real-use"}`,
      `tags: [activacion, ${tag}]`,
      "max_turns: 4",
      "timeout_seconds: 180",
      "allowed_tools: [Skill, Read, Glob, Grep]",
      `append_system_prompt: "${SISTEMA}"`,
      "---",
      "",
      prompt,
      "",
    ].join("\n")
  );
  if (skill) {
    grader(path.join(dir, "graders", "activa.md"), `---\ntype: tool_used\ntool: Skill\ninput_match: ${skillRegex(skill)}\narm: both\n---`);
  } else {
    grader(
      path.join(dir, "graders", "no-activa.md"),
      `---\ntype: tool_used\ntool: Skill\ninput_match: '"skill"\\s*:\\s*"real-use:'\nmin: 0\nmax: 0\narm: both\n---`
    );
  }
  for (const otra of evitar) {
    grader(
      path.join(dir, "graders", `no-${otra}.md`),
      `---\ntype: tool_used\ntool: Skill\ninput_match: ${skillRegex(otra)}\nmin: 0\nmax: 0\narm: both\n---`
    );
  }
}
console.log(`${CASOS.length} casos en ${path.relative(process.cwd(), DIR)}`);
