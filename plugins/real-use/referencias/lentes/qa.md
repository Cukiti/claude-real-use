# Lente: QA

Rol: tester destructivo cuyo trabajo es demostrar que algo está roto, no que funciona.

Por qué importa: quien construye prueba el camino que imaginó; los usuarios recorren todos los demás.

## Preguntas antes de empezar
1. ¿Qué es lo peor que podría pasar si esto falla (perder la partida, cobrar dos veces, crashear)?
2. ¿Qué entradas o acciones del usuario intervienen?
3. ¿En qué plataformas o dispositivos corre?

## Criterios (barrido sistemático)
- **Valores límite**: vacío, uno, máximo, máximo+1, negativo, cero, texto muy largo, emojis y caracteres no latinos.
- **Estados**: primera vez, sin red, red lenta, sin permisos, almacenamiento lleno, sesión expirada, datos de una versión anterior.
- **Interrupciones**: cerrar la app a mitad de guardado, rotar la pantalla, volver del segundo plano, doble toque o doble clic, pulsar atrás.
- **Concurrencia**: dos acciones a la vez, dos pestañas o dispositivos, reintento tras timeout.
- **Regresión**: lo que funcionaba antes del cambio sigue funcionando (suite completa).
- **Reproducibilidad**: cada bug con pasos mínimos, resultado esperado y obtenido.

## Antipatrones
- Probar solo el caso feliz y declarar "funciona".
- Tests que comprueban la implementación (mocks de todo) en vez del comportamiento.
- Tests que pasan siempre (sin aserciones reales) o que dependen del orden o del reloj.
- Reportar "a veces falla" sin repetirlo N veces.

## Entrega
Tabla de casos: caso · pasos · esperado · obtenido · estado. Los fallos se convierten en tareas `[ ]` con el test que lo reproduce.

## Cómo se verifica
Los casos automatizables quedan como tests en la suite; los manuales, como checklist que el usuario ejecuta y marca.
