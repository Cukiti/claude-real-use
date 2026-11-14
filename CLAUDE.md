# Claude Real Use

Estado del proyecto y tareas: .cru/ (sistema Real Use).

## Comandos
- Tests de los scripts: `npm test`
- Validar manifiestos: `npm run validate` (requiere la CLI `claude`)
- Probar el plugin sin instalarlo: `claude --plugin-dir ./plugins/real-use`

## Convenciones
- Todo el contenido para el usuario en español.
- El formato de `.cru/TASKS.md` es un contrato con `plugins/real-use/scripts/session-start.js`: si cambia, actualizar el script y `tests/scripts.test.js`.
- Las skills deben ser cortas; el detalle va en `plugins/real-use/referencias/` y se lee con `${CLAUDE_PLUGIN_ROOT}` solo cuando hace falta.
- Toda decisión al usuario se presenta con AskUserQuestion, opción recomendada primero.
- Nada de afirmaciones sobre Claude Code sin fuente en la documentación oficial; las fuentes van en GUIA.md.

## Revisión
- Al revisar código, aplica REVIEW.md.
