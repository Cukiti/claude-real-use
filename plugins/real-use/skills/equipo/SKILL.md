---
name: equipo
description: Arma un equipo de agentes con roles para una tarea que cruza especialidades (p. ej. una pantalla de juego que necesita game design, UI, arte y QA) - propone quién hace qué, con qué lente, modelo y effort, y su coste, deja elegir y orquesta. Usar cuando el usuario quiera varios expertos o roles trabajando en algo, o pida "un equipo" para una tarea.
argument-hint: "<tarea>"
---

# Equipo de agentes con roles

Tarea: $ARGUMENTS

Un equipo cuesta más que una sesión sola: cada agente tiene su propio contexto. Compensa cuando la tarea cruza especialidades o cuando revisar en un contexto fresco aporta algo. Si la tarea es de una sola especialidad, recomienda `/real-use:experto` en su lugar y para.

## 1. Proponer el reparto

Roles disponibles (cada fila es un agente de este plugin):

| Rol | Agente | Modelo · effort | Para |
|---|---|---|---|
| Investigador | `real-use:explorador` | Haiku · low | Entender el código y devolver un resumen con referencias |
| Especialista `<lente>` | `real-use:especialista` + lente | heredado · medium | Crear o modificar con criterio experto |
| Revisor `<lente>` | `real-use:revisor` + lente | heredado · high | Revisar en contexto fresco y buscar por qué no está terminado |
| Verificador | `real-use:verificador` | Sonnet · low | Ejecutar tests o el build y devolver solo los fallos |

Lentes: `diseno-ui`, `game-design`, `arte-pixel`, `rendimiento`, `seguridad`, `arquitectura`, `qa`, `producto`, `lanzamiento` (en `${CLAUDE_PLUGIN_ROOT}/referencias/lentes/`).

Reglas para el reparto:
- De 2 a 4 roles. Más roles diluyen la responsabilidad y multiplican el gasto.
- Quien crea no revisa su propio trabajo: el revisor recibe otra lente o la misma con contexto limpio.
- Las ediciones de código del núcleo las haces tú (la sesión principal); delega en especialistas las piezas con límites claros de archivos.
- Los especialistas que escriben no pueden tocar los mismos archivos.

Presenta con `AskUserQuestion` 2 opciones de equipo (recomendada primero): una mínima (2 roles, coste bajo-medio) y una completa (3–4 roles, coste medio-alto). En la descripción de cada una pon los roles en orden y el coste relativo.

## 2. Orquestar

Orden típico: **investigar → crear → verificar → revisar → corregir**.
- Lanza en paralelo solo los roles que no escriben (investigador, revisores de lentes distintas).
- A cada agente pásale: la lente (ruta completa), la tarea concreta, los archivos que puede tocar, qué es terminado y el criterio de verificación. No le pases la conversación entera.
- Verifica la evidencia de cada informe antes de aceptarlo.
- Del revisor, corrige solo lo que afecta a corrección o a los criterios de la lente. El resto, como opcional.

## 3. Cerrar

Resumen: quién hizo qué, hallazgos corregidos y pendientes, y evidencia de la verificación final. Si existe `.cru/`, registra la tarea y las decisiones de criterio (`DECISIONS.md`).
