// Banda sobre el prompt: tarea [~] de .cru/TASKS.md y % de contexto.
// AbovePrompt se dibuja en terminal y en escritorio (docs de mods, sitio AbovePrompt).
// https://code.claude.com/docs/en/plugins/mods/reference

const banda = { plugin: "real-use", key: "banda" };

function taskTitle(text) {
  const m = text.match(/^[ \t]*[-*][ \t]*\[~\][ \t]*(\S.*)$/m);
  const title = m ? m[1].split("·")[0].trim() : "";
  if (!title) return "sin tarea en curso";
  const chars = Array.from(title);
  return chars.length > 48 ? chars.slice(0, 47).join("") + "…" : title;
}

function asText(value) {
  if (typeof value === "string") return value;
  if (value && typeof value.value === "string") return value.value;
  return null;
}

async function refresh($) {
  let task = null;
  try {
    const cwd = await $.session.cwd();
    const dir = asText(cwd) || (typeof cwd === "string" ? cwd : "");
    if (dir) {
      const raw = await $.fs.read(dir.replace(/[/\\]+$/, "") + "/.cru/TASKS.md");
      const text = asText(raw);
      if (text != null) task = taskTitle(text);
    }
  } catch {
    task = null;
  }

  let percent = null;
  try {
    const usage = await $.session.usage();
    const context = usage && (usage.context || (usage.value && usage.value.context));
    const pct = context && context.percent;
    if (typeof pct === "number" && Number.isFinite(pct)) {
      percent = Math.min(100, Math.max(0, Math.round(pct)));
    }
  } catch {
    percent = null;
  }

  await $.state.set(banda, { task, percent });
}

function contextColor(percent) {
  if (percent >= 75) return "red";
  if (percent >= 50) return "yellow";
  return undefined;
}

export function register(on) {
  on("session.start", async ($, e, next) => {
    const result = await next(e);
    try {
      await refresh($);
    } catch {
      // La banda no debe romper el arranque.
    }
    return result;
  });

  on("turn.complete", async ($, e, next) => {
    const result = await next(e);
    if (!e.agentId) {
      try {
        await refresh($);
      } catch {
        // Un fallo de lectura deja la banda como estaba.
      }
    }
    return result;
  });

  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    if (e.props && e.props.hasSurvey) return next(e);
    let data = { task: null, percent: null };
    try {
      const got = await $.state.get(banda);
      if (got && got.value) data = got.value;
    } catch {
      return next(e);
    }
    if (data.task == null && data.percent == null) return next(e);

    const { Box, Text } = $.ui.resolve(e);
    const children = [];
    if (data.task) children.push(Text({ children: data.task }));
    if (data.percent != null) {
      const color = contextColor(data.percent);
      const label = data.task ? `  ctx ${data.percent}%` : `ctx ${data.percent}%`;
      children.push(Text(color ? { color, children: label } : { children: label }));
    }
    return Box({ flexDirection: "row", paddingX: 1, children });
  });
}
