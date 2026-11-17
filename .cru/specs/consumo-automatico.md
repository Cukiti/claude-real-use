# Consumo automático: modelo y effort por tarea

## Objetivo
Que cada paso del proyecto corra solo con el modelo (Haiku, Sonnet, Opus, Fable) y el effort que le tocan, sin que el usuario ejecute `/model` ni `/effort`, y que vea en qué se fue su límite.

Fuera de alcance: cambiar el modelo de la sesión principal desde un hook (no es posible), tocar los ajustes globales del usuario, medir tokens reales (solo se registra lo asignado).

## Qué permite Claude Code (fuentes en GUIA.md)
- Skill: `model` y `effort` en el frontmatter valen **solo para ese turno**; después vuelve el de la sesión. Con `context: fork` fijan el modelo y el effort del subagente. (code.claude.com/docs/en/skills)
- Subagente: `model` (haiku, sonnet, opus, fable o ID) y `effort` en el frontmatter; el parámetro `model` de la llamada al agente gana sobre el frontmatter; el parámetro `effort` de la llamada existe desde Claude Code 2.1.292. (…/sub-agents)
- Ningún hook puede fijar el modelo ni el effort; solo leerlos o bloquear un cambio. (…/hooks)
- Con la instalada (2.1.283) no hay `effort` por llamada: por eso se usan **agentes por nivel**, cada uno con su modelo y effort en el frontmatter.

## Comportamiento
1. Hay cuatro agentes ejecutores por nivel, y el nivel sale de una sola tabla (`referencias/consumo.md`):
   - `explorar`: Haiku · low (buscar, leer, resumir).
   - `rutina`: Sonnet · medium (tests, logs, ediciones mecánicas, migraciones).
   - `estandar`: Opus · medium (features y bugs normales).
   - `profundo`: Opus · xhigh (seguridad, dinero, datos de usuarios, verificación y revisión).
   - `maximo`: Fable · high, solo para escalar.
2. `scripts/consumo.js <tipo> [--perfil p]` imprime `nivel · modelo · effort · motivo`. Es determinista, sin modelo. Las skills lo ejecutan y usan su salida; no deciden por su cuenta.
3. El perfil sale de `Consumo:` en `PROJECT.md` (`ahorro` · `equilibrado` · `calidad`; por defecto `equilibrado`). `ahorro` baja un nivel (estandar→rutina); `calidad` sube uno (rutina→estandar). Nunca baja seguridad/dinero/datos de `profundo` ni sube a `maximo`.
4. Las skills de registro (`cerrar`, `menu`, `enrutar`, `conectar`, `mapa`) fijan `effort: low`; `verificar` y la revisión, `high`. `siguiente` y `hacer` orquestan y delegan la ejecución al agente del nivel que devuelve el script, pasando la ficha de la tarea.
5. Escalada a Fable: solo tras 2 intentos fallidos de `profundo` en lo mismo. Antes de lanzar `maximo`, `AskUserQuestion` (tope por tarea): "Subir a Fable para esto: coste alto" con opción recomendada y "Seguir en Opus". Tras el resultado se vuelve al nivel anterior.
6. Si Opus o el effort pedido no están permitidos (lista de la organización) o falla el cambio, el agente corre con lo que haya y la tarea lo anota; no se detiene.
7. Control visible: la línea de estado y la banda de tarea muestran `nivel · modelo · effort` del paso en curso; al cerrar una tarea se añade a `LOG.md` `Consumo: <nivel> <modelo> <effort> (+ escalada si hubo)`.
8. `CLAUDE_CODE_EFFORT_LEVEL` en el entorno gana a todo: si está puesta, `consumo.js` lo dice una vez ("tu variable fija el effort; los niveles de effort del plugin no aplican").

## Casos límite (decididos)
- Tarea sin tipo claro: `estandar`, y `hacer` la clasifica antes. No se pregunta por el nivel.
- Cambiar de modelo rompe la caché solo en el subagente; la sesión principal no cambia de modelo.
- Interrupción a mitad: el nivel queda anotado en la tarea; `retomar.js` lo muestra y reanuda con el mismo.
- Perfil desconocido en `PROJECT.md`: se usa `equilibrado` y se avisa.
- Varias tareas en paralelo: cada sesión usa su propio nivel; `paralelo` lo escribe en cada prompt.
- Nombres de modelo: solo alias (`haiku`, `sonnet`, `opus`, `fable`) para no quedar anclado a una versión.

