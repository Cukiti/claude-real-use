# Cómo usar Claude de verdad

Esta guía resume lo que Anthropic publica sobre cómo trabajar con Claude Code (documentación oficial, blog de claude.dev y artículos de claude.com) y lo convierte en un sistema concreto. Las fuentes están al final.

## La respuesta corta

> **Claude no se queda sin inteligencia: se queda sin contexto y sin forma de comprobar su trabajo.** Úsalo como a un ingeniero al que le das una tarea completa, un criterio de terminado y una forma de verificarlo, y dale su memoria en archivos, no en conversaciones.

Casi todo lo demás sale de dos hechos:

1. **El contexto es el recurso que se agota.** Cada turno reenvía toda la conversación. Con 150k de contexto, cada turno cuesta unas 7 veces más en lecturas que con 20k, y el rendimiento baja a medida que la ventana se llena.
2. **Claude para cuando el trabajo *parece* terminado.** Sin una comprobación que pueda ejecutar, "parece terminado" es la única señal que tiene, y tú pasas a ser el bucle de verificación. Según el equipo de Claude Code, darle una forma de verificar mejora el resultado entre 2 y 3 veces.

## Los 7 hábitos

### 1. El proyecto vive en archivos, no en sesiones
Las sesiones se cierran, se compactan y se olvidan. Los archivos no. Lleva el estado en `.cru/` (este plugin): `PROJECT.md` (qué es y qué significa terminado), `TASKS.md` (qué falta), `LOG.md` (qué pasó en cada sesión) y `DECISIONS.md` (por qué). Para ver el progreso, mira el archivo, no el historial del chat.

### 2. Una tarea por sesión, con criterio de terminado
Da la tarea completa en un mensaje: qué hacer, qué significa terminado y cuándo parar a preguntar.
```
Migra los endpoints de pago al cliente nuevo.
Terminado = todos usan el cliente nuevo, el viejo se borra y la suite pasa.
Pregúntame solo si un test falla por algo que no puedas explicar.
```
Entre tareas no relacionadas: `/clear`. Es gratis y el estado ya está en `.cru/`.

### 3. Siempre una verificación
Test, build, linter, script que compara salida o captura de pantalla contra el diseño. Pide la evidencia (la salida del comando), no la afirmación. Si no se puede verificar, no está terminado.

### 4. Explorar → planificar → implementar → verificar
- Diff de una frase: hazlo directo.
- Feature normal: plan corto, implementar, verificar.
- Feature grande o ambigua: que Claude **te entreviste** (`/real-use:spec`), escriba la spec y la implemente **en una sesión nueva**. Con una spec precisa, los distintos niveles de effort dan resultados mucho más parecidos: la spec rinde más que el effort.

### 5. Effort según la tarea, no al máximo
- **low**: bocetos, iterar contigo dentro del bucle.
- **medium** (por defecto): trabajo de ingeniería normal.
- **high**: verificar, bugs con casos límite.
- **xhigh/max**: problemas difíciles en autonomía (seguridad, sistemas complejos).

Más effort ayuda cuando hay muchos casos límite ocultos. No arregla un enfoque equivocado. Ciclo recomendado: entrevista → implementar en low/medium → revisar → verificar en high.

### 6. Delega lo que lee mucho y devuelve poco
Explorar el código, leer logs, correr suites enteras: a un **subagente** (contexto aislado, modelo pequeño). Ediciones de código: en la sesión principal. Tareas independientes: en **sesiones paralelas**, cada una con sus archivos (worktrees). Antes de dar algo por terminado, una **revisión adversarial** en contexto fresco: el revisor no vio cómo se escribió el código.

### 7. Cierra cada sesión
Antes de irte: estado escrito, cabos sueltos listados, commit decidido y una frase lista para retomar (`/real-use:cerrar`). Así no se acumulan sesiones abiertas a medias.

## "Eres un experto en…": qué funciona de verdad

Anthropic confirma que asignar un rol ayuda: incluso una frase enfoca el comportamiento y el tono. Pero el título por sí solo es la parte débil. Lo que cambia el resultado es lo que ese experto **sabe mirar**, y Claude lo aplica mejor cuando se lo das explícitamente:

