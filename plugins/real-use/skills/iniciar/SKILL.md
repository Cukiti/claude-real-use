---
name: iniciar
description: Pone un proyecto (nuevo o existente) bajo el sistema Real Use. Detecta el tipo de proyecto, entrevista con opciones, elige metodología, crea .cru/ (PROJECT, TASKS, LOG, DECISIONS), un CLAUDE.md corto y recomienda MCPs/plugins. Usar cuando el usuario quiera organizar, arrancar o retomar un proyecto con orden.
argument-hint: "[descripción breve del proyecto]"
---

# Iniciar un proyecto con Real Use

Objetivo: que al terminar exista una fuente de verdad en archivos (`.cru/`) que cualquier sesión futura lea en segundos, y una lista de tareas donde cada una tiene criterio de terminado y forma de verificarse.

Descripción que dio el usuario: $ARGUMENTS

## 1. Detectar (sin preguntar lo que se puede leer)

- Si ya existe `.cru/`, no lo sobrescribas: di que el proyecto ya está iniciado y ofrece `/real-use:siguiente` o `/real-use:pendientes`.
- Mira solo marcadores de nivel superior (no explores todo el repo): `project.godot`, `*.uproject`, `ProjectSettings/` (Unity), `build.gradle*`/`settings.gradle*`, `*.xcodeproj`, `pubspec.yaml`, `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `CLAUDE.md`, `README*`, `.git`.
- Deduce tipo, stack y el comando de verificación probable (scripts de `package.json`, `gradlew test`, `godot --headless`, `pytest`, etc.).
- Si hay mucho código existente y necesitas entenderlo, delega en el subagente `real-use:explorador` y pide un resumen de 15 líneas como máximo.

## 2. Entrevistar con opciones (AskUserQuestion)

El usuario prefiere elegir a redactar. Usa `AskUserQuestion` con 2–4 opciones por pregunta, tu recomendación primero y marcada "(Recomendado)". Máximo dos rondas. No preguntes lo que ya dedujiste: confírmalo como opción recomendada.

Ronda 1 (lo esencial):
1. Tipo de producto y plataforma (si no es obvio).
2. Metodología: ofrece las 2–3 que encajan según `${CLAUDE_PLUGIN_ROOT}/referencias/metodologias.md` (léelo antes de preguntar).
3. Qué significa "terminado" para la próxima entrega (hito 1).
4. Cómo se verifica (comando detectado como recomendado).

Ronda 2 (solo si hace falta): alcance que queda fuera, plataformas de publicación, si trabaja solo o con equipo.

## 3. Crear los archivos

Copia las plantillas de `${CLAUDE_PLUGIN_ROOT}/plantillas/` a `.cru/` y rellénalas:

- `PROJECT.md`: todos los campos de la cabecera (Nombre, Tipo, Stack, Metodología, Fase, Verificación) en el formato `- Campo: valor`. El hook de inicio de sesión los lee así.
- `TASKS.md`: descompón el hito 1 en 5–15 tareas. Cada tarea cabe en una sesión, tiene `hecho:` y `verif:`. Ordénalas por dependencia. La primera tarea de un proyecto sin verificación es crear la verificación.
- `LOG.md`: primera entrada con la fecha de hoy.
- `DECISIONS.md`: registra la metodología elegida como D-001.

Si no hay `CLAUDE.md`, crea uno de menos de 40 líneas con: comandos de build/test/run, convenciones que no se deducen del código, y esta línea: `Estado del proyecto y tareas: .cru/ (sistema Real Use).` Si ya existe, añade solo esa línea.

## 4. Recomendar herramientas

Lee `${CLAUDE_PLUGIN_ROOT}/referencias/catalogo.md`, sección del tipo de proyecto. Presenta como máximo 3 MCPs/plugins con una línea de por qué cada uno, y ofrécelos con `AskUserQuestion` (multiSelect). Recuerda: cada MCP conectado cuesta contexto; prefiere CLI cuando exista. No instales nada sin que el usuario lo elija.

## 5. Terminar

Muestra un resumen de máximo 10 líneas: metodología, hito 1, número de tareas, comando de verificación, y la primera tarea. Ofrece arrancar con `/real-use:siguiente`.
