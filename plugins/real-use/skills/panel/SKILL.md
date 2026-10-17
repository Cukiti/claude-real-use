---
name: panel
description: Instala la status line de Real Use en la terminal de Claude Code - muestra modelo, tarea en curso de .cru/ y porcentaje de contexto con aviso de cuándo compactar o cerrar la sesión.
disable-model-invocation: true
---

# Instalar el panel (status line)

La status line pertenece a la interfaz de terminal de Claude Code. Si el usuario solo usa la app de escritorio, avísale de que quizá no la vea ahí y pregúntale si quiere instalarla igualmente para la terminal.

Ejemplo de lo que muestra: `Opus 5.5 │ T-003 Guardado local │ ctx 62% · /compact o /clear al acabar la tarea`

## Pasos

1. Copia `${CLAUDE_PLUGIN_ROOT}/scripts/statusline.js` a `~/.claude/real-use-statusline.js`. Se copia porque la ruta del plugin cambia con cada actualización.
2. Lee `~/.claude/settings.json`. Si ya tiene `statusLine`, enséñaselo al usuario y pregunta con `AskUserQuestion` si quiere reemplazarlo o conservarlo.
3. Muestra el cambio exacto antes de escribirlo y aplícalo solo con su confirmación:
   ```json
   "statusLine": { "type": "command", "command": "node \"<HOME>/.claude/real-use-statusline.js\"" }
   ```
   Sustituye `<HOME>` por la ruta real del directorio personal, con barras `/` también en Windows.
4. Comprueba que funciona: `echo '{"model":{"display_name":"Prueba"},"context_window":{"used_percentage":55}}' | node ~/.claude/real-use-statusline.js`
5. Dile que la verá en la próxima sesión de terminal.
