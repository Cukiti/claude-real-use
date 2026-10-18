# Proyecto

- Nombre: Claude Real Use
- Tipo: librería/CLI (plugin de Claude Code)
- Stack: Markdown (skills/agentes), Node.js (hooks y status line), JSON (manifiestos)
- Metodología: TDD + semver
- Fase: Probado en proyecto real (v0.7.0)
- Verificación: `npm test && npm run validate`
- Presupuesto: gratis (solo herramientas sin coste, salvo el plan de Claude)
- Mapa: https://claude.ai/artifact/PdDsWLvSVjj7eojogUcYBq

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

## Stack
- Lenguaje: JavaScript (Node.js 22+) (gratis)
- Contenido: Markdown (skills, agentes, lentes) (gratis)
- Plataforma: Claude Code: plugins, hooks, skills y evals (pago)
- Repositorio y CI: GitHub privado + GitHub Actions (gratis)
- Pruebas: node:test + claude plugin eval (gratis)
