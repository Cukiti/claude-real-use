---
name: pendientes
description: Auditar cabos sueltos - TODO/FIXME, tareas abiertas en .cru/, cambios sin commit, stashes, ramas y worktrees sin merge, convertidos en tareas. Usar cuando haya "cosas a medias", antes de una entrega o al retomar un proyecto.
context: fork
agent: real-use:explorador
---

# Auditoría de pendientes

Trabajas en un contexto aislado. Devuelve solo el informe final, no el proceso.

## Fuentes (en este orden, con comandos que devuelvan poco texto)

1. `.cru/TASKS.md`: tareas `[~]` y `[!]` (si existe).
2. Git, si hay repositorio:
   - `git status --short`
   - `git stash list`
   - `git branch --no-merged` y `git worktree list`
   - Para cada worktree: quién lo creó y si sigue vivo. Los de `.claude/worktrees/agent-*` son de subagentes de Claude: sobrantes si no tienen cambios sin commit y su rama ya está mezclada o no tiene commits propios (`git -C <ruta> status --short`, `git log --oneline <rama> --not HEAD | head -3`). Los de otras herramientas (`.trabajo-*`, `.codex*`) se reportan aparte y no se proponen para borrar.
   - `git log --oneline -15` para ver en qué se trabajó últimamente.
3. Marcadores en código, excluyendo dependencias y builds: busca `TODO|FIXME|HACK|XXX` con Grep en modo `count` primero; si hay más de 40, informa el conteo por carpeta y lista solo los 15 más relevantes.
4. Señales de trabajo a medias: tests marcados como skip/ignore, funciones que lanzan "not implemented", archivos `*.orig`/`*.rej`.

## Informe (máximo 40 líneas)

Agrupa en:
- **Riesgo de pérdida** (cambios sin commit, stashes, worktrees huérfanos) — primero, es lo más urgente.
- **Tareas a medias** (en curso / bloqueadas).
- **Deuda marcada en código** (TODO/FIXME), con `archivo:línea`.

Para cada grupo, propón las tareas a añadir a `.cru/TASKS.md` en el formato `- [ ] T-xxx título · hecho: … · verif: …`. No edites archivos: la sesión principal decidirá con el usuario cuáles añadir.
