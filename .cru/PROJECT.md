# Proyecto

- Nombre: Claude Real Use
- Tipo: librería/CLI (plugin de Claude Code)
- Stack: Markdown (skills/agentes), Node.js (hooks y status line), JSON (manifiestos)
- Metodología: TDD + semver
- Fase: Publicado (v0.2.0)
- Verificación: `npm test && npm run validate`

## Visión (una frase)
Que cualquier programador use Claude Code como lo recomienda Anthropic sin tener que pensarlo: estado en archivos, tareas verificables, coste justo y sesiones que se cierran.

## Definición de terminado del producto
- El plugin se instala desde GitHub con dos comandos y pasa `claude plugin validate`.
- Un proyecto real pasa por iniciar → siguiente → verificar → cerrar sin intervención fuera de las preguntas con opciones.
- Las skills se disparan cuando corresponde (evals de activación pasan).

## Fuera de alcance
- Sustituir gestores de proyectos de equipo (Linear, Jira): se integran vía MCP si hace falta.
- Mods de interfaz hasta que Claude Code ≥ 2.1.287 esté instalado.

## Hitos
1. v0.1 — Plugin base validado — ✔
2. v0.2 — Tests, recetas de verificación, paralelo, panel, prompts — ✔
3. v0.3 — Probado en una sesión real y en un proyecto real; publicado en GitHub
4. v1.0 — Evals de activación de skills y mod de tarea actual
