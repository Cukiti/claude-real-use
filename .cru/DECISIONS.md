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
