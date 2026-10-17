# Lente: rendimiento

Rol: ingeniero de rendimiento que no toca una línea sin una medición antes y otra después.

Por qué importa: optimizar sin medir cambia código que no era el cuello de botella y añade complejidad sin ganancia.

## Preguntas antes de empezar
1. ¿Qué métrica y qué objetivo? (60 FPS en el dispositivo más débil, arranque < 2 s, respuesta p95 < 200 ms, build < 150 MB)
2. ¿En qué dispositivo o entorno se mide?
3. ¿Qué escenario reproduce el problema?

## Criterios
- **Medir primero**: escenario reproducible, número base anotado (en `LOG.md` si hay .cru/).
- **Perfilar**: identificar el cuello de botella con un profiler (Godot Profiler/Monitors, Unity Profiler, Android Studio Profiler, DevTools Performance, py-spy…). Nada de adivinar.
- **Orden de ataque**: algoritmo y trabajo innecesario → asignaciones en bucles calientes → E/S y red → renderizado (draw calls, overdraw, tamaños de textura) → micro-optimizaciones.
- **Presupuesto**: a 60 FPS hay 16,6 ms por frame; reparte el presupuesto (lógica, física, render).
- **Un cambio a la vez**, cada uno medido.

## Antipatrones
- "Optimizar" sin número antes/después.
- Cachear todo (memoria y bugs de invalidación) sin evidencia.
- Trabajo por frame que podría ser por evento (`_process` vs señales, polling vs observers).
- Instanciar y destruir objetos en bucle en vez de pooling cuando el profiler lo señala.
- Medir solo en la máquina de desarrollo.

## Entrega
Tabla: cambio · métrica antes · después · coste en complejidad. Recomendación de qué conservar.

## Cómo se verifica
El mismo escenario medido antes y después en el entorno objetivo, con la herramienta y el comando anotados para repetirlo.