| Débil | Fuerte |
|---|---|
| "Eres un diseñador gráfico experto. Hazlo bonito." | "Escala tipográfica de 2 familias, espaciado en múltiplos de 8, contraste AA, estados vacío/error/cargando. Evita degradados morados, botones píldora y tarjetas de tres en fila. Haz una captura en 360 px y compárala." |
| "Actúa como un QA senior." | "Prueba vacío, máximo+1, sin red, cerrar a mitad de guardado y doble toque. Cada fallo, con un test que lo reproduzca." |
| "NUNCA uses X." | "No uses X porque <razón>." Con el porqué, Claude generaliza a casos que no listaste. |

En la práctica:
1. **Rol en una línea** (sí, sirve) + **criterios comprobables** + **antipatrones concretos** + **cómo se verifica**.
2. **Explica el porqué** de las reglas importantes.
3. **Ejemplos** (3–5, variados) cuando importa el formato o el estilo.
4. **El experto revisa en contexto fresco**: quien creó algo no es buen juez de su propio trabajo.

`/real-use:experto` hace esto con 9 lentes listas (diseño UI, game design, pixel art, rendimiento, seguridad, arquitectura, QA, producto, lanzamiento). Solo carga la lente que hace falta, así que tener muchas no cuesta tokens.

### ¿Se pueden dar roles a distintos agentes?

Sí, y además cada agente tiene su propio modelo, effort, herramientas y contexto. `/real-use:equipo <tarea>` propone un reparto y te deja elegir entre una versión mínima y otra completa, con su coste. Por ejemplo, para una pantalla de tienda de un juego:

| Rol | Agente | Modelo · effort |
|---|---|---|
| Investigador | explorador | Haiku · low |
| Especialista game-design | especialista + lente | el tuyo · medium |
| Revisor diseno-ui + qa | revisor + lentes | el tuyo · high |
| Verificador | verificador | Sonnet · low |

Regla clave: quien crea no revisa su propio trabajo. Y un equipo cuesta más que una sesión sola, así que úsalo solo cuando la tarea cruza especialidades.

## Avisos en el momento justo (copiloto)

El plugin trae un hook que mira cada mensaje antes de que llegue a Claude. Cuando ve algo, te avisa a ti (los avisos no entran en el contexto de Claude, así que no cuestan tokens). Cada aviso sale una sola vez:

| Aviso | Cuándo |
|---|---|
| 🟡 / 🔴 Contexto | La conversación supera ~80k o ~150k tokens: cada turno reenvía todo |
| ⏱ Caché fría | Escribes tras más de una hora en una conversación grande, o retomas una sesión grande con la caché caducada (con el coste estimado) |
| 🔁 Correcciones | Corriges dos veces seguidas: mejor `/clear` y un prompt nuevo |
| ✏ Sin verificar | Un turno termina con archivos cambiados y sin ejecutar tests ni build (el primero y luego cada 3) |
| ⚙ Effort | Effort `max` para un cambio pequeño, o `low` para algo delicado |
| 💡 Petición vaga | "arregla el menú" sin detalles: `/real-use:hacer` la completa |

Se configura en `/config` → Real Use → Avisos: `todos`, `coste` (solo contexto y caché) o `ninguno`.

Además, el effort se ajusta solo en las piezas del plugin: `verificar` piensa en high; `cerrar`, `menu` y `conectar` en low; cada subagente lleva el suyo.

## Mapa de herramientas: cuál usar para qué

Anthropic ha sacado muchas piezas. Esta es la versión corta, según la documentación de Claude Code:

