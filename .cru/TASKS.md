# Tareas

<!--
Formato (lo lee el hook de inicio de sesión, no lo cambies):
Marcas: `[ ]` pendiente · `[~]` en curso · `[!]` bloqueada · `[x]` hecha
Cada tarea: ID · título · hecho: <criterio> · verif: <cómo se comprueba>
-->

## En curso

## Pendiente
- [x] T-030 Probar /real-use:bot en un repo con PRs (CI comenta un PR de prueba) · hecho: comentario del bot en un PR · verif: `gh pr view <n> --comments` · verif: PR 3 de prueba, claude[bot] comentó la ruta inexistente y el texto en inglés (PR 1 fusionado con workflow + REVIEW.md; PR 3 cerrado sin fusionar) · ✔ 2026-11-14
- [ ] T-044 Prueba manual: cerrar en Claude y abrir el mismo repo en Cursor · hecho: la primera respuesta nombra la tarea pendiente y la fase sin que el usuario explique el contexto · verif: anotado en `.cru/LOG.md` · spec: specs/retomar-entre-agentes.md
- [x] T-045 El resumen no toma por visto bueno la frase "revisión: pendiente" cuando va dentro del título · hecho: T-036 no sale en "Esperando el visto bueno" · verif: `npm test` · ✔ 2026-11-07
- [x] T-046 Identidad Real Use y la regla de que la persona decide · hecho: `identidad.md` tiene la paleta y la plantilla `AGENTS.md` dice que la persona decide · verif: `npm test` · spec: specs/crear-producto.md · ✔ 2026-11-14
- [x] T-047 Selector de juego, móvil, web y escritorio · hecho: juego recomienda Godot y, si el comando no está, lo dice sin afirmar que el proyecto corre · verif: `npm test` · spec: specs/crear-producto.md · ✔ 2026-11-14
- [x] T-048 Crear `.cru/` desde la categoría sin pisarlo si ya existe · hecho: la segunda pasada lista los huecos y deja `PROJECT.md` igual · verif: `npm test` · spec: specs/crear-producto.md · ✔ 2026-11-14
- [x] T-049 Actualización que solo propone guías de Anthropic, OpenAI y Gemini · hecho: con un fixture escribe la propuesta y no modifica las skills · verif: `npm test` · spec: specs/crear-producto.md · ✔ 2026-11-14 · límite: el aviso de choque es por palabras y da falsos positivos con guías reales
- [ ] T-050 Prueba manual: elegir Juego y ver la recomendación · hecho: se ve Godot, vertical slice y si `godot` está instalado · verif: anotado en `.cru/LOG.md` · spec: specs/crear-producto.md
- [ ] T-051 Tabla única de consumo y perfiles · hecho: `referencias/consumo.md` define los cinco niveles, los tipos de tarea, los tres perfiles y las reglas de escalada · verif: `npm test` · spec: specs/consumo-automatico.md
- [ ] T-052 Script `consumo.js` · hecho: devuelve nivel, modelo, effort y motivo según tipo y perfil, avisa de perfil desconocido y de `CLAUDE_CODE_EFFORT_LEVEL` · verif: `npm test` · spec: specs/consumo-automatico.md
- [ ] T-053 Agentes por nivel · hecho: cinco agentes con el modelo y el effort de la tabla y un test que los compara con ella · verif: `npm test && npm run validate` · spec: specs/consumo-automatico.md
- [ ] T-054 `siguiente` y `hacer` delegan en el nivel · hecho: ejecutan `consumo.js`, lanzan el agente indicado con la ficha y quitan la frase de que Claude no puede cambiar el effort · verif: `npm test` y eval de activación · spec: specs/consumo-automatico.md
- [ ] T-055 Escalada a Fable con tope · hecho: tras 2 fallos pregunta con `AskUserQuestion` antes de usar `maximo` y vuelve al nivel anterior · verif: eval o prueba manual anotada en `LOG.md` · spec: specs/consumo-automatico.md
- [ ] T-056 Consumo visible · hecho: línea de estado, banda de tarea y `retomar.js` muestran nivel·modelo·effort; `cerrar` escribe `Consumo:` en `LOG.md` · verif: `npm test` · spec: specs/consumo-automatico.md
- [ ] T-057 Alinear `paralelo`, `equipo`, `enrutar`, `iniciar` y GUIA.md · hecho: usan los mismos niveles, `iniciar` pregunta el perfil y GUIA.md cita las fuentes · verif: `npm test` · spec: specs/consumo-automatico.md
- [ ] T-058 Prueba manual con Claude Code ≥ 2.1.292 · hecho: `/tasks` confirma modelo y effort del agente por nivel y se anota si el parámetro `effort` por llamada simplifica los agentes · verif: anotado en `.cru/LOG.md` · spec: specs/consumo-automatico.md
- [x] T-059 Arreglar el test de Windows "retomar avisa de los caminos sin commit" · hecho: CI de main en verde en windows-latest (falla desde 2026-11-07, esperaba `Desfase: 2 caminos sin commit.`) · verif: `gh run list --branch main` · causa: `sameDir` comparaba rutas 8.3 (RUNNER~1) con la larga de git; ahora usa `realpathSync.native` · ✔ 2026-11-14

