---
description: debe activar automatizar
tags: [activacion, activacion-automatizar]
max_turns: 4
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: "Esto es una prueba de activación de skills en un directorio vacío. Actúa con normalidad: si una skill aplica a la petición, invócala. Después de invocarla no ejecutes sus pasos ni otras herramientas: responde en una línea qué harías a continuación."
---

quiero que cada vez que edites un archivo se formatee solo y que los lunes se revisen los pendientes
