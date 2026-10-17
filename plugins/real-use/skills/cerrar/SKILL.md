---
name: cerrar
description: Cierra la sesión sin cabos sueltos. Actualiza .cru/TASKS.md y .cru/LOG.md, lista lo que queda abierto (cambios sin commit, tareas a medias, sesiones/ramas), propone commit y deja un prompt exacto para retomar. Usar cuando el usuario diga "terminamos", "cierra", "por hoy", o antes de /clear.
---

# Cerrar la sesión

Una sesión no termina cuando el usuario se va: termina cuando el estado está escrito. Lo que no está en `.cru/` se pierde.

## 1. Inventario (comandos baratos, sin leer archivos enteros)

- `git status --short` y `git stash list` (si hay git).
- `git worktree list` y ramas locales sin merge: `git branch --no-merged` (si hay git).
- Tareas `[~]` y `[!]` en `.cru/TASKS.md`.
- Lo que se habló en esta sesión y no está anotado: ideas, bugs vistos de pasada, decisiones tomadas.

## 2. Escribir el estado

- `TASKS.md`: cada tarea tocada queda en un estado honesto (`[x]` solo con verificación pasada). Toda tarea `[~]` lleva ` · queda: <siguiente paso exacto>`. Todo hallazgo de la sesión entra como `[ ]` nuevo.
- `DECISIONS.md`: añade las decisiones tomadas que no se deducen del código.
- `LOG.md`: añade una entrada al final con el formato de la plantilla (Hecho / Queda / Decisiones / Prompt para retomar). El prompt para retomar es una frase que el usuario pueda pegar en una sesión nueva, p. ej. `"/real-use:siguiente T-007 — ya está el test que falla en tests/save_test.gd"`.
- Si la fase del proyecto cambió (hito cumplido), actualiza `Fase:` en `PROJECT.md`.

## 3. Presentar cabos sueltos como opciones

Muestra una lista corta de lo que queda abierto y ofrece con `AskUserQuestion` qué hacer, recomendado primero, por ejemplo:
- Hacer commit de los cambios (mensaje propuesto) / dejarlos sin commit.
- Ramas o worktrees ya mergeados: borrarlos / conservarlos.
- Tareas bloqueadas por una decisión del usuario: decidir ahora / dejar para luego.

No hagas commit, borres ramas ni empujes nada sin que el usuario lo elija.

## 4. Despedida

Máximo 6 líneas: tareas cerradas hoy, progreso del hito (`x/y`), siguiente tarea, y el prompt para retomar. Recomienda `/clear` (o una sesión nueva) antes de la siguiente tarea no relacionada: el estado ya está a salvo en `.cru/`.
