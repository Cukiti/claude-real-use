---
name: siguiente
description: Continuar el proyecto - toma la siguiente tarea de .cru/TASKS.md, propone cómo hacerla, la ejecuta hasta que su verificación pase y actualiza el estado. Usar con "sigue", "qué toca", "continúa".
argument-hint: "[ID de tarea opcional, p. ej. T-004]"
---

# Siguiente tarea

Tarea pedida (vacío = la siguiente lógica): $ARGUMENTS

**Modo adoptar**: si `.cru/PROJECT.md` tiene `- Tareas:` o `- Bitácora:`, esos archivos sustituyen a `.cru/TASKS.md` y `.cru/LOG.md`. Léelos y escríbelos con su propio formato (secciones, casillas, viñetas) y su orden (si la bitácora dice "entrada arriba", la nueva entrada va al principio). No crees `TASKS.md` ni dupliques sus entradas en `.cru/`.

## 1. Elegir la tarea

- Lee `.cru/TASKS.md` (y `.cru/PROJECT.md` solo si no tienes ya el resumen del inicio de sesión).
- Si hay una tarea `[~]`, esa va primero: retómala, no abras otra.
- Si no, toma la primera `[ ]` cuyas dependencias estén hechas. Si hay `[!]` cuyo bloqueo ya se resolvió, avísalo.
- Si no hay `.cru/`, ofrece `/real-use:iniciar` y para.

## 2. Proponer cómo ejecutarla

Clasifica la tarea con la tabla de `/real-use:enrutar` (si no la tienes en contexto, lee `${CLAUDE_PLUGIN_ROOT}/skills/enrutar/SKILL.md`). Presenta con `AskUserQuestion` 2–3 formas de hacerla, recomendada primero. Cada opción en una línea: enfoque · effort · si usa subagente/sesión paralela · coste relativo (bajo/medio/alto).

Salta la pregunta y ejecuta directamente si la tarea es trivial (el diff se describe en una frase) o si el usuario ya dijo "hazlo sin preguntar".

Si la tarea es demasiado grande para una sesión, no la empieces: divídela en `TASKS.md` y vuelve a elegir.

## 3. Ejecutar

- Marca la tarea `[~]` en `TASKS.md` antes de tocar código.
- Si la tarea no tiene verificación, lo primero es crearla (test, script, captura de referencia).
- En bugs: reproduce primero (test que falla), luego arregla.
- Trabajo de investigación o salida verbosa (logs, suites enteras) → subagentes `real-use:explorador` / `real-use:verificador`, para que el ruido no entre en este contexto.
- No te desvíes: si descubres otro problema, anótalo como tarea nueva `[ ]` en `TASKS.md` y sigue con la actual.

## 4. Cerrar la tarea

- Ejecuta la verificación y muestra la evidencia (salida del comando, captura), no la afirmes.
- Si pasa: marca `[x]` y añade al final de la línea ` · ✔ <fecha>`; si hay algo que el usuario debe ver (UI, comportamiento, feel), añade también ` · revisión: pendiente`.
- Si no puedes terminar: deja `[~]` con una nota ` · queda: <siguiente paso exacto>` o pasa a `[!]` con ` · bloqueado por: <qué>`.
- Entrega con el formato de `${CLAUDE_PLUGIN_ROOT}/referencias/entrega.md` (léelo la primera vez): qué hiciste en una frase, qué debe comprobar el usuario en un minuto, la evidencia, el visto bueno y los siguientes pasos como opciones. Si algo de la sesión necesita una decisión del usuario o salió una tarea nueva, inclúyelo en esas opciones.
- Ofrece la siguiente tarea o `/real-use:cerrar` si la sesión ya es larga (más de ~3 tareas o contexto pesado).
