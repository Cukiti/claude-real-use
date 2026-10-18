---
name: experto
description: Aplicar criterio experto (diseño UI, game design, pixel art, rendimiento, seguridad, arquitectura, QA, producto, lanzamiento) con sus criterios, antipatrones y verificación. Usar cuando pidan crear o revisar algo "como un experto en X".
argument-hint: "[lente] [crear|revisar] <tarea>"
---

# Lente experta

Petición: $ARGUMENTS

Un título ("eres un diseñador gráfico experto") ajusta el tono, pero lo que cambia el resultado es lo que ese experto **sabe mirar**: sus criterios, los errores que reconoce al instante y cómo comprueba su trabajo. Cada lente de `${CLAUDE_PLUGIN_ROOT}/referencias/lentes/` contiene exactamente eso.

## 1. Elegir la lente

Lentes disponibles (archivo `<nombre>.md`):

| Lente | Cuándo |
|---|---|
| `diseno-ui` | Pantallas, componentes, landing, dashboards, jerarquía visual, copy de interfaz |
| `game-design` | Mecánicas, bucle de juego, progresión, dificultad, feel |
| `arte-pixel` | Sprites, tilesets, animaciones, paletas, assets 2D |
| `rendimiento` | Lentitud, FPS, memoria, tiempo de carga, tamaño de build |
| `seguridad` | Auth, datos de usuarios, pagos, entradas externas, secretos |
| `arquitectura` | Estructura de módulos, dependencias, cambios grandes, deuda |
| `qa` | Encontrar cómo romperlo: casos límite, estados, regresiones |
| `producto` | Qué construir, alcance, MVP, qué cortar, prioridades |
| `lanzamiento` | Publicar en tiendas o en producción, checklist de release |

- Si el usuario nombró una lente, úsala. Si no, elige la que encaje con la tarea. Si dudas entre dos, combínalas (máximo 2: más lentes diluyen la atención).
- Lee **solo** el archivo o archivos elegidos.

## 2. Modo

- **crear** (por defecto si la tarea es hacer algo): antes de empezar, responde las "preguntas antes de empezar" de la lente con lo que ya sabes; pregunta al usuario solo lo que falte, con `AskUserQuestion` y opciones. Trabaja aplicando los criterios y evitando los antipatrones. Entrega lo que pide la sección "Entrega".
- **revisar** (si la tarea es evaluar algo existente): lanza el subagente `real-use:revisor` indicándole la ruta de la lente (`${CLAUDE_PLUGIN_ROOT}/referencias/lentes/<nombre>.md`) y qué revisar. Devuelve los hallazgos ordenados por impacto.

## 3. Verificar

Aplica la sección "Cómo se verifica" de la lente. Muestra la evidencia. Si la verificación necesita al usuario (por ejemplo, el feel de un juego), prepara la build y una lista corta de qué probar.

## 4. Si el proyecto usa .cru/

Anota en `DECISIONS.md` las decisiones de criterio que conviene no reabrir (paleta elegida, presupuesto de rendimiento, alcance del MVP).
