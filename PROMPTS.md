# Prompts para copiar y pegar

Cada prompt sigue la misma forma: **qué hacer · qué significa terminado · cómo comprobarlo · cuándo parar a preguntar**. Cambia lo que va entre `<>`. Si usas el plugin, la mayoría ya están dentro de un comando `/real-use:…`.

---

### Arreglar un bug
```
<síntoma exacto, con el error pegado>. Probablemente está en <carpeta/archivo>.
Primero escribe un test que reproduzca el fallo y enséñame que falla.
Después arregla la causa raíz (no silencies el error) y enséñame el test pasando junto con <comando de verificación>.
```

### Feature pequeña y clara
```
Añade <feature> en <archivo>, siguiendo el patrón de <archivo de ejemplo>.
Terminado = <comportamiento observable>. Verifica con <comando>.
No toques <lo que no debe cambiar>.
```

### Feature grande o ambigua
```
/real-use:spec <idea en una frase>
```
(O sin plugin: "Quiero construir <idea>. Entrevístame en detalle con AskUserQuestion sobre implementación, UX, casos límite y compromisos. No preguntes lo obvio. Cuando terminemos, escribe la spec completa en SPEC.md.") Después, **sesión nueva**: "Implementa SPEC.md".

### Entender código sin llenar el contexto
```
Usa un subagente para investigar <pregunta> en <carpeta>.
Devuélveme solo la respuesta y las referencias archivo:línea.
```

### Revisión antes de commit
```
Revisa el diff de esta rama contra main con un subagente en contexto fresco.
Lista solo lo que bloquearía el merge: archivo y línea, por qué está mal y cómo demostrar el fallo.
```

### Refactor o migración en muchos archivos
```
/batch <instrucción precisa del cambio>. Verifica cada parte con <comando>.
```
Pruébalo antes a mano en 2 o 3 archivos y ajusta la instrucción.

### Trabajo largo hasta un objetivo medible (en modo auto)
```
/goal <condición verificable, p. ej. "npm test sale con 0 y npm run lint no da errores">, sin modificar <lo que no debe cambiar>, o para tras 20 turnos
```

### Implementar un diseño (UI)
```
[pega la captura] Implementa este diseño en <componente>.
Después haz una captura del resultado con el navegador, compárala con el original, lista las diferencias y corrígelas.
Evita <patrones concretos que no quieres: fondos crema, botones píldora, etiquetas 01/02/03…>.
```

### Retomar un proyecto
```
/real-use:siguiente
```
(O sin plugin: "Lee TASKS.md y la última entrada de LOG.md. Continúa la tarea en curso; si no hay, toma la siguiente pendiente.")

### Cerrar el día
```
/real-use:cerrar
```

### Pregunta rápida sin ensuciar el contexto
```
/btw <pregunta>
```

---

## Qué no escribir

| En vez de | Escribe |
|---|---|
| "Piensa paso a paso" o "piensa con cuidado" | Nada: el modelo ya razona. Sube `/effort` si de verdad hace falta |
| "Mejora este código" | Qué mejorar, en qué archivo y cómo sabrás que mejoró |
| "Arregla el build" | El error pegado + "arregla la causa raíz y comprueba que el build pasa" |
| "Hazlo bien esta vez" (tercera corrección) | `/clear` y un prompt nuevo con lo aprendido |
| "Evita que se vea genérico" | La lista concreta de patrones que no quieres |
