#!/usr/bin/env node
// Hook UserPromptSubmit: avisos al usuario (systemMessage) en el momento en que importan.
// No llama al modelo y no añade nada al contexto de Claude: cuesta cero tokens.
// Cada aviso se muestra una sola vez por sesión (o por umbral), para no ser ruido.
//
// Avisos:
//   contexto      la conversación supera ~80k / ~150k tokens de contexto
//   cache         pasó más de una hora desde la última respuesta con un contexto grande
//   correcciones  dos correcciones seguidas ("no, sigue mal…")
//   effort        effort alto para un cambio pequeño, o bajo para algo delicado
//   vago          petición muy corta y sin detalles en un proyecto con .cru/
//
// Nivel (opción del plugin "avisos"): todos | coste | ninguno. "coste" deja solo contexto y caché.

const fs = require("fs");
const os = require("os");
const path = require("path");

const CTX_AVISO = 80000;
const CTX_FUERTE = 150000;
const CACHE_MIN = 60;
const TAIL_BYTES = 512 * 1024;

function readStdin() {
  try {
    const data = JSON.parse(fs.readFileSync(0, "utf8") || "{}");
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

// Últimas líneas del transcript: uso de contexto y hora de la última respuesta.
function readTranscript(file) {
  const out = { contextTokens: 0, lastAssistantAt: null };
  if (!file) return out;
  let text;
  try {
    const fd = fs.openSync(file, "r");
    const size = fs.fstatSync(fd).size;
    const start = Math.max(0, size - TAIL_BYTES);
    const buf = Buffer.alloc(size - start);
    fs.readSync(fd, buf, 0, buf.length, start);
    fs.closeSync(fd);
    text = buf.toString("utf8");
  } catch {
    return out;
  }
  const lines = text.split("\n").reverse();
  for (const line of lines) {
    if (!line.includes('"usage"')) continue;
    try {
      const entry = JSON.parse(line);
      const u = entry.message && entry.message.usage;
      if (!u) continue;
      out.contextTokens =
        (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
      if (entry.timestamp) out.lastAssistantAt = Date.parse(entry.timestamp) || null;
      break;
    } catch {
      // línea parcial al inicio del bloque leído
    }
  }
  return out;
}

function stateFile(sessionId) {
  const base = process.env.CLAUDE_PLUGIN_DATA || path.join(os.tmpdir(), "real-use");
  fs.mkdirSync(base, { recursive: true });
  return path.join(base, `copiloto-${String(sessionId || "sin-sesion").replace(/[^\w-]/g, "_")}.json`);
}

function loadState(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { shown: {}, corrections: 0 };
  }
}

const k = (n) => `${Math.round(n / 1000)}k`;

const CORRECCION = /^\s*(no[,.!]|no es|sigue (mal|igual|sin)|otra vez|todav[ií]a (no|falla|sale)|eso no|est[aá] mal|vuelve a fallar|sigue fallando)/i;
const DELICADO = /\b(seguridad|auth|login|contraseña|password|pago|cobro|migraci[oó]n|race|concurrencia|producci[oó]n|datos de usuarios)\b/i;
const PEQUENO = /\b(typo|errata|renombra|cambia el (texto|color|icono)|a[nñ]ade un log|quita el log|comentario)\b/i;
const VAGO = /^\s*(arregla|haz|mejora|cambia|pon|quita|a[nñ]ade|optimiza)\b/i;

function advise(input, env, now = Date.now()) {
  const nivel = (env.CLAUDE_PLUGIN_OPTION_AVISOS || "todos").toLowerCase();
  if (nivel === "ninguno") return null;
  const todos = nivel !== "coste";

  const prompt = String(input.prompt || "");
  const file = stateFile(input.session_id);
  const state = loadState(file);
  const msgs = [];
  const once = (key, msg) => {
    if (state.shown[key]) return;
    state.shown[key] = true;
    msgs.push(msg);
  };

  const t = readTranscript(input.transcript_path);

  // Caché fría: la primera petición tras una pausa larga relee todo el contexto sin caché.
  if (t.lastAssistantAt && t.contextTokens > 30000) {
    const minutes = (now - t.lastAssistantAt) / 60000;
    if (minutes > CACHE_MIN) {
      const key = `cache-${t.lastAssistantAt}`;
      once(
        key,
        `⏱ Pasaron ${Math.round(minutes)} min: la caché expiró y este mensaje reprocesa ~${k(t.contextTokens)} tokens. ` +
          "Si vas a cambiar de tarea, /real-use:cerrar y luego /clear sale más barato."
      );
    }
  }

  // Contexto que crece: cada turno reenvía toda la conversación.
  if (t.contextTokens >= CTX_FUERTE) {
    once(
      "ctx-fuerte",
      `🔴 Contexto en ~${k(t.contextTokens)} tokens: cada turno es caro y la calidad baja. ` +
        "Termina la tarea actual y haz /real-use:cerrar + /clear (el estado queda en .cru/)."
    );
  } else if (t.contextTokens >= CTX_AVISO) {
    once(
      "ctx-aviso",
      `🟡 Contexto en ~${k(t.contextTokens)} tokens. Al acabar esta tarea: /clear (gratis) o /compact <qué conservar>.`
    );
  }

  if (todos) {
    // Correcciones seguidas: el contexto ya está lleno de intentos fallidos.
    if (CORRECCION.test(prompt)) {
      state.corrections = (state.corrections || 0) + 1;
      if (state.corrections >= 2) {
        once(
          `correcciones-${Math.floor(state.corrections / 2)}`,
          "🔁 Segunda corrección seguida. Suele rendir más /clear y un prompt nuevo con lo aprendido " +
            "(qué falla, qué ya probaste, cómo se comprueba) que una tercera corrección."
        );
      }
    } else if (prompt.trim()) {
      state.corrections = 0;
    }

    // Effort que no encaja con la petición.
    const effort = (env.CLAUDE_EFFORT || "").toLowerCase();
    const palabras = prompt.trim().split(/\s+/).filter(Boolean).length;
    if (["xhigh", "max"].includes(effort) && PEQUENO.test(prompt) && palabras <= 20) {
      once("effort-alto", `⚙ Effort ${effort} para un cambio pequeño: con /effort low o medium sale igual y más barato.`);
    } else if (effort === "low" && DELICADO.test(prompt)) {
      once("effort-bajo", "⚙ Tarea delicada con effort low: para verificarla conviene /effort high (no rompe la caché).");
    }

    // Petición vaga en un proyecto organizado.
    const cwd = input.cwd || process.cwd();
    const tieneDetalle = /[\\/.]\w|T-\d+|`|:\d+/.test(prompt);
    if (palabras > 0 && palabras <= 6 && VAGO.test(prompt) && !tieneDetalle && fs.existsSync(path.join(cwd, ".cru"))) {
      once("vago", "💡 Petición corta: /real-use:hacer <lo mismo> la convierte en tarea completa (objetivo, terminado, verificación).");
    }
  }

  try {
    fs.writeFileSync(file, JSON.stringify(state));
  } catch {
    // sin estado solo se repetirían avisos
  }
  return msgs.length ? msgs.join("\n") : null;
}

function main() {
  const msg = advise(readStdin(), process.env);
  if (msg) process.stdout.write(JSON.stringify({ systemMessage: msg }));
}

if (require.main === module) {
  try {
    main();
  } catch {
    // Un aviso nunca debe bloquear el prompt del usuario.
  }
}

module.exports = { advise, readTranscript };
