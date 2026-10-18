---
name: conectar
description: Recomendar qué MCPs, conectores, plugins, CLIs y LSP usar en este proyecto - compara con lo conectado (qué falta y qué sobra) y da comandos exactos. Usar cuando pregunten qué MCP, conector o herramienta les conviene.
argument-hint: "[servicio o necesidad, opcional]"
effort: low
---

# Conectar herramientas

Necesidad concreta (opcional): $ARGUMENTS

Cada servidor MCP y cada plugin habilitado se paga en contexto en **todas** las sesiones (nombres de herramientas, instrucciones, descripciones de skills). Por eso recomendar también es quitar: lo ideal es poco, bien elegido y habilitado solo en el proyecto que lo usa.

## 1. Medir lo que hay (comandos baratos)

- Tipo de proyecto: el `Tipo:` de `.cru/PROJECT.md`, o los marcadores de primer nivel (`project.godot`, `build.gradle*`, `package.json`, `pyproject.toml`…).
- MCP conectados: `claude mcp list` y el `.mcp.json` del proyecto, si existe.
- Plugins habilitados: solo la clave `enabledPlugins` de `~/.claude/settings.json` y de `.claude/settings.json` del proyecto.
- CLIs disponibles: `gh --version`, `firebase --version`, `supabase --version`, `gcloud --version`… solo las relevantes para el stack. Usa `|| true` para que una ausencia no corte la ejecución.

## 2. Recomendar

Lee `${CLAUDE_PLUGIN_ROOT}/referencias/catalogo.md` (la sección del tipo de proyecto y la "Base"). Construye tres listas cortas:

- **Añadir** (máximo 3): lo que más cambia el trabajo diario en este stack. Si existe una CLI equivalente, recomienda la CLI.
- **Quitar o mover al proyecto** (las que apliquen): MCPs o plugins de otros dominios (marketing en un juego, Unity en un proyecto de Godot, móvil en una web) o que duplican una CLI.
- **Ya bien**: una línea.

Para cada elemento: qué aporta, coste de contexto (bajo/medio/alto) y comando exacto. Ejemplos de forma:
- MCP remoto: `claude mcp add --transport http <nombre> <url>` (añade `--scope project` para que se guarde en el `.mcp.json` del proyecto y viaje con el repo).
- Plugin: `/plugin install <plugin>@<marketplace>`.
- Habilitar un plugin solo en este proyecto: `"enabledPlugins": { "<plugin>@<marketplace>": true }` en `.claude/settings.json` del proyecto.
- Conector de claude.ai (Notion, Linear, Slack…): se autoriza en la configuración de conectores de claude.ai; Claude no puede iniciar la autorización.

Si no estás seguro de la URL o del comando de instalación de un MCP concreto, dilo y apunta a su repositorio oficial. No inventes URLs.

## 3. Elegir y aplicar

Ofrece con `AskUserQuestion` (multiSelect) los cambios propuestos, los de más impacto primero. Aplica solo los elegidos y muestra el cambio exacto antes de editar cualquier configuración. No instales ni conectes nada sin elección explícita, y nunca pidas ni escribas tokens o claves: si un servicio los necesita, el usuario los introduce en el flujo de autorización del propio servicio.

Al terminar, recuerda que un MCP añadido a mitad de sesión rompe la caché: los cambios rinden más a partir de la próxima sesión.
