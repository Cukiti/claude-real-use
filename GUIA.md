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
| `/real-use:iniciar` | 1, 3: estado en archivos, metodología, verificación |
| `/real-use:spec` | 4: entrevista → spec → tareas |
| `/real-use:siguiente` | 2, 5, 6: una tarea, enrutada al coste justo, verificada |
| `/real-use:enrutar` | 5, 6: qué modelo/effort/agente/sesión usar |
| `/real-use:verificar` | 3, 6: verificación + revisor adversarial |
| `/real-use:pendientes` | 7: cabos sueltos convertidos en tareas |
| `/real-use:cerrar` | 7: cierre sin pendientes al aire |
| `/real-use:ahorro` | Auditoría de tokens de tu configuración |

Y un hook que, al abrir una sesión en un proyecto con `.cru/`, le da a Claude el estado actual en unas pocas líneas (y no hace nada en proyectos sin `.cru/`).

## Fuentes

- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)
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
- [Artículos de claude.com](https://claude.com/es/resources/articles)