## Bloqueado

## Hecho
- [x] T-001 Investigar documentación y blogs de Anthropic · ✔ 2026-10-17
- [x] T-002 Manifiestos de plugin y marketplace · verif: `claude plugin validate` · ✔ 2026-10-17
- [x] T-003 Hook SessionStart que inyecta el estado de .cru/ · ✔ 2026-10-17
- [x] T-004 Skills iniciar, spec, siguiente, enrutar, verificar, pendientes, cerrar, ahorro · ✔ 2026-10-17
- [x] T-005 Subagentes explorador, verificador, revisor · ✔ 2026-10-17
- [x] T-006 GUIA.md, metodologías y catálogo · ✔ 2026-10-17
- [x] T-007 Recetas de verificación por stack · ✔ 2026-10-17
- [x] T-008 Skills paralelo y panel + status line · ✔ 2026-10-17
- [x] T-009 Tests de los scripts (`npm test`) y PROMPTS.md · ✔ 2026-10-17
- [x] T-011 Mover el repositorio a una carpeta permanente · verif: `npm test` 7/7 y validador en la nueva ruta · ✔ 2026-10-17

- [x] T-010 Probar el plugin cargado en una sesión real · verif: `claude --plugin-dir` + Haiku: hook correcto, 8 skills y 3 agentes visibles (ahorro/panel ocultos al modelo por diseño), /real-use:pendientes ejecutado en fork con explorador · ✔ 2026-10-17

- [x] T-012 Publicar en GitHub (privado): https://github.com/Cukiti/claude-real-use · verif: push de main a origin · ✔ 2026-10-17

- [x] T-015 CI en GitHub con `npm test` · verif: run 39080336016, ubuntu-latest y windows-latest en verde · ✔ 2026-10-17
- [x] T-017 Skill experto + 9 lentes (criterios, antipatrones, entrega, verificación) y revisor que acepta lentes · verif: sesión real `/real-use:experto qa revisar statusline.js` encontró 4 fallos reales · ✔ 2026-10-17
- [x] T-018 Skill hacer: petición vaga → ficha de tarea → ruta → ejecución · verif: validate + test de estructura · ✔ 2026-10-17
- [x] T-019 Paso "Aprender: corregir en la fuente" en /real-use:cerrar · ✔ 2026-10-17
- [x] T-020 Tests de estructura (rutas, lentes, frontmatter) y arreglo de los 4 fallos de QA en statusline/session-start · verif: `npm test` 17/17 · ✔ 2026-10-17

- [x] T-014 Evals de activación (16 casos: 13 positivos con competidoras excluidas + 3 negativos) · verif: `npm run evals` 48/48 ejecuciones ($3,47); prueba de mutación de hacer → 0/3 · ✔ 2026-10-17
- [x] T-021 Copiloto (hook UserPromptSubmit): avisos de contexto, caché fría, correcciones seguidas, effort y peticiones vagas, solo al usuario (systemMessage) · verif: 9 tests + sesión real muestra "UserPromptSubmit says: 💡…" · ✔ 2026-10-17
- [x] T-022 Aviso al reanudar una sesión grande con la caché caducada (session-start, con coste estimado) y opción avisos todos/coste/ninguno en /config · verif: tests · ✔ 2026-10-17
- [x] T-023 Skills menu, equipo y conectar; agente especialista con lente; effort automático (verificar high; cerrar, enrutar, menu y conectar low) · verif: evals 57/57 ($4,43) · ✔ 2026-10-17
- [x] T-024 Recortar descripciones (5.257 → ~3.560 caracteres) con presupuesto en tests, sin ": " y con cláusula "Usar…" obligatoria · verif: `npm test` 30/30 · ✔ 2026-10-17

- [x] T-025 Evals tras el recorte de descripciones · verif: `npm run evals` 57/57 ($4,27) · ✔ 2026-10-18

