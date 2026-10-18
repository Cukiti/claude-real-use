---
name: menu
description: Menú interactivo de "¿qué hago ahora?". Mira el estado del proyecto, la sesión y la configuración y ofrece las 3-4 acciones más útiles como opciones para elegir, con su coste. Usar cuando el usuario no sepa por dónde seguir, pida ayuda con los comandos, pregunte qué puede hacer o qué le recomiendas.
effort: low
---

# Menú

Objetivo: que el usuario elija en lugar de pensar. Mide poco, recomienda bien y ejecuta lo que elija.

## 1. Leer el estado (barato: sin leer código)

- `.cru/`: si tienes el resumen del inicio de sesión, úsalo; si no, lee solo las tareas `[~]`, `[!]` y las 3 primeras `[ ]` de `.cru/TASKS.md`.
- `git status --short | head -20` y `git log --oneline -3` (si hay git).
- Effort actual: `echo $CLAUDE_EFFORT` (en PowerShell: `$env:CLAUDE_EFFORT`).
- Tamaño de la conversación: lo que veas de esta sesión (cuántas tareas, cuánto se ha leído).

## 2. Elegir las 3-4 mejores acciones

Prioriza en este orden y quédate con las que apliquen:

| Situación | Acción que ofrecer |
|---|---|
| No hay `.cru/` | `/real-use:iniciar`: organizar el proyecto |
| Cambios sin commit de una tarea terminada | Verificar y hacer commit (`/real-use:verificar`) |
| Hay una tarea `[~]` | Retomarla (`/real-use:siguiente <ID>`) |
| Sesión larga o con varias tareas hechas | `/real-use:cerrar` y después `/clear` |
| Tareas `[!]` que dependen de una decisión del usuario | Decidir ahora |
| Varias `[ ]` independientes | `/real-use:paralelo` |
| Una `[ ]` grande o ambigua | `/real-use:spec` |
| Hace más de una semana que no se auditan pendientes | `/real-use:pendientes` |
| Effort `xhigh`/`max` sin una tarea difícil delante | Bajar a `/effort medium` |
| El usuario se queja de gasto o de límites | `/real-use:ahorro` |
| No sabe qué herramientas o MCPs usar | `/real-use:conectar` |

## 3. Preguntar

Una sola `AskUserQuestion`, con la recomendada primero. Cada opción lleva:
- **label**: la acción en 2–5 palabras.
- **description**: por qué ahora y su coste relativo (bajo / medio / alto), en una línea.

Añade como última opción "Ver chuleta de comandos", salvo que ya haya 4 acciones mejores.

## 4. Ejecutar

- Ejecuta la elegida (invoca la skill correspondiente o haz la acción).
- Si elige la chuleta, muestra esta tabla y nada más:

| Quiero… | Comando |
|---|---|
| Pedir algo sin pensar el prompt | `/real-use:hacer <lo que sea>` |
| Seguir con el proyecto | `/real-use:siguiente` |
| Una feature grande | `/real-use:spec <idea>` |
| Que lo mire un experto | `/real-use:experto <lente> <tarea>` |
| Un equipo de agentes con roles | `/real-use:equipo <tarea>` |
| Comprobar que funciona | `/real-use:verificar` |
| Varias tareas a la vez | `/real-use:paralelo` |
| Terminar el día | `/real-use:cerrar` |
| Gastar menos tokens | `/real-use:ahorro` · `/clear` · `/compact` |
| Elegir MCPs y herramientas | `/real-use:conectar` |
| Pregunta rápida sin ensuciar el contexto | `/btw <pregunta>` |
| Cambiar cuánto piensa Claude | `/effort low/medium/high` |
