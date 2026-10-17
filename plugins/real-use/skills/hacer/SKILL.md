---
name: hacer
description: Punto de entrada único para cualquier petición, por vaga que sea. Convierte "arregla esto" o "quiero X" en una ficha de tarea completa (objetivo, terminado, verificación, alcance, cuándo parar, lente experta), pregunta solo lo que falta con opciones y la ejecuta por la ruta más barata que la resuelva bien. Usar cuando el usuario pida algo sin detallar cómo.
argument-hint: "<lo que quieras, en tus palabras>"
---

# Hacer

Petición: $ARGUMENTS

El usuario escribe poco y elige bien entre opciones. Tu trabajo es completar lo que no dijo, con lo que se puede deducir, y preguntar solo lo que de verdad decide él.

## 1. Clasificar (sin herramientas si se puede)

| Tipo | Señal | Ruta |
|---|---|---|
| Pregunta | "¿cómo…?", "¿por qué…?" | Responde. Si hay que leer mucho código, usa `real-use:explorador`. No crees tareas |
| Trivial | El diff cabe en una frase | Hazlo y verifica. Sin ficha ni preguntas |
| Bug | "falla", "no funciona", un error pegado | Ficha → reproducir con test → arreglar |
| Feature normal | Algo nuevo y acotado | Ficha → plan corto → implementar → `/real-use:verificar` |
| Feature grande o ambigua | Varias pantallas o sistemas, "quiero un sistema de…" | `/real-use:spec` |
| Mejorar calidad | "que se vea mejor", "más rápido", "más seguro", "más divertido" | Ficha con lente de `/real-use:experto` |
| Varias cosas a la vez | Lista de peticiones | Una tarea por punto en `.cru/TASKS.md`; ofrece `/real-use:paralelo` si son independientes |
| Recurrente | "cada día", "cada vez que" | `/loop`, tarea programada o hook (`update-config`) |

## 2. Ficha de tarea

Rellena lo que puedas deducir del código, `.cru/` y la conversación:

```
Objetivo:      <qué cambia para el usuario, una frase>
Terminado:     <condición observable>
Verificación:  <comando o procedimiento; recetas en ${CLAUDE_PLUGIN_ROOT}/referencias/verificacion.md>
Alcance:       <archivos/áreas que se tocan> · No tocar: <lo que no debe cambiar>
Lente:         <ninguna | diseno-ui | game-design | …>
Parar si:      <cuándo preguntar en vez de seguir>
Ruta:          <modo · effort · delegación, según /real-use:enrutar>
```

## 3. Preguntar solo lo que falta

Si quedan huecos que cambian el resultado (no detalles que decides tú), haz **una sola** ronda de `AskUserQuestion`, máximo 3 preguntas, cada una con 2–4 opciones y tu recomendación primero. Lo típico: qué significa terminado, qué enfoque de entre 2–3, qué queda fuera.

Muestra la ficha en 7 líneas. Si el usuario no la corrige, sigue: no pidas una confirmación aparte.

## 4. Ejecutar y registrar

- Si existe `.cru/`, añade la ficha como tarea en `TASKS.md` (formato del archivo) y márcala `[~]`; al terminar, ciérrala como en `/real-use:siguiente`.
- Si la lente es distinta de "ninguna", lee su archivo antes de empezar.
- Termina con la evidencia de la verificación y los apartados **Bloqueado por ti**, **Cambiado** y **Encontrado**.