- [x] T-026 Plugins móviles (everything-claude-code-mobile, chrisbanes-skills) solo en los 6 proyectos Android · verif: sesión real en Colmadon carga 0 skills móviles y Teikafusion 98 · copia: ~/.claude/settings.json.bak-real-use · ✔ 2026-10-18
- [x] T-027 Aviso ✏ de cambios sin verificar (PostToolUse + Stop, primero y luego cada 3 turnos) · verif: 5 tests + sesión real "Stop says: ✏ 1 archivo cambiado…" · ✔ 2026-10-18
- [x] T-028 menu con tablero de botones (widget con sendPrompt en la app; opciones en la terminal), tras fusionar la skill tablero · verif: tablero dibujado en la app + evals · ✔ 2026-10-18
- [x] T-029 Skills automatizar (catálogo de mecanismos, aprobación explícita) y bot (REVIEW.md + GitHub Action oficial o workflow propio, aprende en cerrar) · verif: evals 66/66 ($4,89) · ✔ 2026-10-18
- [x] T-031 Evals de resultado con línea base (4 casos) · verif: hacer Δ +1,00 · cerrar Δ +0,50 (tras arreglarlo) · siguiente y experto Δ 0 · ✔ 2026-10-18
- [x] T-032 cerrar acepta la verificación que reporta el usuario (anotada "según el usuario"), hallado por los evals de resultado · verif: cerrar 1,00 frente a 0,50 · ✔ 2026-10-18
- [x] T-033 iniciar adopta el seguimiento existente (migrar / adoptar / solo lo nuevo), detecta scripts de prueba y worktrees sobrantes; hallado al preparar Colmadon · verif: tests + validate · ✔ 2026-10-18
- [x] T-034 Plugin instalado desde Cukiti/claude-real-use (scope user) · verif: Colmadon lista 15 skills real-use · ✔ 2026-10-18

- [x] T-013 Estreno en Colmadón (proyecto real): iniciar funcionó sin tocar archivos a mano; 7 fricciones encontradas y corregidas en v0.6.0 · verif: hook muestra Pendientes y la entrada más reciente de docs/BITACORA.md; evals cerrar 1,00 en modo normal y adoptado · ✔ 2026-10-18
- [x] T-035 Mapa visual del proyecto (scripts/mapa.js sin modelo + skill mapa, publicado como artifact) · verif: 6 tests + mapas de este repo y Colmadón publicados · ✔ 2026-10-18 · revisión: ok 2026-11-07
- [x] T-036 Entrega como compañero con visto bueno (referencias/entrega.md, estado "revisión: pendiente" en hook, menú, mapa y cerrar) y siguientes pasos siempre · verif: tests 45/45 · ✔ 2026-10-18
- [x] T-037 Cuestionarios (formulario en widget o AskUserQuestion), stack con gratis/freemium/pago y Presupuesto:, /design en spec y /slides en cerrar · ✔ 2026-10-18
- [x] T-038 Confirmar el eval hacer-ficha con la ficha antes de las preguntas (la última ejecución se cortó por límite de uso; antes 3/4) · hecho: 4/4 · verif: `npm run evals:resultado -- --case hacer-ficha` · 2026-10-18: otra vez 3/4 (run 1 sin ficha, 6 turnos, $0.34; traza borrada) · causa: tomaba el bug por trivial y se saltaba la ficha; arreglado en skills/hacer · ✔ 2026-10-18 (4/4)
- [x] T-039 README atractivo hecho por Codex (gpt-6.1-sol): banner y diagrama SVG en assets/, badges, emojis y hueco para GIF de demo · verif: README se ve bien en GitHub, enlaces y SVG válidos, `npm test` · ✔ 2026-10-18 · revisado ✔ 2026-10-18
- [x] T-016b Requisito del mod: Claude Code ≥ 2.1.287 · verif: `claude --version` → 2.1.303 · ✔ 2026-11-07
- [x] T-016 Mod "tarea actual": banda sobre el prompt con la tarea [~] y el % de contexto · hecho: se ve en terminal y en escritorio · verif: `claude plugin test` 3/3 · ✔ 2026-11-07 · revisado ✔ 2026-11-07
- [x] T-040 Script único de retoma (`scripts/retomar.js`) y el hook de Claude lo usa · hecho: el resumen nombra fase, conteos, tarea en curso o siguiente y la última bitácora, también con archivos adoptados · verif: `npm test` 49/49 · ✔ 2026-11-07 · revisado ✔ 2026-11-07 · spec: specs/retomar-entre-agentes.md
- [x] T-041 Aviso de desfase, sin escribir archivos · hecho: git con cambios sin commit, o una bitácora que nombra una tarea ya `[x]`, añade una línea `Desfase:` · verif: `npm test` 52/52 · ✔ 2026-11-07 · revisado ✔ 2026-11-07 · spec: specs/retomar-entre-agentes.md
- [x] T-042 Instrucción única de retoma, y `siguiente` y `menu` la siguen · hecho: el agente muestra la salida del script y, si hay desfase, pregunta antes de editar · verif: `npm test` 53/53 · ✔ 2026-11-07 · revisado ✔ 2026-11-07 · spec: specs/retomar-entre-agentes.md
- [x] T-043 Adaptadores de Codex y Gemini con la misma salida que el script · hecho: `codex-resume.cjs` imprime lo mismo que `retomar.js` en un proyecto de prueba · verif: `npm test` 54/54 · ✔ 2026-11-07 · revisado ✔ 2026-11-07 · spec: specs/retomar-entre-agentes.md
