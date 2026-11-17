# Retomar

Si el resumen de Real Use no llegó ya al inicio de la sesión, haz esto antes de actuar:

1. Ejecuta `node "${CLAUDE_PLUGIN_ROOT}/scripts/retomar.js" "<raíz del proyecto>"`.
2. Muestra esa salida tal cual. No redactes otro resumen y no pidas al usuario que cuente en qué se quedó.
3. Si la salida contiene `Desfase:`, pregunta con opciones antes de editar `.cru/` o de empezar la tarea. Las opciones son poner la bitácora al día o seguir con el paso que indica el resumen.
4. Si no hay `.cru/`, el script imprime una sola línea. Ofrece `/real-use:iniciar`.
