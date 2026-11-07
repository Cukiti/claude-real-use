# Retomar el proyecto en cualquier agente

## 1. Objetivo

Al abrir un proyecto con Real Use, Claude, Cursor, Codex o Gemini dicen en qué se quedó el usuario y cuál es el siguiente paso, sin que él lo explique.

Fuera de alcance:

- Un servicio que sincronice el estado aparte del repositorio. La fuente sigue siendo `.cru/` (D-001) o los archivos adoptados (D-009).
- Llevar a otros agentes los hooks, widgets y mods que solo existen en Claude.
- Instalar o actualizar el plugin solo en los cuatro agentes.
- Reescribir `.cru/` al detectar un desfase. El script no edita archivos.
- Cambiar el formato de `TASKS.md`.

## 2. Comportamiento

Cuando el agente arranca en un proyecto y tiene Real Use cargado, su primera acción es ejecutar `node "<plugin>/scripts/retomar.js" "<raíz del proyecto>"` y mostrar esa salida tal cual. No pide al usuario que cuente en qué se quedó y no redacta otro resumen.

El script escribe por stdout, termina con código 0 y no crea ni modifica archivos.

1. La primera línea es `Real Use retomar <versión>`, con la versión de `plugins/real-use/.claude-plugin/plugin.json`.
2. Si existe `.cru/PROJECT.md`, el resumen incluye nombre, fase, comando de verificación, conteo de tareas (hechas, en curso, pendientes, bloqueadas), la tarea `[~]` si la hay, hasta 3 pendientes, las bloqueadas y las 6 primeras líneas de la última entrada de bitácora.
3. El siguiente paso es la tarea `[~]`. Si no hay, es la primera `[ ]`.
4. Si `PROJECT.md` declara `- Tareas:` o `- Bitácora:`, el resumen lee esas rutas. Una bitácora marcada "entrada arriba" usa la primera entrada `##`. Una ruta que sale del proyecto hace salir al script con código 1 y un mensaje en stderr.
5. Si la ruta adoptada no existe, el resumen nombra esa ruta y dice que no existe. No usa otro archivo en su lugar.
6. Si no hay `.cru/`, el script imprime una sola línea diciéndolo y sale con código 0. El hook de Claude, en ese caso, sigue sin imprimir nada.
7. Dos ejecuciones sobre el mismo árbol producen el mismo texto.
8. Si la salida contiene `Desfase:`, el agente pregunta antes de editar `.cru/` o de empezar la tarea. Las opciones son poner la bitácora al día o seguir con el paso que indica el resumen.

Claude sigue inyectando el resumen en el hook de inicio. Ese hook llama a la misma función que `retomar.js` y conserva el contrato actual de sus tests. Cursor, Codex y Gemini no tienen ese hook: leen la misma salida del script. La prosa de cada skill puede diferir; el resumen, no.

## 3. Casos límite

- **Sesión cortada.** Si `git status --short` en el proyecto no está vacío, el resumen añade `Desfase: N caminos sin commit.` Si no hay repositorio git, omite esa línea y no falla. Si la última entrada de bitácora, en "Queda:" o "Prompt para retomar", nombra un `T-NNN` que en las tareas está `[x]`, añade `Desfase: la bitácora todavía habla de T-NNN y en las tareas ya está hecha.`
- **Dos copias de las instrucciones.** El resumen lo produce solo `retomar.js`. Cada adaptador es un llamador. La primera línea lleva la versión de la copia que se ejecutó, así que una copia vieja se distingue de otra. El adaptador no reescribe el texto.
- **Seguimiento adoptado.** Pendientes y bitácora propios se leen como en el hook actual. Sin casillas, el resumen lista los encabezados `##` del archivo de tareas.
- **Archivo adoptado ausente o fuera del proyecto.** Se avisa, o se rechaza la ruta. No se sustituye en silencio.

## 4. Archivos e interfaces

- `plugins/real-use/scripts/retomar.js` — única implementación. Exporta la función de resumen y, ejecutado, imprime el texto.
- `plugins/real-use/scripts/session-start.js` — pasa a usar esa función. Mantiene el JSON del hook y el silencio cuando no hay `.cru/`.
- `plugins/real-use/instrucciones/retomar.md` — el único texto para el agente: ejecutar el script, mostrar la salida, no pedir contexto, y preguntar si hay desfase.
- `plugins/real-use/skills/siguiente/SKILL.md` y `plugins/real-use/skills/menu/SKILL.md` — al empezar, ejecutan el script si el hook no inyectó ya el resumen.
- `plugins/real-use/adaptadores/codex-resume.cjs` — sustituye la lógica propia de `resume.cjs`. Misma salida que `retomar.js`.
- `plugins/real-use/adaptadores/GEMINI.md` — las mismas instrucciones, para apuntar Gemini al script. No se instala solo.
- `tests/scripts.test.js` — casos nuevos del script.

Cursor usa las skills del plugin. No hay un adaptador aparte.

## 5. Verificación end-to-end

Automática: `npm test`. Cubre un proyecto normal, uno adoptado, una ruta adoptada que no existe, una ruta que sale del proyecto, un árbol git con cambios sin commit, una bitácora que nombra una tarea ya `[x]`, dos ejecuciones idénticas y que la salida del adaptador de Codex sea igual a la de `retomar.js`.

Manual, una sola vez, en este orden:

1. En Claude, deja un proyecto con `.cru/` y una tarea pendiente conocida.
2. Abre esa misma carpeta en Cursor, con la skill de Real Use cargada, y no pegues capturas ni expliques el contexto.
3. La primera respuesta nombra esa tarea y la fase.
4. Anota el resultado en `.cru/LOG.md`.

Codex y Gemini quedan cubiertos por la salida idéntica del script. Esta versión no exige abrirlos.

## 6. Tareas

- T-040 Script único de retoma, y el hook de Claude lo usa sin romper sus tests.
- T-041 Aviso de desfase, solo lectura: git sucio y bitácora que nombra una tarea ya hecha.
- T-042 Instrucción única y skills `siguiente` y `menu` que muestran esa salida y preguntan si hay desfase.
- T-043 Adaptadores de Codex y Gemini en el repo, con la misma salida que el script.
- T-044 Prueba manual Claude → Cursor, anotada en la bitácora.