| Quiero… | Herramienta | Nota |
|---|---|---|
| Elegir en vez de escribir | Preguntas con opciones (AskUserQuestion) | En la app de escritorio son botones; todas las skills de este plugin las usan |
| Ver el estado y actuar con un clic | Widgets en la conversación (app de escritorio y claude.ai) | `/real-use:menu` dibuja el tablero con botones que envían comandos |
| Compartir o seguir algo desde el navegador | Artifacts | Página viva en claude.ai, privada hasta que la compartes; puede leer conectores en vivo y recibir comentarios. Sus botones no ejecutan comandos: "Copiar como prompt" |
| Presentaciones, diseños o documentos para otros | Plantillas de artifacts: `/slides`, `/design`, Claude Docs | Se editan en claude.ai y se exportan |
| Que algo pase siempre, sin excepción | Hooks | Deterministas y sin coste de modelo; el copiloto de este plugin es un hook |
| Que siga hasta terminar | `/goal` + modo auto | Un modelo aparte comprueba la condición en cada turno |
| Repetir cada cierto tiempo mientras trabajo | `/loop` | Vive en la sesión abierta |
| Rutinas con mis archivos locales | Tareas programadas del escritorio | Necesitan la app abierta y el equipo despierto |
| Rutinas sin mi máquina | Routines (nube) | Por horario, llamada HTTP o evento de GitHub; terminan en rama o PR |
| Revisar cada PR | GitHub Action (`/install-github-app`) o Code Review (Team/Enterprise) | `/real-use:bot` lo configura con los criterios del proyecto |
| Varias tareas a la vez | Sesiones paralelas con worktree, sesiones en la nube | `/real-use:paralelo` |
| Muchos agentes coordinados | Subagentes, `/batch`, agent view, workflows dinámicos | Cada agente gasta su propio contexto: úsalos para lo que lee mucho y devuelve poco |
| Controlar el navegador o el escritorio | Navegador integrado, Claude in Chrome, computer use | Verificación visual de UI sin instalar nada |
| Seguir desde el móvil | Remote Control y app móvil | Aprobar y responder desde fuera |
| Cambiar la interfaz de Claude Code | Mods (Claude Code ≥ 2.1.287) | Bandas, paneles y comandos propios; el mod `next-steps` sugiere los siguientes 3 prompts como teclas 1, 2 y 3 |

### Automatizar, pero aprobando tú

`/real-use:automatizar` mira lo que se repite en el proyecto (correcciones en la bitácora, commits de formato, CI que ya existe) y propone como mucho 4 automatizaciones. Cada una indica su mecanismo, lo que cuesta y cómo se desactiva. Tú marcas cuáles quieres, ves el cambio exacto y solo entonces se aplica.

### Un bot de revisión que mejora solo

`/real-use:bot` crea un `REVIEW.md` corto con lo que significa "roto" en tu tipo de app y los criterios de su lente, y lo enlaza desde `CLAUDE.md`. Así lo leen la GitHub Action oficial, `/code-review` y el revisor local. Corre en cada push a un PR, o antes de cada commit si trabajas sin GitHub. Y aprende: cuando algo se cuela, `/real-use:cerrar` añade la regla a la sección "Aprendido".

## Siempre sabes dónde estás

El fallo más caro no está en el código, sino en perder el hilo. Por eso el plugin te deja ver el estado en cuatro sitios, de más ligero a más completo:

| Dónde | Qué ves | Coste |
|---|---|---|
| Al abrir sesión (hook) | Fase, tarea en curso, lo que espera tu visto bueno y la última entrada de la bitácora | Unas 20 líneas de contexto |
| Copiloto (avisos) | Contexto alto, caché fría, cambios sin verificar, correcciones seguidas | Cero tokens |
| `/real-use:menu` | Tablero con botones: continuar, decidir, dar el visto bueno, cerrar | Un turno |
| `/real-use:mapa` | Página con objetivo, hitos, en curso, por revisar, bloqueado, siguiente, hecho, stack (gratis/pago), decisiones y siguientes pasos | Cero tokens del modelo: lo genera un script |

Y cada tarea termina igual: qué cambió, qué compruebas tú en un minuto, la evidencia, tu visto bueno y 2–3 siguientes pasos. Una tarea con algo que ver queda marcada `revisión: pendiente` hasta que la apruebas.

## Lluvia de ideas: lo hecho y lo que viene

| Idea | Estado |
|---|---|
| Estado en archivos (`.cru/`), o adoptando el seguimiento que ya tiene el proyecto | ✔ |
| Mapa visual del proyecto generado sin modelo, publicado como artifact | ✔ |
| Entrega como compañero, con visto bueno y siguientes pasos siempre | ✔ |
| Cuestionarios con casillas y opciones (formulario en la app, preguntas en la terminal) | ✔ |
| Stack con alternativas gratis y de pago, según tu presupuesto | ✔ |
| Tablero con botones, copiloto de avisos, effort automático | ✔ |
| Lentes expertas, equipos de agentes con roles, bot de revisión que aprende | ✔ |
| Bocetos de pantallas con `/design` antes de programar; presentación con `/slides` al cerrar un hito | ✔ como opción en `spec` y `cerrar` |
| Mod "panel": banda sobre el prompt con tarea, contexto y revisiones, y teclas 1/2/3 para los siguientes pasos | Próximo (requiere Claude Code ≥ 2.1.287) |
| Mapa compartido con comentarios: amigos o clientes comentan el artifact y los comentarios llegan a la sesión | Próximo |
| Resumen semanal automático del progreso (routine) que actualiza el mapa | Próximo |
| Coste por tarea (tokens de `/usage`) visible en el mapa | Idea |
| Recorrido de bienvenida interactivo para quien instala el plugin por primera vez | Idea |

