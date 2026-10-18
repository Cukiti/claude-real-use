# Claude Real Use

Un sistema de trabajo para Claude Code (terminal y app de escritorio) que pretende responder a una pregunta: **¿cómo hay que usar a Claude para terminar productos, sin quemar tokens ni dejar pendientes al aire?**

Se apoya en lo que publica Anthropic. La explicación completa está en **[GUIA.md](GUIA.md)**. En resumen:

1. El proyecto vive en archivos (`.cru/`), no en sesiones.
2. Una tarea por sesión, con criterio de terminado.
3. Siempre una verificación ejecutable, con evidencia.
4. Explorar → planificar → implementar → verificar. Para lo grande, primero una entrevista y una spec.
5. Effort y modelo según la tarea (medium por defecto).
6. Delegar lo que lee mucho y devuelve poco; sesiones paralelas para lo independiente.
7. Cerrar cada sesión: estado escrito y una frase para retomar.

## Qué incluye

```
claude-real-use/
├── GUIA.md                      ← cómo usar Claude de verdad (con fuentes)
├── PROMPTS.md                   ← prompts listos para copiar y pegar
├── plantillas-usuario/          ← bloque recomendado para tu ~/.claude/CLAUDE.md
├── .cru/                        ← este repo usa su propio sistema (ejemplo real)
├── tests/                       ← tests de los scripts (npm test)
└── plugins/real-use/            ← el plugin
    ├── skills/
    │   ├── menu/                /real-use:menu       ¿qué hago ahora? tablero con botones + chuleta
    │   ├── automatizar/         /real-use:automatizar hooks, tareas programadas, routines, Actions (apruebas tú)
    │   ├── bot/                 /real-use:bot        bot de revisión con REVIEW.md que aprende
    │   ├── hacer/               /real-use:hacer      cualquier petición vaga → tarea completa → hecha
    │   ├── equipo/              /real-use:equipo     agentes con roles (lentes), modelo y effort propios
    │   ├── conectar/            /real-use:conectar   MCPs, conectores, plugins y CLIs: qué añadir y qué quitar
    │   ├── experto/             /real-use:experto    lentes expertas: criterios, antipatrones, verificación
    │   ├── iniciar/             /real-use:iniciar    detecta, entrevista, elige metodología, crea .cru/
    │   ├── spec/                /real-use:spec       idea vaga → spec → tareas verificables
    │   ├── siguiente/           /real-use:siguiente  toma la siguiente tarea, la enruta, la verifica
    │   ├── enrutar/             /real-use:enrutar    modelo / effort / agente / sesión para cada tarea
    │   ├── verificar/           /real-use:verificar  verificación + revisor adversarial
    │   ├── pendientes/          /real-use:pendientes cabos sueltos → tareas
    │   ├── cerrar/              /real-use:cerrar     cierre de sesión sin pendientes
    │   ├── paralelo/            /real-use:paralelo   tareas independientes → sesiones en worktrees
    │   ├── ahorro/              /real-use:ahorro     auditoría de tokens de tu configuración
    │   └── panel/               /real-use:panel      status line: tarea en curso + % de contexto
    ├── agents/                  explorador (Haiku) · verificador (Sonnet) · revisor · especialista (con lente)
    ├── hooks/                   inicio: estado de .cru/ · copiloto: avisos de contexto, caché, effort y correcciones
    ├── scripts/                 session-start.js · copiloto.js · statusline.js
    ├── referencias/             metodologías · verificación por stack · catálogo · lentes/ (9 lentes expertas)
    └── plantillas/              PROJECT · TASKS · LOG · DECISIONS
```

Las opciones se presentan siempre como preguntas para elegir, con la recomendación primero. Tú eliges y Claude ejecuta.

## Instalación

Requisitos: Claude Code reciente y Node.js en el PATH (lo usa el hook de inicio de sesión).

Desde una carpeta local:

```bash
claude plugin marketplace add ./claude-real-use
```

```bash
claude plugin install real-use@real-use --scope user
```

Desde GitHub (el repo es privado: necesitas acceso y git autenticado, p. ej. con `gh auth login`):

```text
/plugin marketplace add Cukiti/claude-real-use
/plugin install real-use@real-use
/reload-plugins
```

Para probarlo sin instalarlo:

```bash
claude --plugin-dir ./claude-real-use/plugins/real-use
```

## Uso diario

```text
/real-use:hacer quiero que el menú se vea más profesional            ← cualquier petición, en tus palabras
/real-use:iniciar un roguelike de cartas para móvil en Godot      ← una vez por proyecto
/real-use:siguiente                                              ← cada sesión
/real-use:spec sistema de guardado en la nube                    ← antes de una feature grande
/real-use:verificar                                              ← antes de dar algo por terminado
/real-use:cerrar                                                 ← al terminar la sesión
/clear                                                           ← entre tareas no relacionadas
```

Al abrir una sesión nueva en el proyecto, Claude ya recibe la fase, la tarea en curso, las siguientes y la última entrada de la bitácora, así que no hace falta volver a explicarle nada.

## Formato de `.cru/TASKS.md`

```markdown
## En curso
- [~] T-003 Guardado local · hecho: partida se restaura tras cerrar · verif: `godot --headless -s addons/gut/gut_cmdln.gd` · queda: serializar inventario
## Pendiente
- [ ] T-004 Menú de pausa · hecho: pausa/continúa/sale · verif: test de escena
## Bloqueado
- [!] T-007 Logros de Play Games · bloqueado por: cuenta de desarrollador
## Hecho
- [x] T-001 Bucle de combate · ✔ 2026-10-15
```

Los archivos `.cru/` van en git: son la memoria del proyecto, y así el equipo y las sesiones en la nube la comparten. La carpeta [.cru/](.cru/) de este repositorio es un ejemplo real.

## Qué aporta, medido

Evals de resultado (`npm run evals:resultado`): la misma tarea, con el plugin y sin él, puntuada por lo que queda escrito en disco o en la respuesta.

| Caso | Con plugin | Sin plugin | Δ |
|---|---|---|---|
| Cerrar la sesión: tarea marcada y prompt para retomar en la bitácora | 1,00 | 0,50 | **+0,50** |
| `/real-use:hacer` con una petición vaga: ficha con terminado y verificación | 1,00 | 0,00 | **+1,00** |
| Hacer la siguiente tarea simple y actualizar `TASKS.md` | 1,00 | 1,00 | 0 |
| Revisar un CSS con criterio de diseño | 0,88 | 0,88 | 0 |

Lectura honesta: en tareas simples Claude ya lo hace bien sin ayuda. El plugin aporta en la **continuidad entre sesiones** y en convertir peticiones vagas en trabajo verificable. Esos dos puntos son justo los que hacen que los proyectos se queden a medias.

## Desarrollo

```bash
npm test
```

```bash
npm run validate
```

Evals de activación: 16 casos que comprueban que cada frase activa la skill correcta y no la competidora (`hacer` frente a `experto` o `spec`), y que las preguntas normales no activan ninguna. Los casos se definen en [scripts/generar-evals.js](scripts/generar-evals.js). Cuestan unos $3,50 con 3 ejecuciones por caso, así que no corren en CI: lánzalos cuando cambies la descripción de una skill.

```bash
npm run evals:generar
```

```bash
npm run evals
```

## Licencia

MIT
