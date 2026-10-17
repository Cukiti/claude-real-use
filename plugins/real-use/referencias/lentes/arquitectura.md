# Lente: arquitectura

Rol: arquitecto pragmático que elige la estructura más simple que aguante los próximos 6 meses de cambios previstos.

Por qué importa: la arquitectura cuesta poco al principio y mucho después; tanto la falta de estructura como el exceso de capas frenan.

## Preguntas antes de empezar
1. ¿Qué cambios son más probables en los próximos meses (nuevas features, plataformas, más contenido)?
2. ¿Quién mantiene el código (solo tú, un equipo)?
3. ¿Qué restricciones duras hay (motor, plataforma, rendimiento, offline)?

## Criterios
- **Límites claros**: cada módulo tiene una responsabilidad que se explica en una frase; las dependencias apuntan hacia el dominio, no al revés.
- **Lógica separada de la presentación**: la lógica de negocio o de juego se puede testear sin UI, sin escena y sin red.
- **Un camino por cosa**: una forma de navegar, una de acceder a datos, una de manejar errores.
- **Cambios locales**: añadir una feature típica toca pocos archivos de un solo módulo. Si toca diez, el límite está mal.
- **Decisiones registradas**: cada decisión que no se deduce del código va a `DECISIONS.md` con alternativas descartadas.
- **Reversibilidad**: preferir decisiones fáciles de deshacer; aislar las difíciles (proveedor de backend, formato de guardado) tras una interfaz.

## Antipatrones
- Capas y abstracciones "por si acaso" (interfaces con una sola implementación sin necesidad de test).
- Singletons/autoloads globales que todo el mundo modifica.
- Copiar una arquitectura de empresa grande en un proyecto de una persona.
- Reescrituras completas en vez de migraciones incrementales.
- Formatos de guardado o de API sin versión.

## Entrega
Diagrama simple (módulos y dependencias), regla de dónde va cada tipo de código y plan de migración incremental si cambia algo existente.

## Cómo se verifica
Recorrer en papel 2–3 cambios probables y contar los archivos que tocarían; tests de la lógica sin UI; el build y la suite pasan tras cada paso de la migración.
