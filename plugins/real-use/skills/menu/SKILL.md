---
name: menu
description: Menú y tablero de "¿qué hago ahora?" - estado del proyecto y las mejores acciones como botones, con su coste. Usar cuando no sepan por dónde seguir, pidan ver el estado, un panel o botones, o pregunten qué comandos hay.
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

## 3. Mostrar: tablero con botones o preguntas

**Si tienes una herramienta para mostrar widgets en la conversación** (por ejemplo `show_widget`, en la app de escritorio o en claude.ai), dibuja un tablero compacto. Si la herramienta pide leer antes su guía (`read_me`), léela sin comentarlo. Contenido:
1. Cabecera: proyecto, fase y barra de progreso del hito (`hechas / total`).
2. En curso: la tarea `[~]` con su `queda:` y el botón **Continuar** → `/real-use:siguiente <ID>`.
3. Bloqueadas: cada `[!]` con el botón **Decidir** → `Ayúdame a desbloquear <ID>: <motivo>`.
4. Siguientes: las 3 primeras `[ ]` con el botón **Empezar** → `/real-use:siguiente <ID>`.
5. Las acciones elegidas en el paso 2 como fila de botones, cada una con su coste (bajo/medio/alto), más **Chuleta**.

Cada botón llama a `sendPrompt("<comando>")` (o al mecanismo equivalente que documente la herramienta): el usuario ve en el chat cada comando que se envía. No repitas en texto lo que muestra el tablero.

**Si no la tienes** (terminal): un resumen de 5 líneas y una sola `AskUserQuestion` con las acciones, la recomendada primero. Cada opción lleva un **label** (la acción en 2–5 palabras) y una **description** (por qué ahora y su coste relativo, en una línea). Añade como última opción "Ver chuleta de comandos", salvo que ya haya 4 acciones mejores.

Para compartirlo o seguirlo desde el navegador, ofrece publicarlo como artifact. En un artifact los botones no ejecutan comandos: usa "Copiar como prompt".

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
| Automatizar algo (con tu aprobación) | `/real-use:automatizar` |
| Un bot que revise cada PR | `/real-use:bot` |
| Pregunta rápida sin ensuciar el contexto | `/btw <pregunta>` |
| Cambiar cuánto piensa Claude | `/effort low/medium/high` |
