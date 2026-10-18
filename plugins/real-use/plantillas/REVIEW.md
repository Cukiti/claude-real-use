# Criterios de revisión

<!--
Lo leen el bot de revisión (GitHub Action), /real-use:verificar y el agente revisor.
Corto a propósito: cada línea debe evitar un error real. /real-use:cerrar añade lo aprendido en "Aprendido".
-->

## Qué significa "roto" en este proyecto
- <p. ej. "un guardado de una versión anterior que no carga", "una pantalla que no se ve en 360 px">

## Revisa siempre
- El cambio cumple el criterio de terminado de su tarea en `.cru/TASKS.md` o de su spec en `.cru/specs/`.
- No contradice ninguna decisión de `.cru/DECISIONS.md`.
- <criterios de la lente del proyecto: copia aquí los 3–5 más importantes de referencias/lentes/>

## No comentes
- Estilo que el formateador o linter ya arregla.
- Preferencias sin impacto en corrección o en los criterios de arriba.
- Rutas a ignorar: <`build/`, `addons/` de terceros, assets generados…>

## Formato de cada hallazgo
- `archivo:línea` · qué está mal · cómo demostrar el fallo (entrada → resultado incorrecto) · severidad (Importante / Menor).
- Empieza el resumen con el número de hallazgos importantes.

## Aprendido
<!-- Una línea por error que se coló antes y que la revisión debe atrapar a partir de ahora. Fecha + regla. -->
