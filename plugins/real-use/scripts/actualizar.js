#!/usr/bin/env node
// Propone cambios a partir de las guías oficiales de Anthropic, OpenAI y Gemini.
// Solo escribe la propuesta (referencias/fuentes-propuesta.md). No toca skills, hooks ni .cru/.
// Uso: node actualizar.js [--fixture <carpeta con <id>.md>] [--fuentes <json>] [--decisiones <md>] [--salida <md>]
// Sin --fixture descarga cada URL con fetch.

const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const AVISO_CHOQUE = /evita|no recomiend|no uses|no utilices|avoid|not recommended|don't|do not/i;

function leerDecisiones(file) {
  let texto = "";
  try {
    texto = fs.readFileSync(file, "utf8");
  } catch {
    return [];
  }
  return texto
    .split(/^## (?=D-\d+)/m)
    .slice(1)
    .map((bloque) => ({ id: bloque.match(/^(D-\d+)/)[1], titulo: bloque.split(/\r?\n/)[0], texto: bloque }));
}

// Las páginas reales llegan en HTML: se reducen a texto con encabezados `## ` antes de analizarlas.
function htmlATexto(html) {
  if (!/<(html|body|div|p|h[1-6])\b/i.test(html)) return html;
  return html
    .replace(/<(script|style|template|svg|nav|header|footer)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, t) => "\n" + "#".repeat(Number(n)) + " " + t.replace(/<[^>]+>/g, "") + "\n")
    .replace(/<\/(p|li|div|pre|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ");
}

async function obtener(fuente, fixture) {
  if (fixture) return fs.readFileSync(path.join(fixture, `${fuente.id}.md`), "utf8");
  const res = await fetch(fuente.url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return htmlATexto(await res.text());
}

// Frases cortas: una línea larga no es una frase de guía.
function frases(texto) {
  return texto
    .split(/\r?\n|(?<=[.!?])\s+/)
    .map((l) => l.trim())
    .filter((l) => l && l.length <= 240);
}

function encabezados(texto) {
  return texto
    .split(/\r?\n/)
    .filter((l) => /^#{1,3} /.test(l))
    .map((l) => l.replace(/^#+ /, "").trim())
    .slice(0, 12);
}

// Una decisión choca (posible) si menciona un tema de la fuente y la guía tiene una frase
// con ese tema y una fórmula de "evita / no recomienda".
function choques(fuente, texto, decisiones) {
  const salida = [];
  const lista = frases(texto);
  for (const d of decisiones) {
    for (const tema of fuente.temas) {
      if (!d.texto.toLowerCase().includes(tema.toLowerCase())) continue;
      const linea = lista.find((l) => l.toLowerCase().includes(tema.toLowerCase()) && AVISO_CHOQUE.test(l));
      if (linea) {
        salida.push({ decision: d, tema, linea });
        break;
      }
    }
  }
  return salida;
}

async function actualizar(opciones = {}) {
  const fuentes = JSON.parse(fs.readFileSync(opciones.fuentes || path.join(RAIZ, "referencias", "fuentes.json"), "utf8"));
  const decisiones = leerDecisiones(opciones.decisiones || path.join(process.cwd(), ".cru", "DECISIONS.md"));
  const salida = opciones.salida || path.join(RAIZ, "referencias", "fuentes-propuesta.md");

  const partes = [
    "# Propuesta de actualización desde las guías oficiales",
    "",
    "Solo propone. No modifica skills, hooks ni `.cru/`. La persona decide qué aplicar.",
    "",
  ];
  for (const f of fuentes) {
    partes.push(`## ${f.proveedor} · ${f.id}`, "", f.url, "");
    let texto;
    try {
      texto = await obtener(f, opciones.fixture);
    } catch (e) {
      partes.push(`No se pudo leer ${f.id}: ${e.message}. Sin propuesta para esta guía.`, "");
      continue;
    }
    const heads = encabezados(texto);
    partes.push(heads.length ? `Secciones: ${heads.join(" · ")}` : "Sin secciones detectadas.", "");
    for (const c of choques(f, texto, decisiones)) {
      partes.push(
        `- Posible choque con ${c.decision.id} (${c.decision.titulo}), por coincidencia de palabras: la guía dice «${c.linea}» sobre «${c.tema}». Puede ser un falso positivo: léelo. La decisión ${c.decision.id} sigue vigente; la persona decide si se reabre.`,
      );
    }
    partes.push("");
  }
  fs.mkdirSync(path.dirname(salida), { recursive: true });
  fs.writeFileSync(salida, partes.join("\n"));
  return salida;
}

function arg(argv, nombre) {
  const i = argv.indexOf(nombre);
  return i >= 0 ? argv[i + 1] : undefined;
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  actualizar({
    fixture: arg(argv, "--fixture"),
    fuentes: arg(argv, "--fuentes"),
    decisiones: arg(argv, "--decisiones"),
    salida: arg(argv, "--salida"),
  })
    .then((file) => console.log(`Propuesta escrita en ${file}. No se modificó nada más.`))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}

module.exports = { actualizar };
