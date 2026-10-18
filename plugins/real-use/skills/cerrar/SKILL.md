---
name: cerrar
description: Cerrar la sesión sin cabos sueltos - actualiza .cru/ (tareas, bitácora, decisiones), lista lo abierto, convierte correcciones repetidas en reglas y deja un prompt para retomar. Usar con "terminamos", "por hoy", "cierra" o antes de /clear.
effort: low
---

# Cerrar la sesión

Una sesión no termina cuando el usuario se va: termina cuando el estado está escrito. Lo que no está en `.cru/` se pierde.

**Modo adoptar**: si `.cru/PROJECT.md` tiene `- Tareas:` o `- Bitácora:`, esos archivos sustituyen a `.cru/TASKS.md` y `.cru/LOG.md`. Léelos y escríbelos con su propio formato (secciones, casillas, viñetas) y su orden (si la bitácora dice "entrada arriba", la nueva entrada va al principio). No crees `TASKS.md` ni dupliques sus entradas en `.cru/`.

## 1. Inventario (comandos baratos, sin leer archivos enteros)

- `git status --short` y `git stash list` (si hay git).
- `git worktree list` y ramas locales sin merge: `git branch --no-merged` (si hay git).
- Tareas `[~]` y `[!]` en `.cru/TASKS.md`.
- Lo que se habló en esta sesión y no está anotado: ideas, bugs vistos de pasada, decisiones tomadas.

## 2. Escribir el estado

- `TASKS.md`: cada tarea tocada queda en un estado honesto. `[x]` solo con verificación pasada: la que ejecutaste tú en esta sesión, o la que el usuario dice que pasó (entonces márcala `[x]` con ` · verif: según el usuario`; su palabra cuenta, pero queda anotada). Toda tarea `[~]` lleva ` · queda: <siguiente paso exacto>`. Todo hallazgo de la sesión entra como `[ ]` nuevo.
- `DECISIONS.md`: añade las decisiones tomadas que no se deducen del código.
- Bitácora: en `.cru/LOG.md`, añade una entrada al final. En una bitácora adoptada, ponla donde diga su orden: si es "entrada arriba", justo debajo del título y antes de la entrada más reciente, copiando el formato de sus encabezados. Contenido: Hecho / Queda / Decisiones / Prompt para retomar. El prompt para retomar es una frase que el usuario pueda pegar en una sesión nueva, p. ej. `"/real-use:siguiente T-007 — ya está el test que falla en tests/save_test.gd"`.
- Si la fase del proyecto cambió (hito cumplido), actualiza `Fase:` en `PROJECT.md`.

## 3. Aprender: corregir en la fuente

Repasa la sesión buscando lo que **costó turnos**: correcciones del usuario, el mismo error dos veces, comandos que fallaron por un detalle del entorno, información que tuviste que buscar y que la próxima sesión volverá a necesitar. Para cada caso, propón **un** arreglo duradero en el sitio más barato:

| Si el problema fue… | Arreglo |
|---|---|
| Una convención o un comando que Claude no podía deducir | Una línea en el `CLAUDE.md` del proyecto (que siga por debajo de ~200 líneas) |
| Algo que debe pasar siempre, sin excepción (formatear, no tocar una carpeta) | Un hook (skill `update-config`) |
| Un criterio de calidad que se olvidó | Añadirlo a la lente correspondiente o a un `REVIEW.md` del proyecto |
| Un flujo de varios pasos que se repite | Una skill del proyecto en `.claude/skills/` |
| Una decisión que se reabrió | Una entrada en `DECISIONS.md` |

Si no hubo nada, no inventes. Si hubo, inclúyelo en las opciones del paso siguiente (como multiSelect) y muestra el texto exacto que se añadiría.

## 4. Presentar cabos sueltos como opciones

Muestra una lista corta de lo que queda abierto y ofrece con `AskUserQuestion` qué hacer, recomendado primero, por ejemplo:
- Hacer commit de los cambios (mensaje propuesto) / dejarlos sin commit.
- Ramas o worktrees ya mergeados: borrarlos / conservarlos.
- Tareas bloqueadas por una decisión del usuario: decidir ahora / dejar para luego.

No hagas commit, borres ramas ni empujes nada sin que el usuario lo elija.

## 5. Despedida

Máximo 6 líneas: tareas cerradas hoy, progreso del hito (`x/y`), siguiente tarea, y el prompt para retomar. Recomienda `/clear` (o una sesión nueva) antes de la siguiente tarea no relacionada: el estado ya está a salvo en `.cru/`.
