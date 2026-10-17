---
name: ahorro
description: Auditoría de consumo de tokens de la configuración de Claude Code del usuario - tamaño de CLAUDE.md, MCPs conectados, plugins y skills habilitados, hábitos de sesión - con recortes concretos para elegir. Usar cuando el usuario diga que gasta muchos tokens, que se le acaba el límite, o pida optimizar su setup.
disable-model-invocation: true
---

# Auditoría de ahorro

Lo que más gasta, en orden: **contexto que crece** (cada turno reenvía toda la conversación), **tokens de salida/razonamiento** (5× la entrada), **fallos de caché** (pausas largas, cambiar de modelo o de MCPs a mitad de sesión), y **contexto fijo** (CLAUDE.md, listado de skills, servidores MCP) que se paga en cada sesión.

## 1. Medir (sin leer archivos grandes enteros)

- Líneas de cada CLAUDE.md que aplica: `~/.claude/CLAUDE.md`, `./CLAUDE.md`, `./.claude/CLAUDE.md` (usa `wc -l` o equivalente).
- Plugins habilitados: lee solo la clave `enabledPlugins` de `~/.claude/settings.json`.
- Servidores MCP: `claude mcp list` y `.mcp.json` del proyecto.
- Cuántas skills hay en el listado de esta sesión (las ves en tu contexto): cada descripción se paga en cada sesión.
- Sugiere al usuario ejecutar `/context` (qué ocupa la ventana) y `/usage` (atribución por skill/plugin/MCP y avisos de caché) y pegar el resultado si quiere más precisión.

## 2. Diagnóstico

Presenta una tabla corta: elemento · tamaño/cantidad · impacto (alto/medio/bajo) · recorte propuesto. Criterios:
- CLAUDE.md > 200 líneas → alto. Mover flujos específicos a skills; borrar lo que Claude deduce del código.
- Plugins de dominios que el usuario no usa en este tipo de proyecto (marketing, otro motor, otra plataforma) → medio/alto. Recomendar deshabilitarlos globalmente y habilitarlos solo en el proyecto que los necesita (`enabledPlugins` en `.claude/settings.json` del proyecto).
- MCPs que duplican una CLI (`gh`, `gcloud`, `firebase`, `supabase`) → preferir la CLI.
- MCPs sin usar en este proyecto → desconectar con `/mcp`.

## 3. Hábitos (dar solo los que apliquen)

- `/clear` entre tareas no relacionadas (gratis); el estado vive en `.cru/`, no en la conversación.
- `/compact <qué conservar>` en una pausa natural; `/rewind` para descartar un camino fallido.
- Tras 2 correcciones fallidas: `/clear` + mejor prompt, no una tercera corrección.
- Una tarea completa por mensaje, con criterio de terminado. Quitar "piensa paso a paso": el modelo ya razona; el effort controla cuánto.
- Effort medium por defecto; high solo para verificar o bugs con casos límite.
- No cambiar de modelo ni conectar/desconectar MCPs a mitad de sesión (rompe la caché). Evitar pausas de más de una hora con una sesión enorme abierta: al volver, mejor `/real-use:cerrar` + sesión nueva.
- Modo rápido (`/fast`) cuesta más por token: solo para trabajo interactivo, no al empezar una sesión larga.
- Salida verbosa (tests, logs) a subagentes; búsquedas a Haiku.
- `/insights` genera un informe de tus patrones de uso y fricciones.

## 4. Aplicar

Ofrece los recortes con `AskUserQuestion` (multiSelect), los de mayor impacto primero. Aplica solo los elegidos. Antes de editar un archivo de configuración, muestra el cambio exacto. No toques ajustes de seguridad o permisos sin que el usuario lo pida explícitamente.
