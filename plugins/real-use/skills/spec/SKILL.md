---
name: spec
description: Convierte una idea vaga de feature en una especificación ejecutable (.cru/specs/<nombre>.md) entrevistando al usuario con opciones, y la descompone en tareas verificables. Usar para features grandes, ambiguas o que tocan varios archivos, antes de escribir código.
argument-hint: "<idea de la feature>"
---

# Spec por entrevista

Idea: $ARGUMENTS

Con una spec precisa, el resultado depende mucho menos del effort y del modelo: el tiempo invertido aquí es el más rentable de todo el ciclo.

## 1. Entrevista

- Lee lo mínimo para no preguntar obviedades (`.cru/PROJECT.md`, y los archivos que la idea nombra). Para entender un área grande, usa `real-use:explorador`.
- Usa `AskUserQuestion`: hasta 4 preguntas por ronda, 2–4 opciones cada una, recomendada primero. Ve a lo difícil: casos límite, estados de error, datos persistidos, rendimiento, UX en pantallas pequeñas, qué pasa si se interrumpe, compatibilidad con lo existente.
- No preguntes por estilo de código ni cosas que decides tú. Para cuando ya no haya decisiones de producto abiertas (normalmente 2–3 rondas).

## 2. Escribir `.cru/specs/<nombre-kebab>.md`

Secciones, cortas:
1. **Objetivo** (una frase) y **fuera de alcance**.
2. **Comportamiento**: lista de reglas observables ("cuando X, entonces Y").
3. **Casos límite** decididos en la entrevista.
4. **Archivos e interfaces** que se tocan (rutas reales).
5. **Verificación end-to-end**: el comando o procedimiento exacto que demuestra que funciona.
6. **Tareas**: 3–10 tareas en el formato de `TASKS.md`, cada una con `hecho:` y `verif:`.

## 3. Integrar

- Añade las tareas a `.cru/TASKS.md` bajo "Pendiente" con referencia a la spec (`· spec: specs/<nombre>.md`).
- Registra en `DECISIONS.md` cualquier decisión de producto no obvia.
- Recomienda implementar en una **sesión nueva** (`/clear` o nueva sesión): el contexto de la entrevista ya no hace falta, la spec lo contiene todo. Da el prompt exacto: `"/real-use:siguiente <primer ID>"`.
