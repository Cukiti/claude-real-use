# Metodologías por tipo de producto

Cada metodología define **fases** (van a `Fase:` en `PROJECT.md`), un **criterio de salida** por fase y el **tipo de verificación** que hace falta. Elige la que encaje; no hay que seguirla de forma religiosa, sino usarla para que el trabajo converja a "terminado".

Principio común: trabaja en rebanadas verticales (algo pequeño que funciona de punta a punta) antes de ensanchar. Lo que no se puede verificar no se puede dar por terminado.

---

## Juegos

### Vertical slice → producción por hitos (recomendado para indies/solos)
| Fase | Criterio de salida | Verificación |
|---|---|---|
| Prototipo | El bucle principal es divertido en 2 minutos con placeholders | Partida jugable; nota del usuario "es divertido / no" |
| Vertical slice | Un nivel con calidad final: arte, sonido, UI, guardado | Build ejecutable sin errores; checklist de la rebanada |
| Producción | Todo el contenido del alcance, sin bugs bloqueantes | Tests de sistemas (GUT/gdUnit en Godot, Unity Test Framework) + playtest por nivel |
| Pulido / beta | Rendimiento objetivo en el dispositivo más débil, sin crashes | Perfilado; sesión de 30 min sin crash |
| Lanzamiento | Build firmada, página de tienda, guardados compatibles | Build de release instalada en dispositivo real |

Notas: una tarea de juego = una mecánica, una pantalla o un sistema. Separa lógica de juego (testeable sin escena) de presentación. Tests headless del motor como `Verificación:` (p. ej. `godot --headless -s addons/gut/gut_cmdln.gd`). Corta el alcance antes de producción: el enemigo #1 de los juegos indie es el alcance.

### Game jam / prototipo rápido
Fases: Idea → Bucle jugable → Contenido mínimo → Envío. Effort low, iterar con capturas, sin tests salvo en sistemas que fallan.

---

## Apps móviles

### MVP por features + release train (recomendado)
| Fase | Criterio de salida | Verificación |
|---|---|---|
| Fundaciones | Arquitectura, navegación, DI, tema, CI que compila | Build debug + tests unitarios vacíos en CI |
| MVP | Las 3–5 features núcleo funcionan offline/online | Tests unitarios (ViewModel/UseCase) + UI tests del flujo principal |
| Beta cerrada | Crash-free, analítica, permisos y casos de red | Pruebas en dispositivo real/emulador; Firebase Test Lab o similar |
| Release | Firma, tamaño, accesibilidad, ficha de tienda | Build release (AAB/IPA) instalada; checklist de tienda |
| Iteración | Ciclos de 1–2 semanas con métricas | Métricas + tests de regresión |

Notas: una feature = capa de datos → dominio → UI → wiring, cada una tarea. Para Android/KMP/iOS hay agentes y skills especializados en el plugin `everything-claude-code-mobile` (si está instalado).

---

## Web (sitio, SaaS, frontend)

### Shape Up ligero (recomendado para producto)
| Fase | Criterio de salida | Verificación |
|---|---|---|
| Shaping | Spec por feature con límites claros (`/real-use:spec`) | Spec aprobada |
| Ciclo (1–3 semanas) | Features del ciclo desplegadas tras flag o en preview | Tests + e2e del flujo + captura comparada con diseño |
| Cool-down | Deuda y bugs del ciclo cerrados | `/real-use:pendientes` sin riesgo de pérdida |

### Kanban (recomendado para sitios y mantenimiento)
Sin fases fijas: columnas = estados de `TASKS.md`. Límite: una tarea en curso por sesión. Verificación: build + Lighthouse/accesibilidad + captura.

---

## Backend / API

### Contract-first
| Fase | Criterio de salida | Verificación |
|---|---|---|
| Contrato | OpenAPI/esquemas y errores definidos | Validación del esquema |
| Implementación | Endpoints que cumplen el contrato | Tests de contrato + integración con BD real o contenedor |
| Endurecimiento | Auth, límites, observabilidad, migraciones reversibles | `/security-review` + tests de casos hostiles |
| Operación | Despliegue reproducible y rollback de un paso | Despliegue a staging + smoke test |

---

## Librería / CLI / SDK

### TDD + semver
Fases: API pública → Núcleo con tests → Documentación con ejemplos ejecutables → Release. Verificación: suite de tests + ejemplos de la doc ejecutados. Cada cambio de API pública pasa por `DECISIONS.md`.

---

## Datos / ML / scripts de análisis

### Bitácora de experimentos
Fases: Pregunta → Datos limpios → Línea base → Experimentos → Informe. Cada experimento es una tarea con hipótesis, métrica y resultado anotado en `LOG.md`. Verificación: script reproducible que regenera la métrica. Si dos formas de preparar los datos dan resultados distintos, investigar por qué antes de seguir.

---

## Elegir rápido

| Si… | Metodología |
|---|---|
| Juego y aún no sabes si es divertido | Vertical slice (empieza en Prototipo) |
| App con pocas features claras | MVP por features |
| Producto web con ideas grandes | Shape Up ligero |
| Sitio, mantenimiento, muchas tareas pequeñas | Kanban |
| Otros sistemas consumen lo que haces | Contract-first |
| Código que usarán otros programadores | TDD + semver |
