---
name: iniciar
description: Organizar un proyecto (nuevo o existente) con Real Use - detecta el tipo, entrevista con opciones, elige metodología y crea .cru/ con tareas verificables. Usar cuando quieran organizar, arrancar o poner orden en un proyecto.
argument-hint: "[descripción breve del proyecto]"
---

# Iniciar un proyecto con Real Use

Objetivo: que al terminar exista una fuente de verdad en archivos (`.cru/`) que cualquier sesión futura lea en segundos, y una lista de tareas donde cada una tiene criterio de terminado y forma de verificarse.

Descripción que dio el usuario: $ARGUMENTS

## 1. Detectar (sin preguntar lo que se puede leer)

- Si ya existe `.cru/`, no lo sobrescribas: di que el proyecto ya está iniciado y ofrece `/real-use:siguiente` o `/real-use:pendientes`.
- Mira solo marcadores de nivel superior (no explores todo el repo): `project.godot`, `*.uproject`, `ProjectSettings/` (Unity), `build.gradle*`/`settings.gradle*`, `*.xcodeproj`, `pubspec.yaml`, `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `CLAUDE.md`, `README*`, `.git`.
- **Seguimiento que ya existe**: busca en el primer nivel **y en `docs/`** archivos de estado, bitácora o pendientes (`ESTADO*`, `STATUS*`, `BITACORA*`, `LOG*`, `TODO*`, `Pendientes*`, `TASKS*`, `*tareas*.json`, `TABLERO*`, `PLAN*`, `ROADMAP*`, `CHANGELOG*`, `AGENTS.md`) y carpetas de otras herramientas (`.trabajo-*`, `.codex*`). Mide su tamaño con `wc -l` y lee solo sus encabezados (`grep "^#"`). Si los hay, el proyecto ya tiene un método: no lo dupliques (ver paso 2b).
- **Verificación ya documentada**: busca primero en `AGENTS.md` y `README*` una sección de pruebas o tests; después, scripts `.bat`/`.sh`/`.ps1` con nombres como test, autotest, verificar o pruebas (léelos, son cortos). Esa es la verificación real: no propongas otra.
- **Instrucciones heredadas**: `CLAUDE.md` en la carpeta padre (`../CLAUDE.md`) también se carga en este proyecto; léelo para no repetir sus reglas.
- **Restos que cuestan**: `git worktree list` y `.claude/worktrees/`. Si hay worktrees viejos, menciónalo al final y ofrece `/real-use:pendientes`.
- Deduce tipo, stack y el comando de verificación probable (scripts de `package.json`, `gradlew test`, `godot --headless`, `pytest`, etc.).
- Si hay mucho código existente y necesitas entenderlo, delega en el subagente `real-use:explorador` y pide un resumen de 15 líneas como máximo.

## 2. Entrevistar con opciones (AskUserQuestion)

El usuario prefiere elegir a redactar. Sigue `${CLAUDE_PLUGIN_ROOT}/referencias/cuestionarios.md` (bancos "Objetivo" y "Producto según el tipo"): en la app de escritorio, un único formulario en un widget; en la terminal, `AskUserQuestion` con 2–4 opciones por pregunta, tu recomendación primero y marcada "(Recomendado)". Máximo dos rondas. No preguntes lo que ya dedujiste: confírmalo como opción recomendada.

Ronda 1 (lo esencial):
1. Tipo de producto y plataforma (si no es obvio).
2. Metodología: ofrece las 2–3 que encajan según `${CLAUDE_PLUGIN_ROOT}/referencias/metodologias.md` (léelo antes de preguntar).
3. Qué significa "terminado" para la próxima entrega (hito 1).
4. Cómo se verifica (comando detectado como recomendado; si no hay ninguno, propón el de `${CLAUDE_PLUGIN_ROOT}/referencias/verificacion.md` para su stack).

Ronda 2 (solo si hace falta): alcance que queda fuera, plataformas de publicación, si trabaja solo o con equipo.

## 2b. Si ya hay seguimiento propio

Pregunta con `AskUserQuestion` qué hacer, la recomendada primero:
1. **Migrar a `.cru/` (recomendado si los archivos son largos)**: convierte cada pendiente abierto en una tarea de `TASKS.md` con ID, `hecho:` y `verif:` (agrupa los repetidos y deja fuera lo ya resuelto). Lleva la última entrada de estado a `LOG.md`. Los originales quedan como histórico, sin borrarlos, y `.cru/` pasa a ser la fuente de verdad. Ventaja: el inicio de cada sesión carga un resumen de unas 20 líneas en vez de cientos.
2. **Adoptar sin migrar**: no crees `TASKS.md`. Útil si otra herramienta o persona también edita esos archivos. Escribe en la cabecera de `PROJECT.md`, con la ruta entre comillas invertidas:
   - ``- Tareas: `<archivo>` (adoptado)``
   - ``- Bitácora: `<archivo>` (entrada arriba)`` si las entradas nuevas van al principio, o sin la nota si van al final.
   
   El hook de inicio, `/real-use:siguiente`, `/real-use:cerrar` y `/real-use:menu` leen y escriben esos archivos respetando su formato y su orden.
3. **Solo organizar lo nuevo**: `.cru/` para el trabajo a partir de hoy; lo anterior se queda donde está.

Para migrar no leas los archivos enteros en esta conversación: delega la extracción en el subagente `real-use:explorador` ("lista los pendientes abiertos de <archivo> como líneas `- [ ] título · hecho: … · verif: …`, máximo 40, agrupando repetidos") y revisa su resultado.

Si existe `AGENTS.md` y no hay `CLAUDE.md`, el nuevo `CLAUDE.md` debe importarlo con `@AGENTS.md` en vez de copiar su contenido.

## 3. Crear los archivos

Copia las plantillas de `${CLAUDE_PLUGIN_ROOT}/plantillas/` a `.cru/` y rellénalas:

- `PROJECT.md`: todos los campos de la cabecera (Nombre, Tipo, Stack, Metodología, Fase, Verificación) en el formato `- Campo: valor`. El hook de inicio de sesión los lee así.
- `TASKS.md` (no en modo adoptar; ahí el hito 1 se define en `PROJECT.md` refiriendo las secciones del archivo de tareas adoptado): descompón el hito 1 en 5–15 tareas. Cada tarea cabe en una sesión, tiene `hecho:` y `verif:`. Ordénalas por dependencia. La primera tarea de un proyecto sin verificación es crear la verificación.
- `LOG.md` (en modo adoptar, solo una entrada que enlace la bitácora adoptada): primera entrada con la fecha de hoy.
- `DECISIONS.md`: registra la metodología elegida como D-001.

Si no hay `CLAUDE.md`, crea uno de menos de 40 líneas con: comandos de build/test/run, convenciones que no se deducen del código y estas líneas:
```
Estado del proyecto y tareas: .cru/ (sistema Real Use).
Al terminar una tarea: di qué cambió y qué debe comprobar el usuario, pide su visto bueno y ofrece 2-3 siguientes pasos como opciones.
```
Si ya existe, añade solo esas dos líneas.

Rellena también la sección `## Stack` de `PROJECT.md` con lo que detectaste, marcando cada pieza como `(gratis)`, `(freemium)` o `(pago)`, y el campo `Presupuesto:` con la preferencia del usuario (pregúntala en la ronda 2 si no es obvia).

## 4. Recomendar herramientas

Lee `${CLAUDE_PLUGIN_ROOT}/referencias/catalogo.md`, sección del tipo de proyecto. Descarta lo que ya está conectado (`claude mcp list`, `.mcp.json`) y lo que no corresponde al motor o stack (nada de Unity en Godot, ni GUT si el proyecto ya tiene pruebas propias). Si no queda nada útil, dilo en una línea y no preguntes. Si queda, presenta como máximo 3 MCPs/plugins con una línea de por qué cada uno, y ofrécelos con `AskUserQuestion` (multiSelect). Recuerda: cada MCP conectado cuesta contexto; prefiere CLI cuando exista. No instales nada sin que el usuario lo elija.

## 5. Terminar

Muestra un resumen de máximo 10 líneas: metodología, hito 1, número de tareas, comando de verificación, y la primera tarea. Ofrece arrancar con `/real-use:siguiente`.