## Errores que queman tokens (y su arreglo)

| Error | Arreglo |
|---|---|
| Sesión "cajón de sastre": mezclar tareas no relacionadas | `/clear` entre tareas |
| Corregir una y otra vez | Tras 2 correcciones fallidas, `/clear` y un prompt mejor con lo aprendido |
| CLAUDE.md enorme | Menos de 200 líneas; flujos específicos a skills; borrar lo que se deduce del código |
| "Investiga X" sin límites | Acotar, o mandarlo a un subagente |
| Confiar sin verificar | Siempre una comprobación ejecutable |
| Decenas de plugins/MCPs habilitados en todo | Habilitar por proyecto; preferir CLIs |
| Cambiar de modelo o de MCPs a mitad de sesión | Rompe la caché: decide al empezar |
| Volver tras horas a una sesión enorme | La caché expiró: cierra y abre sesión nueva con el estado de `.cru/` |
| Modo rápido al empezar una sesión larga | Cuesta más por token; úsalo solo en trabajo interactivo |
| "Piensa paso a paso" en los prompts | Sobra: el modelo ya razona. Controla la profundidad con el effort |

## Comandos que conviene conocer

| Comando | Qué hace |
|---|---|
| `/clear` | Contexto nuevo (gratis) |
| `/compact <qué conservar>` | Resume la conversación conservando lo que digas |
| `/rewind` o `Esc Esc` | Vuelve a un punto anterior (conversación y/o código) |
| `/btw <pregunta>` | Pregunta lateral que no entra en el historial |
| `/effort` | Cambia el nivel de razonamiento (no rompe la caché) |
| `/context` | Qué ocupa la ventana de contexto |
| `/usage` | Consumo, atribución por skill/plugin/MCP y avisos de caché |
| `/insights` | Informe de tus patrones de uso y fricciones |
| `/goal <condición>` | Claude sigue trabajando hasta que la condición se cumpla (un modelo aparte la evalúa) |
| `/loop`, tareas programadas, routines | Trabajo recurrente |
| `/batch <instrucción>` | Divide un cambio masivo entre subagentes en worktrees |
| `/code-review`, `/security-review` | Revisión del diff en contexto fresco |
| `/rename`, `--continue`, `--resume` | Nombrar y retomar sesiones |

## En la app de escritorio

- **Sesiones en paralelo**: cada tarea independiente en su propia sesión (opcionalmente en su worktree). Divide por archivos y escribe prompts autocontenidos.
- **Navegador integrado**: Claude puede abrir tu app web, hacer capturas y leer la consola: verificación visual sin instalar Playwright.
- **Modo auto**: un clasificador revisa las acciones arriesgadas y deja pasar las rutinarias; combinado con `/goal`, permite trabajo largo sin que tengas que aprobar cada paso.
- **Plan mode** (`Shift+Tab`): Claude lee y propone sin tocar nada.
- **Sesiones en la nube**: para tareas largas que no necesitan tu máquina. Haz push antes de lanzarlas; terminan en una rama o un PR.

## Qué pone este repositorio en tus manos

El plugin `real-use` convierte esta guía en comandos:

