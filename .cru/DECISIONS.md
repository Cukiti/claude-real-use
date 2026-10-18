# Decisiones

## D-001 · 2026-10-17 · El estado vive en archivos Markdown dentro del repo (.cru/)
- Contexto: las sesiones se compactan y se pierden; los programadores dejan trabajo a medias.
- Opciones: base de datos/servicio, MCP de gestión de tareas, archivos en el repo.
- Elegida: archivos Markdown en `.cru/`: gratis, versionados con git, legibles por humanos y por Claude, y viajan a las sesiones en la nube.
- Consecuencias: el formato de `TASKS.md` es un contrato con el hook; cambiarlo exige actualizar `session-start.js` y sus tests.

## D-002 · 2026-10-17 · Nombre del plugin "real-use" (no "claude-real-use")
- Contexto: `claude plugin validate` rechaza nombres que empiezan por `claude-`.
- Elegida: plugin `real-use`; el repositorio mantiene el nombre "Claude Real Use".

## D-003 · 2026-10-17 · Un solo hook (SessionStart), sin Stop ni UserPromptSubmit
- Contexto: los hooks por turno añaden coste y fricción en cada mensaje.
- Elegida: solo SessionStart, que no imprime nada sin `.cru/` y recorta a ~1.800 caracteres. El cierre de sesión es una skill que el usuario o Claude invocan.
- Consecuencias: si algún día hace falta forzar verificación, se añadirá como Stop hook opcional, no por defecto.

## D-004 · 2026-10-17 · Mods aplazados
- Contexto: los mods requieren Claude Code ≥ 2.1.287; la versión instalada es 2.1.283 y su API puede cambiar entre versiones.
- Elegida: status line (estable) ahora; mod de "tarea actual" como T-016.

## D-005 · 2026-10-17 · Lentes expertas en vez de "roles"
- Contexto: es habitual escribir "eres un experto en X". Anthropic confirma que un rol enfoca el tono, pero el resultado cambia con criterios, el porqué, ejemplos y verificación.
- Opciones: un subagente por especialidad; una skill por especialidad; una skill con lentes en archivos.
- Elegida: una sola skill (`experto`) con lentes en `referencias/lentes/`. Solo una descripción entra en el listado de cada sesión y cada lente se lee bajo demanda, así que añadir lentes no cuesta tokens fijos.
- Consecuencias: cada lente debe tener las secciones que comprueba `tests/estructura.test.js`.

## D-006 · 2026-10-17 · Avisos al usuario por systemMessage, sin contexto ni modelo
- Contexto: el usuario sufre por los tokens y no sabe cuándo hacer /clear, qué effort usar o cuándo una corrección más ya no compensa.
- Opciones: inyectar consejos a Claude (additionalContext), un hook con modelo (prompt hook), heurísticas deterministas con systemMessage.
- Elegida: heurísticas en node que solo emiten systemMessage (lo ve el usuario y no entra en el contexto) y salen una vez por sesión o por umbral. Coste: cero tokens.
- Consecuencias: el uso de contexto se lee de la cola del transcript (el campo usage del último mensaje), que es un formato interno; si cambia, el aviso de contexto deja de salir pero no rompe nada.

## D-007 · 2026-10-18 · Un solo punto de entrada visual: menu (sin skill tablero aparte)
- Contexto: tablero y menu respondían a la misma necesidad ("¿qué hago ahora?") y cada skill cuesta contexto fijo en todas las sesiones.
- Elegida: menu dibuja el tablero con botones cuando hay una herramienta de widgets (app de escritorio y claude.ai) y usa AskUserQuestion en la terminal.

## D-008 · 2026-10-18 · Bot de revisión sobre la GitHub Action oficial + REVIEW.md
- Contexto: el usuario quiere un revisor que mejore con cada implementación, para cualquier tipo de app.
- Opciones: bot propio, workflow personalizado, Action oficial de /install-github-app, Code Review gestionado.
- Elegida: recomendar la Action oficial (mantenida por Anthropic) y llevar el criterio del proyecto en REVIEW.md enlazado desde CLAUDE.md; plantilla propia como alternativa. Aprende vía el paso "Aprender" de /real-use:cerrar.
- Consecuencias: el secreto (CLAUDE_CODE_OAUTH_TOKEN o ANTHROPIC_API_KEY) lo crea y guarda el usuario; el plugin nunca toca credenciales.

## D-009 · 2026-10-18 · Contrato del modo adoptar
- Contexto: en Colmadón, iniciar ofreció "adoptar sin migrar", pero el hook, cerrar y siguiente seguían suponiendo .cru/TASKS.md (7 fricciones).
- Elegida: `- Tareas: \`<archivo>\`` y `- Bitácora: \`<archivo>\` (entrada arriba)` en PROJECT.md. El hook lee esos archivos (casillas si las hay; si no, las secciones) y la entrada más reciente según el orden; las skills escriben con el formato y el orden del archivo adoptado.
- Consecuencias: un eval de resultado (cerrar-modo-adoptar) protege el orden de la bitácora.
