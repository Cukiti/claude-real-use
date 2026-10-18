---
name: bot
description: Configurar un bot que revisa cada PR o push con los criterios del proyecto (REVIEW.md y .cru/) y aprende de cada sesión, vía GitHub Action o revisión local. Usar cuando pidan un bot o revisor automático, o revisión en cada PR.
argument-hint: "[github|local]"
---

# Bot de revisión que aprende

Modo pedido: $ARGUMENTS

Tres piezas: **criterios** (`REVIEW.md`, corto y propio del proyecto), **disparo** (cada PR o push) y **aprendizaje** (lo que se coló se convierte en regla del `REVIEW.md`).

## 1. Criterios: crear o actualizar `REVIEW.md`

- Si no existe, cópialo de `${CLAUDE_PLUGIN_ROOT}/plantillas/REVIEW.md` y rellénalo: qué significa "roto" aquí (según `Tipo:` de `.cru/PROJECT.md`), los 3–5 criterios más importantes de la lente del proyecto (`${CLAUDE_PLUGIN_ROOT}/referencias/lentes/`: `game-design`/`arte-pixel` para juegos, `diseno-ui` para apps y web, `seguridad` si hay cuentas o pagos) y las rutas a ignorar.
- Máximo ~40 líneas. Cada línea debe evitar un error concreto.
- Añade al `CLAUDE.md` del proyecto, si no está: `Al revisar código, aplica REVIEW.md.` Así cualquier revisión de Claude (la Action oficial, /code-review o el revisor de este plugin) usa los mismos criterios.

## 2. Disparo: elegir dónde corre

Detecta: ¿remoto en github.com (`git remote -v`)? ¿`gh` con sesión (`gh auth status`)? ¿plan Team/Enterprise? Ofrece con `AskUserQuestion`, recomendada primero:

| Opción | Cuándo | Cómo |
|---|---|---|
| **GitHub Action oficial** (recomendada con GitHub) | Repo en github.com | El usuario ejecuta `/install-github-app` en una sesión de terminal de Claude Code y elige el workflow de revisión. Instala la app, guarda el secreto y abre el PR del workflow. Lee `REVIEW.md` vía `CLAUDE.md` |
| **Workflow personalizado** | Quiere controlar el prompt o el modelo | Copia `${CLAUDE_PLUGIN_ROOT}/plantillas/claude-review.yml` a `.github/workflows/`. Requiere la Claude GitHub App y el secreto `CLAUDE_CODE_OAUTH_TOKEN` (`claude setup-token`) o `ANTHROPIC_API_KEY`, que el usuario añade en GitHub |
| **Code Review gestionado** | Plan Team o Enterprise | Se activa desde la administración de Claude Code; no hay workflow que mantener |
| **Local** | Sin GitHub, o antes de cada commit | Recomienda `/real-use:verificar` (revisor + lente), `/code-review` y `/security-review` antes de cada commit; ofrece `/real-use:automatizar` para un hook o una tarea programada |

Nunca pidas, leas ni escribas tokens: el usuario los crea y los guarda en los secretos de GitHub. Muestra el workflow antes de escribirlo y no hagas commit ni push sin elección.

## 3. Aprendizaje

- `/real-use:cerrar` ya propone, en su paso "Aprender", añadir a la sección **Aprendido** de `REVIEW.md` cada criterio que se olvidó o error que se coló.
- Cuando el usuario diga que el bot dejó pasar algo, añade la regla a **Aprendido** con la fecha, en una línea, y registra en `.cru/DECISIONS.md` si cambia un criterio.
- Si una regla de `REVIEW.md` deja de aportar (el linter ya lo cubre), bórrala: el archivo debe seguir siendo corto.

## 4. Comprobar

Para el modo GitHub: en el primer PR, confirma que el bot comentó (o que no había hallazgos) con `gh pr view <n> --comments`. Para el modo local: ejecuta `/real-use:verificar` sobre el diff actual. Termina con el estado: criterios (sí/no) · disparo (activo / pendiente de un paso del usuario) · aprendizaje (enlazado a cerrar).