| Comando | Hábito |
|---|---|
| `/real-use:menu` | ¿Qué hago ahora? Tablero con botones (app de escritorio) u opciones (terminal), y chuleta de comandos |
| `/real-use:mapa` | Mapa visual del proyecto (objetivo, hitos, tareas, visto bueno, stack, decisiones), sin coste de modelo |
| `/real-use:automatizar` | Automatizaciones propuestas que apruebas tú: hooks, tareas programadas, routines, Actions |
| `/real-use:bot` | Bot de revisión con los criterios del proyecto, que aprende de cada sesión |
| `/real-use:hacer <lo que sea>` | 2, 3, 5: convierte una petición vaga en una tarea completa y la ejecuta |
| `/real-use:equipo <tarea>` | 6: varios agentes con roles (lentes), modelo y effort propios |
| `/real-use:conectar` | Qué MCPs, conectores, plugins y CLIs añadir y cuáles quitar |
| `/real-use:experto [lente]` | Criterio experto real: criterios, antipatrones y verificación |
| `/real-use:iniciar` | 1, 3: estado en archivos, metodología, verificación |
| `/real-use:spec` | 4: entrevista → spec → tareas |
| `/real-use:siguiente` | 2, 5, 6: una tarea, enrutada al coste justo, verificada |
| `/real-use:enrutar` | 5, 6: qué modelo/effort/agente/sesión usar |
| `/real-use:verificar` | 3, 6: verificación + revisor adversarial |
| `/real-use:paralelo` | 6: tareas independientes en sesiones con worktree |
| `/real-use:pendientes` | 7: cabos sueltos convertidos en tareas |
| `/real-use:cerrar` | 7: cierre sin pendientes al aire, y lo aprendido convertido en reglas |
| `/real-use:ahorro` | Auditoría de tokens de tu configuración |
| `/real-use:panel` | Status line con la tarea en curso y el % de contexto |

Y un hook que, al abrir una sesión en un proyecto con `.cru/`, le da a Claude el estado actual en unas pocas líneas (y no hace nada en proyectos sin `.cru/`). Hay más prompts listos en [PROMPTS.md](PROMPTS.md).

## Un día típico

1. **Abres sesión** en el proyecto. Claude ya conoce la fase, la tarea en curso y lo que quedó pendiente ayer.
2. `/real-use:siguiente` (o `/real-use:hacer <lo que se te ocurra>`) → te ofrece 2 o 3 formas de hacer la tarea (coste bajo, medio o alto). Eliges una.
3. Claude trabaja; ves la evidencia de la verificación. Si encuentra otros problemas, los anota como tareas en lugar de desviarse.
4. Tarea hecha → `/clear` (gratis) → `/real-use:siguiente`. Una tarea por contexto.
5. ¿Hay una feature grande? `/real-use:spec`, y la implementas en una sesión nueva.
6. ¿Hay tres tareas independientes? `/real-use:paralelo`, y mientras tanto tú revisas.
7. Antes de irte: `/real-use:cerrar`. Mañana empiezas en el paso 1 sin explicarle nada.

Una vez por semana: `/real-use:pendientes` (que no se acumule nada) y `/real-use:ahorro` si notas que el límite se gasta rápido.

## Fuentes

- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)
- [Prompting best practices (roles, contexto, ejemplos, diseño frontend)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [Manage costs effectively](https://code.claude.com/docs/en/costs)
- [Keep Claude working toward a goal (/goal)](https://code.claude.com/docs/en/goal)
- [Skills](https://code.claude.com/docs/en/skills) · [Subagents](https://code.claude.com/docs/en/sub-agents) · [Hooks](https://code.claude.com/docs/en/hooks) · [Plugin reference](https://code.claude.com/docs/en/plugins-reference)
- [Using Claude Code: Spending your effort](https://claude.dev/blog/spending-your-effort/)
- [What a task costs on Opus 5.5](https://claude.dev/blog/what-a-task-costs-on-opus-5-5/)
- [Getting the most out of Opus 5.5](https://claude.dev/blog/getting-the-most-out-of-opus-5-5/)
- [How the Claude Code team does code review](https://claude.dev/blog/solving-code-review-at-anthropic/)
- [Building effective agent automations](https://claude.dev/blog/building-effective-agent-automations/)
- [Claude Code in the cloud: a field guide](https://claude.dev/blog/claude-code-in-the-cloud/)
- [Getting started with Claude Code mods](https://claude.dev/blog/getting-started-with-claude-code-mods/)
- [Create a mod](https://code.claude.com/docs/en/plugins/mods/create) · [Mods reference](https://code.claude.com/docs/en/plugins/mods/reference)
- [Artículos de claude.com](https://claude.com/es/resources/articles)
