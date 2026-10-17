# Recetas de verificación por stack

La verificación es lo que más mejora el resultado: sin ella, Claude para cuando el trabajo *parece* terminado. Una buena verificación:
- se ejecuta con **un comando** que devuelve pasa/falla (código de salida 0 o distinto de 0),
- tarda poco (menos de 2 minutos; si tarda más, separa una versión rápida para cada tarea y la completa para el cierre del hito),
- no necesita que la mires tú.

Escribe el comando en `Verificación:` de `.cru/PROJECT.md` y en el `CLAUDE.md` del proyecto. Comprueba las rutas y los flags con la versión instalada de cada herramienta antes de fijarlos.

---

## Godot 4

| Nivel | Comando |
|---|---|
| Humo (el proyecto carga sin errores de script) | `godot --headless --quit-after 2` |
| Tests con GUT | `godot --headless -s addons/gut/gut_cmdln.gd -gdir=res://test -gexit` |
| Tests con gdUnit4 | `addons/gdUnit4/runtest.cmd -a res://test` (Windows) · `addons/gdUnit4/runtest.sh -a res://test` |

Para que la lógica de juego se pueda testear, ponla en scripts que no dependan de la escena (clases `RefCounted`/`Resource`: combate, inventario, guardado, economía). La escena solo presenta. Si tienes el MCP de Godot conectado, `run_project` + `get_debug_output` sirven como humo visual, pero no sustituyen a los tests.

## Unity

| Nivel | Comando |
|---|---|
| Tests EditMode | `Unity -batchmode -projectPath . -runTests -testPlatform EditMode -testResults results.xml` |
| Tests PlayMode | igual con `-testPlatform PlayMode` |

Con `-runTests` no añadas `-quit`. Lee `results.xml` (o pásalo al subagente `real-use:verificador`).

## Android (Gradle)

| Nivel | Comando |
|---|---|
| Compila | `./gradlew assembleDebug` (Windows: `gradlew.bat assembleDebug`) |
| Tests unitarios | `./gradlew testDebugUnitTest` |
| Lint | `./gradlew lintDebug` |
| Instrumentados (emulador/dispositivo) | `./gradlew connectedDebugAndroidTest` |

## iOS

`xcodebuild test -scheme <Scheme> -destination 'platform=iOS Simulator,name=<iPhone>'`

## Flutter

`flutter analyze && flutter test`

## Web / Node / TypeScript

| Nivel | Comando |
|---|---|
| Tipos | `npx tsc --noEmit` |
| Tests | `npm test` (Vitest/Jest) |
| Build | `npm run build` |
| E2E | `npx playwright test` |
| Visual | Captura con el navegador integrado de la app de escritorio (o Claude in Chrome) y comparación con el diseño |

## Python

`ruff check . && pytest -q` (añade `mypy .` si el proyecto usa tipos)

## Rust · Go

`cargo clippy -- -D warnings && cargo test` · `go vet ./... && go test ./...`

---

## Cuando "no se puede testear"

Casi siempre se puede verificar algo:

| Situación | Verificación |
|---|---|
| UI o diseño | Captura del resultado + lista de diferencias contra la referencia |
| Salida de un script o generador | Comparar con un archivo de referencia (`diff esperado.txt salida.txt`) |
| Algoritmo complejo | Comparar contra una versión de fuerza bruta en entradas pequeñas |
| Bug intermitente | Ejecutar la suite N veces seguidas (p. ej. 30) |
| Rendimiento | Medir antes y después con el mismo escenario y anotar los números en `LOG.md` |
| "Se siente bien" (feel de un juego) | La verificación eres tú: Claude prepara la build y una lista de qué probar, y tú respondes pasa/falla |

Si la verificación necesita al usuario, la tarea se marca `[~]` con ` · queda: prueba manual de <qué>` hasta que la confirme.
