---
name: paralelo
description: Repartir tareas independientes en sesiones paralelas, cada una en su worktree con un prompt autocontenido y sin archivos compartidos. Usar cuando quieran hacer varias tareas a la vez.
argument-hint: "[IDs de tareas, p. ej. T-004 T-005]"
---

# Trabajo en paralelo

Tareas candidatas: $ARGUMENTS (vacío = elige entre las pendientes).

Cada sesión paralela consume límites como una sesión completa: cinco sesiones gastan ~5× más rápido. Paraleliza solo trabajo que de verdad es independiente.

## 1. Elegir tareas independientes

- Lee `.cru/TASKS.md`. Candidatas: tareas `[ ]` sin dependencias pendientes.
- Para cada candidata, estima qué archivos tocará. Si no es obvio, pregunta al subagente `real-use:explorador` (una sola llamada para todas las tareas).
- Descarta las que se solapan en archivos con otra elegida, o que dependen de otra. Máximo 4 sesiones.
- Requisito: repositorio git con los cambios actuales commiteados (los worktrees parten de una rama). Si hay cambios sin commit, ofrece hacer commit primero.

## 2. Confirmar con el usuario

Presenta con `AskUserQuestion` (multiSelect) las tareas que pueden ir en paralelo, cada una con los archivos que tocará. Avisa de las que descartaste y por qué en una línea.

## 3. Preparar un prompt autocontenido por tarea

Cada sesión empieza sin el contexto de esta. El prompt debe incluir:
1. La tarea con su ID y la ruta a la spec si existe.
2. Qué significa terminado y el comando de verificación.
3. Qué archivos puede tocar y cuáles no (los de las otras sesiones).
4. "Al terminar: marca la tarea en `.cru/TASKS.md`, haz commit en tu rama y resume con Bloqueado por mí / Cambiado / Encontrado."

## 4. Lanzar

- **App de escritorio**: si tienes una herramienta para iniciar sesiones, propón una sesión por tarea con su prompt y la opción de worktree. Si no, indica al usuario que cree cada sesión con la opción **worktree** y pegue el prompt.
- **Terminal**: da un comando por tarea, para ejecutar en terminales separadas: `claude --worktree <id-tarea>` y luego el prompt. Recomienda añadir `.claude/worktrees/` al `.gitignore`.
- Marca cada tarea `[~]` con ` · sesión: <id-tarea>` en `TASKS.md`.

## 5. Integrar después

Cuando las sesiones terminen, revisa el diff de cada rama (o pásalo a `real-use:revisor`) antes de mezclar. Mezcla solo con el visto bueno del usuario, una rama cada vez, y ejecuta la verificación completa tras cada mezcla. Luego `/real-use:cerrar` limpia los worktrees ya mezclados.
