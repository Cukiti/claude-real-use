# Criterios de revisión

## Qué significa "roto" en este proyecto
- Un script de `plugins/real-use/scripts/` que lanza una excepción con stdin vacío o malformado, o que imprime algo distinto de su contrato.
- Un cambio en el formato de `.cru/TASKS.md` sin actualizar `scripts/session-start.js` y `tests/scripts.test.js`.
- Una skill, agente o referencia que cita una ruta `${CLAUDE_PLUGIN_ROOT}/…` inexistente.

## Revisa siempre
- El cambio cumple el criterio de terminado de su tarea en `.cru/TASKS.md` o de su spec en `.cru/specs/`.
- No contradice ninguna decisión de `.cru/DECISIONS.md`.
- Todo texto para el usuario está en español.
- Las skills son cortas; el detalle va en `plugins/real-use/referencias/`.
- No hay afirmaciones sobre Claude Code sin fuente en la documentación oficial (las fuentes van en `GUIA.md`).
- Un cambio de comportamiento trae su test en `tests/`.

## No comentes
- Estilo que ya cubre el formateador.
- Preferencias sin impacto en corrección ni en los criterios de arriba.
- Rutas a ignorar: `node_modules/`, `assets/`, `.cru/LOG.md`.

## Aprendido
