---
name: enrutar
description: Decidir cómo ejecutar una tarea al menor coste - modelo, effort, modo (directo/plan/spec/goal), subagente, sesión paralela o nube. Usar cuando pregunten qué modelo, effort o agente usar para algo.
effort: low
argument-hint: "[descripción de la tarea]"
---

# Enrutar una tarea

Tarea: $ARGUMENTS

Regla base: **Opus 5.5 con effort medium** para el trabajo normal. Sube effort solo cuando la verificación o los casos límite lo justifiquen; baja para iterar rápido. Más effort no arregla un enfoque equivocado: eso lo arregla una spec mejor.

## Tabla

| Tipo de tarea | Modo | Effort | Delegación | Verificación |
|---|---|---|---|---|
| Pregunta de un dato que no debe quedar en contexto | `/btw` | — | — | — |
| Cambio trivial (el diff cabe en una frase) | Directo, sin plan | low | — | build/lint |
| Boceto, prototipo, explorar ideas de UI | Directo, iterar | low | — | captura |
| Feature normal bien entendida | Plan corto → implementar | medium (impl.) → high (verificar) | — | tests + `/real-use:verificar` |
| Feature grande o ambigua | `/real-use:spec` → sesión nueva | medium | — | e2e de la spec |
| Bug en código existente | Reproducir con test que falla → arreglar | high | explorador para localizar | el test que fallaba |
| Entender un área grande del código | Preguntar | — | `real-use:explorador` (Haiku) | resumen con `archivo:línea` |
| Correr suites, leer logs largos | — | — | `real-use:verificador` (Sonnet) | solo fallos |
| Revisión antes de commit/PR | — | — | `real-use:revisor` o `/code-review` | hallazgos con evidencia |
| Seguridad, dinero, datos de usuarios | Plan + revisión | high / xhigh | revisor + `/security-review` | tests de casos hostiles |
| Varias tareas independientes | `/real-use:paralelo`: una sesión por tarea, cortadas por archivos | medium | worktree por sesión | cada una la suya |
| Migración/refactor repetitivo en muchos archivos | `/batch <instrucción>` o fan-out `claude -p` | medium | worktrees | probar en 2–3 archivos primero |
| Trabajo largo con fin medible | `/goal <condición verificable>` + modo auto | medium | — | la condición del goal |
| Tarea recurrente (cada X tiempo) | `/loop`, tarea programada o routine | low/medium | — | registro en `.cru/LOG.md` |
| Necesita algo que solo tu máquina tiene (GPU, editor del motor, dispositivo, VPN) | Local | — | — | — |
| Larga, autónoma, no necesita tu máquina | Sesión en la nube | medium/high | — | rama + PR |
| Atascado tras 2 correcciones fallidas | `/clear` y prompt nuevo con lo aprendido | igual | — | — |
| Opus en xhigh falla 2 veces en lo mismo | Fable 5.1 solo para ese problema, luego volver | high | — | — |

## Effort automático

No hace falta que el usuario lo cambie en cada paso: varias piezas de este plugin fijan su propio effort mientras se ejecutan.
- `/real-use:verificar` corre en **high**: verificar es donde más rinde pensar.
- `/real-use:cerrar`, `/real-use:enrutar`, `/real-use:menu` y `/real-use:conectar` corren en **low**: son tareas de registro y de decisión.
- Los subagentes tienen el suyo: explorador (Haiku, low), verificador (Sonnet, low), especialista (medium), revisor (high).

Para el resto, recomienda al usuario el comando `/effort <nivel>` solo cuando el actual (`$CLAUDE_EFFORT`) no encaje con la tarea.

## Reglas de delegación

- Subagente = contexto aislado: úsalo cuando la tarea **lee mucho y devuelve poco**. No lo uses para ediciones pequeñas: arrancar un agente cuesta más que hacerlo.
- Búsqueda y resumen en modelos pequeños (Haiku/Sonnet); ediciones de código en el modelo principal.
- Equipos de agentes consumen ~7× los tokens de una sesión: solo para trabajo grande y divisible.
- Sesiones paralelas: divide por límites de archivos, prompts autocontenidos (problema, qué es terminado, cómo probarlo). Cinco sesiones gastan límites ~5× más rápido.
- Verifica la evidencia que devuelve cada subagente antes de aceptarla.

## Cómo presentarlo al usuario

Ofrece 2–3 rutas de la tabla con `AskUserQuestion`, la recomendada primero, cada una con coste relativo (bajo/medio/alto) y qué gana. No expliques la tabla entera.
