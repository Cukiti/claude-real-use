# Crear un producto con identidad Real Use

## 1. Objetivo

Cualquier desarrollador elige una categoría, confirma la recomendación y obtiene un proyecto con seguimiento, verificación y la misma regla en cualquier agente: la persona decide.

Fuera de alcance:

- Instalar Godot, Unreal, Unity, un IDE o un SDK.
- Reescribir el plugin sin el visto bueno de la persona.
- Una plantilla completa por cada motor y cada lenguaje. El catálogo recomienda; esta versión genera cuatro categorías.
- Cuentas, tienda o un servicio en la nube. Ninguna de las cuatro acciones los necesita.
- Una ventana aparte. La interfaz es el mismo cuestionario, los mismos nombres de color y el mismo orden en Claude, Cursor, Codex y Gemini.

## 2. Comportamiento

Cuando la persona quiere empezar un producto, el agente muestra cuatro categorías. La recomendada va primera. La persona confirma o elige otra.

| Categoría | Recomendación | Metodología | Verificación |
|---|---|---|---|
| Juego | Godot | Vertical slice, fase Prototipo | `godot --headless` si el comando existe |
| Móvil | Android con Gradle | MVP por features | `gradlew test` si el comando existe |
| Web | El stack ya detectado; si el directorio está vacío, un sitio estático | Kanban si es un sitio; Shape Up ligero si dice que es un producto | El comando detectado, o abrir el HTML si no hay otro |
| Escritorio | El lenguaje ya detectado; si no hay ninguno, una herramienta Node | TDD + semver si es una herramienta; MVP por features si tiene pantallas | `npm test` si hay `package.json`; si no, el comando detectado |

1. Cuando el comando recomendado no está en el PATH, el resultado lo dice en una línea y la primera tarea es instalarlo la persona. El resumen no afirma que el proyecto ya corre.
2. Cuando la persona confirma, se crean `.cru/PROJECT.md`, `TASKS.md`, `LOG.md` y `DECISIONS.md` con categoría, stack, metodología, fase y verificación. Las tareas son la primera rebanada de `metodologias.md`, cada una con `hecho:` y `verif:`.
3. En el proyecto nuevo se escribe `AGENTS.md` con la regla permanente: el proyecto es de la persona; ella decide categoría, stack, metodología y cualquier cambio de fondo; el agente recomienda y no aplica ese cambio sin preguntar. Si ya existe `CLAUDE.md` y no hay `AGENTS.md`, se crea `AGENTS.md` y `CLAUDE.md` lo importa con `@AGENTS.md`. Si `AGENTS.md` ya existe, se añade la regla solo cuando no está.
4. La identidad vive en `plugins/real-use/referencias/identidad.md`: tinta `#1B242C`, papel `#F3EFE4`, camino `#0E6B66`, aviso `#C9842A`. El cuestionario usa esos nombres. Un agente que pueda colorear usa esos hex. Uno que no pueda, usa las mismas palabras.
5. El comando de actualización lee `plugins/real-use/referencias/fuentes.json` (guías oficiales de Anthropic, OpenAI y Gemini sobre buen uso y flujo de trabajo), escribe una propuesta y no modifica skills, hooks ni `.cru/`. Si una guía contradice una decisión guardada, la propuesta lo dice y la decisión vieja sigue vigente.
6. Otro agente, al abrir el proyecto, lee `AGENTS.md` y `.cru/PROJECT.md`. Ve la misma categoría, el mismo stack y la misma regla. `retomar.js` sigue siendo el resumen.

## 3. Casos límite

- **Motor o lenguaje ausente.** Se nombra el comando que falta. No se genera un proyecto del motor ni se marca la verificación como pasada.
- **Guía nueva contra una decisión.** La propuesta cita la decisión y no la edita.
- **Creación interrumpida.** Si `.cru/PROJECT.md` ya existe, no se crea otro ni se pisa. La salida lista solo los huecos (sin verificación, sin tareas, sin la regla en `AGENTS.md`).
- **Directorio vacío.** La recomendación de la tabla se usa tal cual. No se inventa un segundo stack.
- **Categoría ya guardada.** Una segunda pasada muestra la guardada como recomendada y no la cambia sin confirmación.

## 4. Archivos e interfaces

- `plugins/real-use/referencias/identidad.md` — paleta, tono y la regla de que la persona decide.
- `plugins/real-use/referencias/categorias.md` — las cuatro filas de la tabla. Apunta a `metodologias.md` y `catalogo.md`; no los copia.
- `plugins/real-use/referencias/fuentes.json` — URLs oficiales de partida: las de `GUIA.md` para Anthropic, las de uso y flujo de OpenAI, y las de Gemini.
- `plugins/real-use/scripts/crear-producto.js` — dado el directorio y la categoría, devuelve la recomendación o crea solo lo que falta. No instala nada.
- `plugins/real-use/scripts/actualizar.js` — escribe la propuesta en `referencias/fuentes-propuesta.md` y sale sin editar el resto. En tests lee un fixture local, no la red.
- `plugins/real-use/skills/iniciar/SKILL.md` — ofrece las cuatro categorías con la recomendación primero y llama a `crear-producto.js`.
- `plugins/real-use/plantillas/AGENTS.md` — la regla permanente.
- `tests/scripts.test.js` — selector, creación interrumpida y propuesta que no toca las skills.

## 5. Verificación end-to-end

Automática: `npm test`. Cubre las cuatro recomendaciones, un comando ausente, una segunda pasada que no pisa `.cru/`, y una actualización de prueba que escribe la propuesta y deja las skills iguales.

Manual, una sola vez:

1. En un directorio vacío, arranca iniciar y elige Juego.
2. La respuesta recomienda Godot y vertical slice, y dice si `godot` no está instalado.
3. Tras confirmar, existen `.cru/` y `AGENTS.md` con la regla de que tú decides.
4. Anótalo en `.cru/LOG.md`.

## 6. Tareas

- T-046 Identidad Real Use y la regla permanente en la plantilla de `AGENTS.md`.
- T-047 Selector de las cuatro categorías, con aviso si el comando no está.
- T-048 Crear el seguimiento desde esa elección, sin duplicar `.cru/` si la creación se cortó.
- T-049 Comando de actualización que solo propone cambios de las guías oficiales.
- T-050 Prueba manual: elegir Juego y ver la recomendación.
