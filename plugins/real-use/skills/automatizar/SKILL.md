---
name: automatizar
description: Proponer automatizaciones (hooks, tareas programadas, routines, GitHub Actions, /loop, /goal) según lo que se repite, para que el usuario apruebe cuáles quiere, y configurarlas. Usar cuando pidan automatizar algo o que pase siempre o cada cierto tiempo.
argument-hint: "[qué quieres automatizar, opcional]"
---

# Automatizar con aprobación

Petición (opcional): $ARGUMENTS

## 1. Detectar candidatas (sin leer código)

Lee `${CLAUDE_PLUGIN_ROOT}/referencias/automatizaciones.md`. Busca señales con comandos baratos:
- `.cru/LOG.md` y `DECISIONS.md`: tareas que se repiten, correcciones recurrentes ("otra vez el formato").
- `git log --oneline -30`: commits repetitivos (formato, versión, dependencias).
- `.github/workflows/`: qué CI existe ya.
- `.claude/settings.json` del proyecto: hooks que ya hay (no los dupliques).
- `Verificación:` de `.cru/PROJECT.md` y el stack.

Si el usuario nombró algo concreto, céntrate en eso y elige el mecanismo con la tabla "Qué mecanismo usar".

## 2. Proponer

Como máximo 4 propuestas, ordenadas por valor/coste. Para cada una: qué hace, mecanismo, dónde corre, qué cuesta (tiempo por turno, tokens por ejecución o minutos de CI) y cómo se desactiva.

Preséntalas con `AskUserQuestion` (multiSelect), la de más valor primero. No apliques ninguna sin elección explícita.

## 3. Configurar lo elegido

Muestra el cambio exacto antes de aplicarlo y aplícalo con la herramienta adecuada:
- **Hook** → escríbelo en `.claude/settings.json` del proyecto (la skill `update-config` sabe el formato). Prueba el comando del hook una vez a mano.
- **Tarea programada del escritorio** → si tienes una herramienta para crear tareas programadas, úsala; si no, da al usuario los campos exactos (nombre, instrucciones, horario, carpeta, modo de permisos) para crearla en Routines → New routine → Local.
- **Routine en la nube** → `/schedule` o claude.ai/code/routines; el prompt debe ser autocontenido y terminar en una rama o PR.
- **GitHub Action** → para revisión de PRs, `/real-use:bot`. Para otras, workflow con `anthropics/claude-code-action@v1`, permisos mínimos y `--max-turns`.
- **`/loop` o `/goal`** → no se configuran: dale al usuario el comando exacto para lanzarlo.

## 4. Registrar

Si existe `.cru/`, añade cada automatización a `DECISIONS.md` (qué, por qué y cómo desactivarla). Termina con una tabla: automatización · estado (activa / pendiente de un paso del usuario) · cómo desactivarla.