## Archivos e interfaces
- Nuevos: `plugins/real-use/referencias/consumo.md`, `plugins/real-use/scripts/consumo.js`, `plugins/real-use/agents/{explorar,rutina,estandar,profundo,maximo}.md` (los actuales `explorador`, `verificador`, `especialista` y `revisor` se mantienen y se alinean con la tabla).
- Cambian: `skills/{siguiente,hacer,paralelo,equipo,enrutar,iniciar}/SKILL.md`, `scripts/{statusline,retomar,session-start}.js`, `hooks/tarea-actual.mjs`, `referencias/` de enrutado, `GUIA.md` (fuentes y la frase "Claude no puede cambiar el effort" en `hacer` se corrige: lo hace el agente por nivel).
- `PROJECT.md`: línea opcional `- Consumo: equilibrado`. El formato de `TASKS.md` no cambia.
- Tests: `tests/scripts.test.js` (consumo.js, perfiles, escalada), `tests/estructura.test.js` (frontmatter de los agentes y de las skills coincide con la tabla).

## Verificación end-to-end
1. `npm test && npm run validate` pasa.
2. `node plugins/real-use/scripts/consumo.js seguridad --perfil ahorro` imprime `profundo · opus · xhigh`; `... bug --perfil ahorro` imprime `rutina · sonnet · medium`.
3. En un proyecto de prueba, `/real-use:siguiente <tarea de test>` lanza el agente del nivel; `/tasks` muestra su modelo y effort, y la línea de estado también.
4. Tras cerrar la tarea, `LOG.md` tiene la línea `Consumo:`.
5. Forzar dos fallos y comprobar que aparece la pregunta de subir a Fable antes de usarlo.

## Tareas
- [ ] T-051 Tabla única de consumo y perfiles · hecho: `referencias/consumo.md` define los cinco niveles, los tipos de tarea, los tres perfiles y las reglas de escalada · verif: `npm test` · spec: specs/consumo-automatico.md
- [ ] T-052 Script `consumo.js` · hecho: devuelve nivel, modelo, effort y motivo según tipo y perfil, avisa de perfil desconocido y de `CLAUDE_CODE_EFFORT_LEVEL` · verif: `npm test` · spec: specs/consumo-automatico.md
- [ ] T-053 Agentes por nivel · hecho: cinco agentes con el modelo y el effort de la tabla y un test que los compara con ella · verif: `npm test && npm run validate` · spec: specs/consumo-automatico.md
- [ ] T-054 `siguiente` y `hacer` delegan en el nivel · hecho: ejecutan `consumo.js`, lanzan el agente indicado con la ficha y quitan la frase de que Claude no puede cambiar el effort · verif: `npm test` y eval de activación · spec: specs/consumo-automatico.md
- [ ] T-055 Escalada a Fable con tope · hecho: tras 2 fallos pregunta con `AskUserQuestion` antes de usar `maximo` y vuelve al nivel anterior · verif: eval o prueba manual anotada en `LOG.md` · spec: specs/consumo-automatico.md
- [ ] T-056 Consumo visible · hecho: línea de estado, banda de tarea y `retomar.js` muestran nivel·modelo·effort; `cerrar` escribe `Consumo:` en `LOG.md` · verif: `npm test` · spec: specs/consumo-automatico.md
- [ ] T-057 Alinear `paralelo`, `equipo`, `enrutar`, `iniciar` y GUIA.md · hecho: usan los mismos niveles, `iniciar` pregunta el perfil y GUIA.md cita las fuentes · verif: `npm test` · spec: specs/consumo-automatico.md
- [ ] T-058 Prueba manual con Claude Code ≥ 2.1.292 · hecho: `/tasks` confirma modelo y effort del agente por nivel y se anota si el parámetro `effort` por llamada simplifica los agentes · verif: anotado en `.cru/LOG.md` · spec: specs/consumo-automatico.md
