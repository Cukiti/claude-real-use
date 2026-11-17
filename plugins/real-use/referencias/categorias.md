# Categorías de producto

Cuatro filas, la recomendada primero. El script `scripts/crear-producto.js` las aplica; el detalle de cada metodología está en `metodologias.md` y las herramientas en `catalogo.md`. La persona decide: confirma o elige otra.

| Categoría | Recomendación | Metodología | Verificación |
|---|---|---|---|
| Juego | Godot | Vertical slice, fase Prototipo | `godot --headless` si el comando existe |
| Móvil | Android con Gradle | MVP por features | `gradlew test` si el comando existe |
| Web | El stack detectado; directorio vacío: sitio estático | Kanban (sitio) o Shape Up ligero (producto) | El comando detectado, o abrir el HTML |
| Escritorio | El lenguaje detectado; ninguno: herramienta Node | TDD + semver (herramienta) o MVP por features (con pantallas) | `npm test` si hay `package.json`; si no, el detectado |

Si el comando recomendado no está en el PATH, el resultado lo dice en una línea, la primera tarea es instalarlo la persona y no se afirma que el proyecto corre.
