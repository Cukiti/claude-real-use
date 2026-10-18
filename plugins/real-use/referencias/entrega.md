# Cómo entregar una tarea

Una tarea no termina cuando el código compila: termina cuando la persona sabe qué cambió, lo ha visto funcionar y ha dado el visto bueno. Este es el formato para todas las skills que terminan trabajo (`siguiente`, `hacer`, `verificar`, `spec`, `equipo`).

## Tono

Habla como un compañero de equipo que informa, no como un informe técnico. Si sabes el nombre del usuario (lo dice su `CLAUDE.md`, o `git config user.name`), úsalo al empezar. Frases cortas, sin jerga innecesaria y con la información útil primero.

## Formato (máximo ~12 líneas)

```
<Nombre>, <qué hice, en una frase con el resultado para el usuario>.

Qué cambió: <1–3 líneas; archivos solo si ayudan a revisar>
Compruébalo tú (≈1 min): <pasos concretos: abre X, pulsa Y, deberías ver Z>
Evidencia: <comando de verificación y su resultado en una línea, o captura>
Lo que no pude comprobar: <o "nada">

¿Le das el visto bueno?
```

Después, **siempre**, los siguientes pasos como opciones (`AskUserQuestion`; en la app de escritorio son botones), la recomendada primero:
1. **Visto bueno**: cierra la revisión de la tarea.
2. **Algo no está bien**: el usuario describe qué ve y se corrige en el mismo contexto.
3. La siguiente acción más útil: la siguiente tarea, `/real-use:cerrar` si la sesión ya es larga, o `/real-use:mapa`.

## Estado en las tareas

- Verificación pasada con algo que la persona debe ver (UI, comportamiento, sonido, feel): marca la tarea `[x]` y añade ` · revisión: pendiente`. El hook de inicio, el menú y el mapa la muestran en "Necesita tu visto bueno".
- Cuando el usuario da el visto bueno, cambia ` · revisión: pendiente` por ` · revisado ✔ <fecha>`.
- Si dice que algo falla, vuelve a `[~]` con ` · queda: <lo que reportó>`.
- Cambios sin nada que ver (refactor interno con tests): `[x]` sin revisión pendiente; menciónalo igual en la entrega.

## Bugs

Para un bug arreglado, la entrega dice además:
- **Qué fallaba** (en palabras del usuario, no del código).
- **Por qué fallaba** (la causa raíz, en una frase).
- **Cómo reproducir el caso antes y ahora** (el test que fallaba y ahora pasa, o los pasos manuales).

## Ahorro

La entrega es corta a propósito: los detalles están en el diff y en `.cru/`. No repitas el código cambiado; si la persona quiere verlo, ofrécelo como opción ("Ver el diff").
