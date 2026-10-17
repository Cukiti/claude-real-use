---
name: verificar
description: Verifica el trabajo antes de darlo por terminado. Ejecuta la verificación del proyecto (tests/build/lint/captura) con salida filtrada y lanza una revisión adversarial del diff en contexto fresco contra el criterio de terminado. Usar antes de marcar una tarea como hecha, antes de un commit/PR, o cuando el usuario pregunte "¿funciona?".
argument-hint: "[ID de tarea o criterio a comprobar]"
---

# Verificar

Qué comprobar: $ARGUMENTS (vacío = la tarea `[~]` de `.cru/TASKS.md` y el diff actual).

## 1. Verificación mecánica

- Toma el comando de `Verificación:` en `.cru/PROJECT.md` o el `verif:` de la tarea.
- Si no existe ninguno, dilo claramente y propone con `AskUserQuestion` cómo crearlo, recomendado primero, usando las recetas de `${CLAUDE_PLUGIN_ROOT}/referencias/verificacion.md` para el stack del proyecto. Sin verificación no hay "terminado".
- Ejecútalo con el subagente `real-use:verificador` cuando la salida pueda ser larga: vuelve solo pasa/falla y los errores relevantes.
- UI: captura la pantalla del resultado (navegador integrado o la herramienta disponible) y compárala con la referencia; lista diferencias.

## 2. Revisión adversarial (cambios no triviales)

Lanza el subagente `real-use:revisor` con: el criterio de terminado, la spec si existe (`.cru/specs/…`) y la instrucción de revisar `git diff` (o los archivos cambiados). El revisor no vio cómo se escribió el código; por eso sirve.

Al recibir hallazgos:
- Corrige solo los que afectan a corrección o a requisitos declarados.
- El resto (estilo, "podría ser más robusto") anótalo como opcional; no sobre-ingenierices.
- Si el revisor no puede confirmar algo, que diga dónde buscó.

Para revisiones de seguridad o de bugs a fondo existen también `/code-review` y `/security-review` (incluidos en Claude Code).

## 3. Resultado

Muestra la evidencia (comando + salida resumida). Solo si todo pasa, la tarea puede marcarse `[x]`.
